import { pool } from '../../config/database';
import { incrementSubjectUsage } from '../subjects/subject.service';

export interface CreateNoteData {
  userId: string;
  title: string;
  description?: string;
  subject?: string;
  chapter?: string;
  classGrade?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}

export interface NoteFilters {
  subject?: string;
  chapter?: string;
  classGrade?: string;
  userId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export const createNote = async (data: CreateNoteData) => {
  const {
    userId,
    title,
    description,
    subject,
    chapter,
    classGrade,
    fileUrl,
    fileName,
    fileType,
    fileSize,
  } = data;

  const result = await pool.query(
    `INSERT INTO notes (user_id, title, description, subject, chapter, class_grade, file_url, file_name, file_type, file_size)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [userId, title, description || null, subject || null, chapter || null, classGrade || null, fileUrl || null, fileName || null, fileType || null, fileSize || null]
  );

  // Increment subject usage count if subject is provided
  if (subject) {
    await incrementSubjectUsage(subject).catch((err) => {
      console.error('Failed to increment subject usage:', err);
      // Don't fail the note creation if this fails
    });
  }

  return result.rows[0];
};

export const getNotes = async (filters: NoteFilters = {}) => {
  const {
    subject,
    chapter,
    classGrade,
    userId,
    search,
    limit = 20,
    offset = 0,
  } = filters;

  let query = `
    SELECT 
      n.*,
      u.name as author_name,
      u.profile_picture_url as author_avatar
    FROM notes n
    LEFT JOIN users u ON n.user_id = u.id
    WHERE 1=1
  `;
  const params: any[] = [];
  let paramCount = 1;

  if (subject) {
    query += ` AND n.subject = $${paramCount}`;
    params.push(subject);
    paramCount++;
  }

  if (chapter) {
    query += ` AND n.chapter = $${paramCount}`;
    params.push(chapter);
    paramCount++;
  }

  if (classGrade) {
    query += ` AND n.class_grade = $${paramCount}`;
    params.push(classGrade);
    paramCount++;
  }

  if (userId) {
    query += ` AND n.user_id = $${paramCount}`;
    params.push(userId);
    paramCount++;
  }

  if (search) {
    query += ` AND (n.title ILIKE $${paramCount} OR n.description ILIKE $${paramCount})`;
    params.push(`%${search}%`);
    paramCount++;
  }

  query += ` ORDER BY n.created_at DESC`;
  query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  // Get total count with same filters
  let countQuery = `
    SELECT COUNT(*) as total
    FROM notes n
    WHERE 1=1
  `;
  const countParams: any[] = [];
  let countParamCount = 1;

  if (subject) {
    countQuery += ` AND n.subject = $${countParamCount}`;
    countParams.push(subject);
    countParamCount++;
  }

  if (chapter) {
    countQuery += ` AND n.chapter = $${countParamCount}`;
    countParams.push(chapter);
    countParamCount++;
  }

  if (classGrade) {
    countQuery += ` AND n.class_grade = $${countParamCount}`;
    countParams.push(classGrade);
    countParamCount++;
  }

  if (userId) {
    countQuery += ` AND n.user_id = $${countParamCount}`;
    countParams.push(userId);
    countParamCount++;
  }

  if (search) {
    countQuery += ` AND (n.title ILIKE $${countParamCount} OR n.description ILIKE $${countParamCount})`;
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

export const getNoteById = async (noteId: string) => {
  const result = await pool.query(
    `SELECT 
      n.*,
      u.name as author_name,
      u.profile_picture_url as author_avatar,
      u.role as author_role
    FROM notes n
    LEFT JOIN users u ON n.user_id = u.id
    WHERE n.id = $1`,
    [noteId]
  );

  if (result.rows.length === 0) {
    throw new Error('Note not found');
  }

  return result.rows[0];
};

export const updateNote = async (noteId: string, userId: string, data: Partial<CreateNoteData>) => {
  const updates: string[] = [];
  const params: any[] = [];
  let paramCount = 1;

  if (data.title) {
    updates.push(`title = $${paramCount++}`);
    params.push(data.title);
  }
  if (data.description !== undefined) {
    updates.push(`description = $${paramCount++}`);
    params.push(data.description);
  }
  if (data.subject !== undefined) {
    updates.push(`subject = $${paramCount++}`);
    params.push(data.subject);
  }
  if (data.chapter !== undefined) {
    updates.push(`chapter = $${paramCount++}`);
    params.push(data.chapter);
  }
  if (data.classGrade !== undefined) {
    updates.push(`class_grade = $${paramCount++}`);
    params.push(data.classGrade);
  }

  if (updates.length === 0) {
    throw new Error('No fields to update');
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  params.push(noteId, userId);

  const result = await pool.query(
    `UPDATE notes 
     SET ${updates.join(', ')}
     WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
     RETURNING *`,
    params
  );

  if (result.rows.length === 0) {
    throw new Error('Note not found or unauthorized');
  }

  return result.rows[0];
};

export const deleteNote = async (noteId: string, userId: string, userRole: string) => {
  const result = await pool.query(
    `DELETE FROM notes 
     WHERE id = $1 AND (user_id = $2 OR $3 = 'admin')
     RETURNING id`,
    [noteId, userId, userRole]
  );

  if (result.rows.length === 0) {
    throw new Error('Note not found or unauthorized');
  }

  return true;
};

export const incrementDownloadCount = async (noteId: string) => {
  const result = await pool.query(
    `UPDATE notes 
     SET download_count = download_count + 1
     WHERE id = $1
     RETURNING download_count`,
    [noteId]
  );

  if (result.rows.length === 0) {
    throw new Error('Note not found');
  }

  return result.rows[0].download_count;
};

