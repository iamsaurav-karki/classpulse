import { pool } from '../../config/database';
import { getImageUrl } from '../../utils/imageUrl';

export interface CreateAnswerData {
  questionId: string;
  userId: string;
  content: string;
}

export const createAnswer = async (data: CreateAnswerData) => {
  const { questionId, userId, content } = data;

  // Verify question exists
  const questionCheck = await pool.query('SELECT id FROM questions WHERE id = $1', [questionId]);
  if (questionCheck.rows.length === 0) {
    throw new Error('Question not found');
  }

  const result = await pool.query(
    `INSERT INTO answers (question_id, user_id, content)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [questionId, userId, content]
  );

  return result.rows[0];
};

export const getAnswersByQuestion = async (questionId: string) => {
  const result = await pool.query(
    `SELECT 
      a.*,
      u.name as author_name,
      u.profile_picture_url as author_avatar,
      u.role as author_role
    FROM answers a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.question_id = $1
    ORDER BY a.is_pinned DESC, a.is_accepted DESC, a.upvotes DESC, a.created_at ASC`,
    [questionId]
  );

  // Get files for each answer and transform URLs
  const answersWithFiles = await Promise.all(
    result.rows.map(async (answer) => {
      const filesResult = await pool.query(
        'SELECT * FROM answer_files WHERE answer_id = $1',
        [answer.id]
      );
      const files = filesResult.rows.map((file: any) => ({
        id: file.id,
        answerId: file.answer_id,
        fileUrl: getImageUrl(file.file_url),
        fileName: file.file_name,
        fileType: file.file_type,
        fileSize: file.file_size,
        uploadedAt: file.uploaded_at || file.created_at,
      }));
      return {
        ...answer,
        files: files.length > 0 ? files : [],
      };
    })
  );

  return answersWithFiles;
};

export const getAnswerById = async (answerId: string) => {
  const result = await pool.query(
    `SELECT 
      a.*,
      u.name as author_name,
      u.profile_picture_url as author_avatar,
      u.role as author_role
    FROM answers a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.id = $1`,
    [answerId]
  );

  if (result.rows.length === 0) {
    throw new Error('Answer not found');
  }

  const filesResult = await pool.query(
    'SELECT * FROM answer_files WHERE answer_id = $1',
    [answerId]
  );

  // Transform file URLs and structure
  const files = filesResult.rows.map((file: any) => ({
    id: file.id,
    answerId: file.answer_id,
    fileUrl: getImageUrl(file.file_url),
    fileName: file.file_name,
    fileType: file.file_type,
    fileSize: file.file_size,
    uploadedAt: file.uploaded_at || file.created_at,
  }));

  return {
    ...result.rows[0],
    files: files.length > 0 ? files : [],
  };
};

export const updateAnswer = async (answerId: string, userId: string, content: string) => {
  const result = await pool.query(
    `UPDATE answers 
     SET content = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2 AND user_id = $3
     RETURNING *`,
    [content, answerId, userId]
  );

  if (result.rows.length === 0) {
    throw new Error('Answer not found or unauthorized');
  }

  return result.rows[0];
};

export const deleteAnswer = async (answerId: string, userId: string, userRole: string) => {
  const result = await pool.query(
    `DELETE FROM answers 
     WHERE id = $1 AND (user_id = $2 OR $3 = 'admin')
     RETURNING id`,
    [answerId, userId, userRole]
  );

  if (result.rows.length === 0) {
    throw new Error('Answer not found or unauthorized');
  }

  return true;
};

export const addAnswerFile = async (
  answerId: string,
  fileUrl: string,
  fileName: string,
  fileType: string,
  fileSize: number
) => {
  const result = await pool.query(
    `INSERT INTO answer_files (answer_id, file_url, file_name, file_type, file_size)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [answerId, fileUrl, fileName, fileType, fileSize]
  );

  return result.rows[0];
};

