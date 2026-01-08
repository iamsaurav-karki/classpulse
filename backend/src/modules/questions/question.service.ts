import { pool } from '../../config/database';
import { incrementSubjectUsage } from '../subjects/subject.service';

export interface CreateQuestionData {
  userId: string;
  title: string;
  description: string;
  subject?: string;
  category?: string;
}

export interface QuestionFilters {
  subject?: string;
  category?: string;
  isSolved?: boolean;
  userId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export const createQuestion = async (data: CreateQuestionData) => {
  const { userId, title, description, subject, category } = data;

  const result = await pool.query(
    `INSERT INTO questions (user_id, title, description, subject, category)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, title, description, subject || null, category || null]
  );

  // Increment subject usage count if subject is provided
  if (subject) {
    await incrementSubjectUsage(subject).catch((err) => {
      console.error('Failed to increment subject usage:', err);
      // Don't fail the question creation if this fails
    });
  }

  return result.rows[0];
};

export const getQuestions = async (filters: QuestionFilters = {}) => {
  const {
    subject,
    category,
    isSolved,
    userId,
    search,
    limit = 20,
    offset = 0,
  } = filters;

  let query = `
    SELECT 
      q.*,
      u.name as author_name,
      u.profile_picture_url as author_avatar,
      COUNT(DISTINCT a.id) as answer_count,
      COUNT(DISTINCT v.id) as total_votes
    FROM questions q
    LEFT JOIN users u ON q.user_id = u.id
    LEFT JOIN answers a ON q.id = a.question_id
    LEFT JOIN votes v ON a.id = v.answer_id
    WHERE 1=1
  `;
  const params: any[] = [];
  let paramCount = 1;

  if (subject) {
    query += ` AND q.subject = $${paramCount}`;
    params.push(subject);
    paramCount++;
  }

  if (category) {
    query += ` AND q.category = $${paramCount}`;
    params.push(category);
    paramCount++;
  }

  if (isSolved !== undefined) {
    query += ` AND q.is_solved = $${paramCount}`;
    params.push(isSolved);
    paramCount++;
  }

  if (userId) {
    query += ` AND q.user_id = $${paramCount}`;
    params.push(userId);
    paramCount++;
  }

  if (search) {
    query += ` AND (q.title ILIKE $${paramCount} OR q.description ILIKE $${paramCount})`;
    params.push(`%${search}%`);
    paramCount++;
  }

  query += ` GROUP BY q.id, u.name, u.profile_picture_url`;
  query += ` ORDER BY q.created_at DESC`;
  query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  // Get total count with same filters
  let countQuery = `
    SELECT COUNT(DISTINCT q.id) as total
    FROM questions q
    WHERE 1=1
  `;
  const countParams: any[] = [];
  let countParamCount = 1;

  if (subject) {
    countQuery += ` AND q.subject = $${countParamCount}`;
    countParams.push(subject);
    countParamCount++;
  }

  if (category) {
    countQuery += ` AND q.category = $${countParamCount}`;
    countParams.push(category);
    countParamCount++;
  }

  if (isSolved !== undefined) {
    countQuery += ` AND q.is_solved = $${countParamCount}`;
    countParams.push(isSolved);
    countParamCount++;
  }

  if (userId) {
    countQuery += ` AND q.user_id = $${countParamCount}`;
    countParams.push(userId);
    countParamCount++;
  }

  if (search) {
    countQuery += ` AND (q.title ILIKE $${countParamCount} OR q.description ILIKE $${countParamCount})`;
    countParams.push(`%${search}%`);
    countParamCount++;
  }

  const [result, countResult] = await Promise.all([
    pool.query(query, params),
    pool.query(countQuery, countParams),
  ]);

  return {
    data: result.rows,
    total: parseInt(countResult.rows[0].total),
    limit,
    offset,
  };
};

export const getQuestionById = async (questionId: string) => {
  const result = await pool.query(
    `SELECT 
      q.*,
      u.name as author_name,
      u.profile_picture_url as author_avatar,
      u.role as author_role
    FROM questions q
    LEFT JOIN users u ON q.user_id = u.id
    WHERE q.id = $1`,
    [questionId]
  );

  if (result.rows.length === 0) {
    throw new Error('Question not found');
  }

  // Get images
  const imagesResult = await pool.query(
    'SELECT * FROM question_images WHERE question_id = $1',
    [questionId]
  );

  // Transform image URLs to full URLs
  const { getImageUrl } = require('../../utils/imageUrl');
  const images = imagesResult.rows.map((img: any) => ({
    ...img,
    imageUrl: getImageUrl(img.image_url),
  }));

  return {
    ...result.rows[0],
    images,
  };
};

export const updateQuestion = async (questionId: string, userId: string, data: Partial<CreateQuestionData>) => {
  const updates: string[] = [];
  const params: any[] = [];
  let paramCount = 1;

  if (data.title) {
    updates.push(`title = $${paramCount++}`);
    params.push(data.title);
  }
  if (data.description) {
    updates.push(`description = $${paramCount++}`);
    params.push(data.description);
  }
  if (data.subject !== undefined) {
    updates.push(`subject = $${paramCount++}`);
    params.push(data.subject);
  }
  if (data.category !== undefined) {
    updates.push(`category = $${paramCount++}`);
    params.push(data.category);
  }

  if (updates.length === 0) {
    throw new Error('No fields to update');
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  params.push(questionId, userId);

  const result = await pool.query(
    `UPDATE questions 
     SET ${updates.join(', ')}
     WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
     RETURNING *`,
    params
  );

  if (result.rows.length === 0) {
    throw new Error('Question not found or unauthorized');
  }

  return result.rows[0];
};

export const deleteQuestion = async (questionId: string, userId: string, userRole: string) => {
  // Only allow deletion by owner or admin
  const result = await pool.query(
    `DELETE FROM questions 
     WHERE id = $1 AND (user_id = $2 OR $3 = 'admin')
     RETURNING id`,
    [questionId, userId, userRole]
  );

  if (result.rows.length === 0) {
    throw new Error('Question not found or unauthorized');
  }

  return true;
};

export const addQuestionImage = async (questionId: string, imageUrl: string, fileName: string, fileSize: number) => {
  const result = await pool.query(
    `INSERT INTO question_images (question_id, image_url, file_name, file_size)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [questionId, imageUrl, fileName, fileSize]
  );

  return result.rows[0];
};

export const markQuestionAsSolved = async (questionId: string, answerId: string) => {
  const result = await pool.query(
    `UPDATE questions 
     SET is_solved = true, accepted_answer_id = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING *`,
    [answerId, questionId]
  );

  if (result.rows.length === 0) {
    throw new Error('Question not found');
  }

  return result.rows[0];
};

