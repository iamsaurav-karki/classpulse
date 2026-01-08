import { pool } from '../../config/database';

export interface CreateNotificationData {
  userId: string;
  type: 'answer' | 'comment' | 'support' | 'announcement';
  title: string;
  message: string;
  link?: string;
}

export const createNotification = async (data: CreateNotificationData) => {
  const { userId, type, message, link } = data;
  const title = data.title || 'New Notification';

  const result = await pool.query(
    `INSERT INTO notifications (user_id, type, title, message, link)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, type, title, message, link || null]
  );

  return result.rows[0];
};

export const getUserNotifications = async (userId: string, unreadOnly: boolean = false) => {
  let query = `
    SELECT * FROM notifications
    WHERE user_id = $1
  `;
  const params: any[] = [userId];

  if (unreadOnly) {
    query += ` AND is_read = false`;
  }

  query += ` ORDER BY created_at DESC LIMIT 50`;

  const result = await pool.query(query, params);
  return result.rows;
};

export const markAsRead = async (notificationId: string, userId: string) => {
  const result = await pool.query(
    `UPDATE notifications 
     SET is_read = true
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [notificationId, userId]
  );

  if (result.rows.length === 0) {
    throw new Error('Notification not found');
  }

  return result.rows[0];
};

export const markAllAsRead = async (userId: string) => {
  const result = await pool.query(
    `UPDATE notifications 
     SET is_read = true
     WHERE user_id = $1 AND is_read = false
     RETURNING id`,
    [userId]
  );

  return result.rows.length;
};

export const getUnreadCount = async (userId: string) => {
  const result = await pool.query(
    `SELECT COUNT(*) as count FROM notifications
     WHERE user_id = $1 AND is_read = false`,
    [userId]
  );

  return parseInt(result.rows[0].count);
};