export const voteAnswer = async (answerId: string, userId: string, voteType: 'upvote' | 'downvote') => {
  // Check if user already voted
  const existingVote = await pool.query(
    'SELECT * FROM votes WHERE answer_id = $1 AND user_id = $2',
    [answerId, userId]
  );

  if (existingVote.rows.length > 0) {
    // Update existing vote
    if (existingVote.rows[0].vote_type === voteType) {
      // Remove vote if clicking same vote type
      await pool.query(
        'DELETE FROM votes WHERE answer_id = $1 AND user_id = $2',
        [answerId, userId]
      );
      // Update answer vote count
      await pool.query(
        `UPDATE answers SET ${voteType === 'upvote' ? 'upvotes' : 'downvotes'} = ${voteType === 'upvote' ? 'upvotes' : 'downvotes'} - 1 WHERE id = $1`,
        [answerId]
      );
    } else {
      // Change vote type
      await pool.query(
        'UPDATE votes SET vote_type = $1 WHERE answer_id = $2 AND user_id = $3',
        [voteType, answerId, userId]
      );
      // Update answer vote counts
      await pool.query(
        `UPDATE answers 
         SET ${voteType === 'upvote' ? 'upvotes' : 'downvotes'} = ${voteType === 'upvote' ? 'upvotes' : 'downvotes'} + 1,
             ${voteType === 'upvote' ? 'downvotes' : 'upvotes'} = ${voteType === 'upvote' ? 'downvotes' : 'upvotes'} - 1
         WHERE id = $1`,
        [answerId]
      );
    }
  } else {
    // Create new vote
    await pool.query(
      'INSERT INTO votes (answer_id, user_id, vote_type) VALUES ($1, $2, $3)',
      [answerId, userId, voteType]
    );
    // Update answer vote count
    await pool.query(
      `UPDATE answers SET ${voteType === 'upvote' ? 'upvotes' : 'downvotes'} = ${voteType === 'upvote' ? 'upvotes' : 'downvotes'} + 1 WHERE id = $1`,
      [answerId]
    );
  }

  const answer = await getAnswerById(answerId);
  return answer;
};

export const acceptAnswer = async (
  answerId: string,
  questionId: string,
  userId: string,
  userRole: string
) => {
  // Get question details and user role
  const questionResult = await pool.query(
    `SELECT q.user_id, q.subject, u.role as question_author_role
     FROM questions q
     LEFT JOIN users u ON q.user_id = u.id
     WHERE q.id = $1`,
    [questionId]
  );

  if (questionResult.rows.length === 0) {
    throw new Error('Question not found');
  }

  const question = questionResult.rows[0];
  const isQuestionOwner = question.user_id === userId;
  const isTeacher = userRole === 'teacher';
  const isAdmin = userRole === 'admin';

  // Check permissions: Question owner, teacher, or admin can accept
  if (!isQuestionOwner && !isTeacher && !isAdmin) {
    throw new Error('Only question owner, teachers, or admins can accept answers');
  }

  // Unaccept other answers
  await pool.query(
    'UPDATE answers SET is_accepted = false WHERE question_id = $1',
    [questionId]
  );

  // Accept this answer
  const result = await pool.query(
    `UPDATE answers 
     SET is_accepted = true, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [answerId]
  );

  // Mark question as solved
  await pool.query(
    `UPDATE questions 
     SET is_solved = true, accepted_answer_id = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [answerId, questionId]
  );

  return result.rows[0];
};

export const pinAnswer = async (answerId: string, userRole: string) => {
  if (userRole !== 'teacher' && userRole !== 'admin') {
    throw new Error('Only teachers and admins can pin answers');
  }

  const result = await pool.query(
    `UPDATE answers 
     SET is_pinned = NOT is_pinned, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [answerId]
  );

  if (result.rows.length === 0) {
    throw new Error('Answer not found');
  }

  return result.rows[0];
};

