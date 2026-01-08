import { pool } from '../../config/database';

export interface CreateCommentData {
  answerId: string;
  userId: string;
  content: string;
}

export const createComment = async (data: CreateCommentData) => {
  const { answerId, userId, content } = data;

  const result = await pool.query(
    `INSERT INTO comments (answer_id, user_id, content)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [answerId, userId, content]
  );

  return result.rows[0];
};

export const getCommentsByAnswer = async (answerId: string) => {
  const result = await pool.query(
    `SELECT 
      c.*,
      u.name as author_name,
      u.profile_picture_url as author_avatar,
      u.role as author_role
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.answer_id = $1
    ORDER BY c.created_at ASC`,
    [answerId]
  );

  return result.rows;
};

export const updateComment = async (commentId: string, userId: string, content: string) => {
  const result = await pool.query(
    `UPDATE comments 
     SET content = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2 AND user_id = $3
     RETURNING *`,
    [content, commentId, userId]
  );

  if (result.rows.length === 0) {
    throw new Error('Comment not found or unauthorized');
  }

  return result.rows[0];
};

export const deleteComment = async (commentId: string, userId: string, userRole: string) => {
  const result = await pool.query(
    `DELETE FROM comments 
     WHERE id = $1 AND (user_id = $2 OR $3 = 'admin')
     RETURNING id`,
    [commentId, userId, userRole]
  );

  if (result.rows.length === 0) {
    throw new Error('Comment not found or unauthorized');
  }

  return true;
};

