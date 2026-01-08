import { pool } from '../../config/database';

// User Management
export const getAllUsers = async (filters: {
  role?: string;
  isActive?: boolean;
  isVerified?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
}) => {
  const { role, isActive, isVerified, limit = 50, offset = 0, search } = filters;

  let query = `
    SELECT 
      id, email, name, role, bio, profile_picture_url, subjects,
      is_verified, is_active, created_at, updated_at
    FROM users
    WHERE 1=1
  `;
  const params: any[] = [];
  let paramCount = 1;

  if (role) {
    query += ` AND role = $${paramCount}`;
    params.push(role);
    paramCount++;
  }

  if (isActive !== undefined) {
    query += ` AND is_active = $${paramCount}`;
    params.push(isActive);
    paramCount++;
  }

  if (isVerified !== undefined) {
    query += ` AND is_verified = $${paramCount}`;
    params.push(isVerified);
    paramCount++;
  }

  if (search) {
    query += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
    params.push(`%${search}%`);
    paramCount++;
  }

  query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
};

export const getUserById = async (userId: string) => {
  const result = await pool.query(
    `SELECT id, email, name, role, bio, profile_picture_url, subjects,
     is_verified, is_active, created_at, updated_at
     FROM users WHERE id = $1`,
    [userId]
  );
  return result.rows[0];
};

export const suspendUser = async (userId: string) => {
  const result = await pool.query(
    `UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 RETURNING *`,
    [userId]
  );
  return result.rows[0];
};

export const activateUser = async (userId: string) => {
  const result = await pool.query(
    `UPDATE users SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 RETURNING *`,
    [userId]
  );
  return result.rows[0];
};

export const updateUserRole = async (userId: string, newRole: 'student' | 'teacher' | 'admin') => {
  const result = await pool.query(
    `UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2 RETURNING *`,
    [newRole, userId]
  );
  return result.rows[0];
};

// Teacher Verification
export const getPendingTeachers = async () => {
  const result = await pool.query(
    `SELECT id, email, name, bio, subjects, created_at
     FROM users
     WHERE role = 'teacher' AND is_verified = FALSE AND is_active = TRUE
     ORDER BY created_at ASC`
  );
  return result.rows;
};

export const approveTeacher = async (teacherId: string) => {
  const result = await pool.query(
    `UPDATE users SET is_verified = TRUE, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND role = 'teacher' RETURNING *`,
    [teacherId]
  );
  return result.rows[0];
};

export const rejectTeacher = async (teacherId: string) => {
  // Mark as rejected: set is_verified to FALSE and is_active to FALSE
  // This ensures rejected teachers cannot perform any operations
  const result = await pool.query(
    `UPDATE users 
     SET is_verified = FALSE, is_active = FALSE, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND role = 'teacher' 
     RETURNING *`,
    [teacherId]
  );
  return result.rows[0];
};

// Content Moderation
export const getAllQuestions = async (filters: {
  isLocked?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
}) => {
  const { isLocked, limit = 50, offset = 0, search } = filters;

  let query = `
    SELECT q.*, u.name as author_name, u.email as author_email
    FROM questions q
    LEFT JOIN users u ON q.user_id = u.id
    WHERE 1=1
  `;
  const params: any[] = [];
  let paramCount = 1;

  if (isLocked !== undefined) {
    query += ` AND q.is_locked = $${paramCount}`;
    params.push(isLocked);
    paramCount++;
  }

  if (search) {
    query += ` AND (q.title ILIKE $${paramCount} OR q.description ILIKE $${paramCount})`;
    params.push(`%${search}%`);
    paramCount++;
  }

  query += ` ORDER BY q.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
};

export const lockQuestion = async (questionId: string) => {
  const result = await pool.query(
    `UPDATE questions SET is_locked = TRUE, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 RETURNING *`,
    [questionId]
  );
  return result.rows[0];
};

export const unlockQuestion = async (questionId: string) => {
  const result = await pool.query(
    `UPDATE questions SET is_locked = FALSE, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 RETURNING *`,
    [questionId]
  );
  return result.rows[0];
};

export const deleteQuestion = async (questionId: string) => {
  const result = await pool.query('DELETE FROM questions WHERE id = $1 RETURNING *', [questionId]);
  return result.rows[0];
};

export const getAllAnswers = async (filters: {
  limit?: number;
  offset?: number;
  search?: string;
}) => {
  const { limit = 50, offset = 0, search } = filters;

  let query = `
    SELECT a.*, u.name as author_name, u.email as author_email, q.title as question_title
    FROM answers a
    LEFT JOIN users u ON a.user_id = u.id
    LEFT JOIN questions q ON a.question_id = q.id
    WHERE 1=1
  `;
  const params: any[] = [];
  let paramCount = 1;

  if (search) {
    query += ` AND a.content ILIKE $${paramCount}`;
    params.push(`%${search}%`);
    paramCount++;
  }

  query += ` ORDER BY a.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
};

