import { pool } from '../../config/database';

export interface CreateTicketData {
  userId: string;
  title: string;
  description: string;
  ticketType: 'academic' | 'platform' | 'technical';
}

export interface TicketFilters {
  status?: string;
  ticketType?: string;
  userId?: string;
  assignedTo?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export const createTicket = async (data: CreateTicketData) => {
  const { userId, title, description, ticketType } = data;

  // Auto-assign based on ticket type
  let assignedTo: string | null = null;
  
  if (ticketType === 'academic') {
    // Find a teacher (preferably verified) - for now, assign to first available teacher
    // In production, you might want to assign based on subject matching
    const teacherResult = await pool.query(
      `SELECT id FROM users 
       WHERE role = 'teacher' AND is_active = true 
       ORDER BY is_verified DESC, created_at ASC 
       LIMIT 1`
    );
    if (teacherResult.rows.length > 0) {
      assignedTo = teacherResult.rows[0].id;
    }
  } else if (ticketType === 'platform' || ticketType === 'technical') {
    // Assign to admin
    const adminResult = await pool.query(
      `SELECT id FROM users 
       WHERE role = 'admin' AND is_active = true 
       LIMIT 1`
    );
    if (adminResult.rows.length > 0) {
      assignedTo = adminResult.rows[0].id;
    }
  }

  // If assigned, set status to in_progress, otherwise keep as open
  const status = assignedTo ? 'in_progress' : 'open';

  const result = await pool.query(
    `INSERT INTO support_tickets (user_id, title, description, ticket_type, status, assigned_to)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, title, description, ticketType, status, assignedTo]
  );

  return result.rows[0];
};

export const getTickets = async (filters: TicketFilters = {}) => {
  const {
    status,
    ticketType,
    userId,
    assignedTo,
    search,
    limit = 20,
    offset = 0,
  } = filters;

  let query = `
    SELECT 
      t.*,
      u.name as author_name,
      u.profile_picture_url as author_avatar,
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

  if (userId) {
    query += ` AND t.user_id = $${paramCount}`;
    params.push(userId);
    paramCount++;
  }

  if (assignedTo) {
    query += ` AND t.assigned_to = $${paramCount}`;
    params.push(assignedTo);
    paramCount++;
  }

  if (search) {
    query += ` AND (t.title ILIKE $${paramCount} OR t.description ILIKE $${paramCount} OR u.name ILIKE $${paramCount})`;
    params.push(`%${search}%`);
    paramCount++;
  }

  query += ` ORDER BY t.created_at DESC`;
  query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  // Get total count with same filters
  let countQuery = `
    SELECT COUNT(*) as total
    FROM support_tickets t
    LEFT JOIN users u ON t.user_id = u.id
    WHERE 1=1
  `;
  const countParams: any[] = [];
  let countParamCount = 1;

  if (status) {
    countQuery += ` AND t.status = $${countParamCount}`;
    countParams.push(status);
    countParamCount++;
  }

  if (ticketType) {
    countQuery += ` AND t.ticket_type = $${countParamCount}`;
    countParams.push(ticketType);
    countParamCount++;
  }

  if (userId) {
    countQuery += ` AND t.user_id = $${countParamCount}`;
    countParams.push(userId);
    countParamCount++;
  }

  if (assignedTo) {
    countQuery += ` AND t.assigned_to = $${countParamCount}`;
    countParams.push(assignedTo);
    countParamCount++;
  }

  if (search) {
    countQuery += ` AND (t.title ILIKE $${countParamCount} OR t.description ILIKE $${countParamCount} OR u.name ILIKE $${countParamCount})`;
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

export const getTicketById = async (ticketId: string) => {
  const result = await pool.query(
    `SELECT 
      t.*,
      u.name as author_name,
      u.profile_picture_url as author_avatar,
      u.email as author_email,
      a.name as assigned_to_name,
      a.email as assigned_to_email
    FROM support_tickets t
    LEFT JOIN users u ON t.user_id = u.id
    LEFT JOIN users a ON t.assigned_to = a.id
    WHERE t.id = $1`,
    [ticketId]
  );

  if (result.rows.length === 0) {
    throw new Error('Ticket not found');
  }

  // Get responses
  const responsesResult = await pool.query(
    `SELECT 
      r.*,
      u.name as author_name,
      u.profile_picture_url as author_avatar,
      u.role as author_role
    FROM support_responses r
    LEFT JOIN users u ON r.user_id = u.id
    WHERE r.ticket_id = $1
    ORDER BY r.created_at ASC`,
    [ticketId]
  );

  return {
    ...result.rows[0],
    responses: responsesResult.rows,
  };
};

export const updateTicketStatus = async (
  ticketId: string,
  status: 'open' | 'in_progress' | 'waiting_for_user' | 'resolved' | 'closed',
  assignedTo?: string
) => {
  const updates: string[] = [`status = $1`];
  const params: any[] = [status];
  let paramCount = 2;

  if (assignedTo) {
    updates.push(`assigned_to = $${paramCount++}`);
    params.push(assignedTo);
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  params.push(ticketId);

  const result = await pool.query(
    `UPDATE support_tickets 
     SET ${updates.join(', ')}
     WHERE id = $${paramCount}
     RETURNING *`,
    params
  );

  if (result.rows.length === 0) {
    throw new Error('Ticket not found');
  }

  return result.rows[0];
};

export const addTicketResponse = async (
  ticketId: string,
  userId: string,
  content: string
) => {
  // Get ticket to check current status and assignment
  const ticketResult = await pool.query(
    'SELECT user_id, assigned_to, status FROM support_tickets WHERE id = $1',
    [ticketId]
  );

  if (ticketResult.rows.length === 0) {
    throw new Error('Ticket not found');
  }

  const ticket = ticketResult.rows[0];
  const isTicketOwner = ticket.user_id === userId;
  const isAssignedUser = ticket.assigned_to === userId;

  // Add response
  const result = await pool.query(
    `INSERT INTO support_responses (ticket_id, user_id, content)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [ticketId, userId, content]
  );

  // Update ticket status based on who responded
  let newStatus = ticket.status;
  if (ticket.status === 'open' && isAssignedUser) {
    // If assigned user responds, mark as in_progress
    newStatus = 'in_progress';
  } else if (ticket.status === 'in_progress' && isTicketOwner) {
    // If ticket owner responds, mark as waiting_for_user
    newStatus = 'waiting_for_user';
  } else if (ticket.status === 'waiting_for_user' && isAssignedUser) {
    // If assigned user responds after waiting, mark as in_progress
    newStatus = 'in_progress';
  }

  // Update ticket
  await pool.query(
    `UPDATE support_tickets 
     SET updated_at = CURRENT_TIMESTAMP, status = $1
     WHERE id = $2`,
    [newStatus, ticketId]
  );

  return result.rows[0];
};

// Get available assignees based on ticket type
export const getAvailableAssignees = async (ticketType: 'academic' | 'platform' | 'technical') => {
  if (ticketType === 'academic') {
    const result = await pool.query(
      `SELECT id, name, email, role, is_verified 
       FROM users 
       WHERE role = 'teacher' AND is_active = true 
       ORDER BY is_verified DESC, name ASC`
    );
    return result.rows;
  } else {
    // Platform and technical tickets go to admins
    const result = await pool.query(
      `SELECT id, name, email, role 
       FROM users 
       WHERE role = 'admin' AND is_active = true 
       ORDER BY name ASC`
    );
    return result.rows;
  }
};

// Assign ticket manually
export const assignTicket = async (ticketId: string, assignedTo: string, assignedBy: string) => {
  // Verify assigner has permission (admin or teacher for academic tickets)
  const ticketResult = await pool.query(
    'SELECT ticket_type FROM support_tickets WHERE id = $1',
    [ticketId]
  );

  if (ticketResult.rows.length === 0) {
    throw new Error('Ticket not found');
  }

  const ticketType = ticketResult.rows[0].ticket_type;

  // Verify assignee is appropriate for ticket type
  const assigneeResult = await pool.query(
    'SELECT role FROM users WHERE id = $1 AND is_active = true',
    [assignedTo]
  );

  if (assigneeResult.rows.length === 0) {
    throw new Error('Assignee not found or inactive');
  }

  const assigneeRole = assigneeResult.rows[0].role;

  // Validate assignment
  if (ticketType === 'academic' && assigneeRole !== 'teacher') {
    throw new Error('Academic tickets can only be assigned to teachers');
  }
  if ((ticketType === 'platform' || ticketType === 'technical') && assigneeRole !== 'admin') {
    throw new Error('Platform and technical tickets can only be assigned to admins');
  }

  // Update ticket
  const result = await pool.query(
    `UPDATE support_tickets 
     SET assigned_to = $1, status = 'in_progress', updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING *`,
    [assignedTo, ticketId]
  );

  return result.rows[0];
};

// Reassign ticket (admin only)
export const reassignTicket = async (ticketId: string, newAssignedTo: string, reassignedBy: string) => {
  const ticketResult = await pool.query(
    'SELECT ticket_type, assigned_to FROM support_tickets WHERE id = $1',
    [ticketId]
  );

  if (ticketResult.rows.length === 0) {
    throw new Error('Ticket not found');
  }

  const ticket = ticketResult.rows[0];
  const ticketType = ticket.ticket_type;

  // Verify assignee is appropriate for ticket type
  const assigneeResult = await pool.query(
    'SELECT role FROM users WHERE id = $1 AND is_active = true',
    [newAssignedTo]
  );

  if (assigneeResult.rows.length === 0) {
    throw new Error('Assignee not found or inactive');
  }

  const assigneeRole = assigneeResult.rows[0].role;

  // Validate assignment
  if (ticketType === 'academic' && assigneeRole !== 'teacher') {
    throw new Error('Academic tickets can only be assigned to teachers');
  }
  if ((ticketType === 'platform' || ticketType === 'technical') && assigneeRole !== 'admin') {
    throw new Error('Platform and technical tickets can only be assigned to admins');
  }

  // Update ticket
  const result = await pool.query(
    `UPDATE support_tickets 
     SET assigned_to = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING *`,
    [newAssignedTo, ticketId]
  );

  return result.rows[0];
};

// Reopen a closed ticket
export const reopenTicket = async (ticketId: string, userId: string) => {
  const ticketResult = await pool.query(
    'SELECT user_id, status FROM support_tickets WHERE id = $1',
    [ticketId]
  );

  if (ticketResult.rows.length === 0) {
    throw new Error('Ticket not found');
  }

  const ticket = ticketResult.rows[0];

  // Only ticket owner or admin can reopen
  if (ticket.user_id !== userId) {
    // Check if user is admin
    const userResult = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );
    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
      throw new Error('Only ticket owner or admin can reopen tickets');
    }
  }

  if (ticket.status !== 'closed') {
    throw new Error('Only closed tickets can be reopened');
  }

  const result = await pool.query(
    `UPDATE support_tickets 
     SET status = 'open', updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [ticketId]
  );

  return result.rows[0];
};

// Escalate ticket (admin only - changes status to in_progress and can reassign)
export const escalateTicket = async (ticketId: string, escalatedBy: string, assignedTo?: string) => {
  const ticketResult = await pool.query(
    'SELECT * FROM support_tickets WHERE id = $1',
    [ticketId]
  );

  if (ticketResult.rows.length === 0) {
    throw new Error('Ticket not found');
  }

  const updates: string[] = [`status = 'in_progress'`, `updated_at = CURRENT_TIMESTAMP`];
  const params: any[] = [];
  let paramCount = 1;

  if (assignedTo) {
    // Verify assignee
    const assigneeResult = await pool.query(
      'SELECT role FROM users WHERE id = $1 AND is_active = true',
      [assignedTo]
    );

    if (assigneeResult.rows.length === 0) {
      throw new Error('Assignee not found or inactive');
    }

    updates.push(`assigned_to = $${paramCount++}`);
    params.push(assignedTo);
  }

  params.push(ticketId);

  const result = await pool.query(
    `UPDATE support_tickets 
     SET ${updates.join(', ')}
     WHERE id = $${paramCount}
     RETURNING *`,
    params
  );

  return result.rows[0];
};