export const deleteAnswer = async (answerId: string) => {
  const result = await pool.query('DELETE FROM answers WHERE id = $1 RETURNING *', [answerId]);
  return result.rows[0];
};

// Support Management
export const getAllSupportTickets = async (filters: {
  status?: string;
  ticketType?: string;
  limit?: number;
  offset?: number;
}) => {
  const { status, ticketType, limit = 50, offset = 0 } = filters;

  let query = `
    SELECT 
      t.*,
      u.name as author_name,
      u.email as author_email,
      a.name as assigned_to_name
    FROM support_tickets t
    LEFT JOIN users u ON t.user_id = u.id
    LEFT JOIN users a ON t.assigned_to = a.id
    WHERE 1=1
  `;
  const params: any[] = [];
  let paramCount = 1;

  if (status) {
    query += ` AND t.status = $${paramCount}`;
    params.push(status);
    paramCount++;
  }

  if (ticketType) {
    query += ` AND t.ticket_type = $${paramCount}`;
    params.push(ticketType);
    paramCount++;
  }

  query += ` ORDER BY t.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
};

// Analytics
export const getAnalytics = async () => {
  const [
    totalUsers,
    activeUsers,
    totalTeachers,
    verifiedTeachers,
    totalQuestions,
    totalAnswers,
    openTickets,
    pendingTeachers,
  ] = await Promise.all([
    pool.query('SELECT COUNT(*) as count FROM users'),
    pool.query("SELECT COUNT(*) as count FROM users WHERE is_active = TRUE"),
    pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'teacher'"),
    pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'teacher' AND is_verified = TRUE"),
    pool.query('SELECT COUNT(*) as count FROM questions'),
    pool.query('SELECT COUNT(*) as count FROM answers'),
    pool.query("SELECT COUNT(*) as count FROM support_tickets WHERE status != 'closed'"),
    pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'teacher' AND is_verified = FALSE AND is_active = TRUE"),
  ]);

  // Recent activity (last 7 days)
  const recentActivity = await pool.query(`
    SELECT 
      (SELECT COUNT(*) FROM questions WHERE created_at > NOW() - INTERVAL '7 days') as questions_7d,
      (SELECT COUNT(*) FROM answers WHERE created_at > NOW() - INTERVAL '7 days') as answers_7d,
      (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days') as users_7d
  `);

  return {
    users: {
      total: parseInt(totalUsers.rows[0].count),
      active: parseInt(activeUsers.rows[0].count),
    },
    teachers: {
      total: parseInt(totalTeachers.rows[0].count),
      verified: parseInt(verifiedTeachers.rows[0].count),
      pending: parseInt(pendingTeachers.rows[0].count),
    },
    content: {
      questions: parseInt(totalQuestions.rows[0].count),
      answers: parseInt(totalAnswers.rows[0].count),
    },
    support: {
      openTickets: parseInt(openTickets.rows[0].count),
    },
    recentActivity: recentActivity.rows[0],
  };
};

// Admin Audit Logging
export const createAdminLog = async (
  adminId: string,
  action: string,
  targetType: string | null,
  targetId: string | null,
  details: any = null,
  ipAddress?: string,
  userAgent?: string
) => {
  const result = await pool.query(
    `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [adminId, action, targetType, targetId, details ? JSON.stringify(details) : null, ipAddress, userAgent]
  );
  return result.rows[0];
};

export const getAdminLogs = async (filters: {
  adminId?: string;
  action?: string;
  limit?: number;
  offset?: number;
}) => {
  const { adminId, action, limit = 50, offset = 0 } = filters;

  let query = `
    SELECT 
      l.*,
      u.name as admin_name,
      u.email as admin_email
    FROM admin_logs l
    LEFT JOIN users u ON l.admin_id = u.id
    WHERE 1=1
  `;
  const params: any[] = [];
  let paramCount = 1;

  if (adminId) {
    query += ` AND l.admin_id = $${paramCount}`;
    params.push(adminId);
    paramCount++;
  }

  if (action) {
    query += ` AND l.action = $${paramCount}`;
    params.push(action);
    paramCount++;
  }

  query += ` ORDER BY l.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
};

