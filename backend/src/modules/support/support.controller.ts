import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus,
  addTicketResponse,
  getAvailableAssignees,
  assignTicket,
  reassignTicket,
  reopenTicket,
  escalateTicket,
} from './support.service';
import { sendSuccess, sendError } from '../../utils/response';
import { toCamelCase } from '../../utils/transform';

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, errors.array()[0].msg, 400);
      return;
    }

    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const ticket = await createTicket({
      userId: req.user.userId,
      title: req.body.title,
      description: req.body.description,
      ticketType: req.body.ticketType,
    });

    // Transform snake_case to camelCase
    const transformedTicket = toCamelCase(ticket);

    sendSuccess(res, transformedTicket, 'Support ticket created successfully', 201);
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const list = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters: any = {
      status: req.query.status as string,
      ticketType: req.query.ticketType as string,
      assignedTo: req.query.assignedTo as string,
      search: req.query.search as string,
      limit: parseInt((req.query.limit as string) || '20'),
      offset: parseInt((req.query.offset as string) || '0'),
    };

    // Role-based filtering
    if (req.user) {
      if (req.user.role === 'student') {
        // Students can only see their own tickets
        filters.userId = req.user.userId;
      } else if (req.user.role === 'teacher') {
        // Teachers can only see assigned academic tickets
        filters.assignedTo = req.user.userId;
        filters.ticketType = 'academic';
      }
      // Admins can see all tickets (no filters applied)
    }

    const result = await getTickets(filters);
    
    // Transform snake_case to camelCase
    const transformedData = toCamelCase(result.data);
    
    sendSuccess(res, {
      items: transformedData,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        totalPages: Math.ceil(result.total / result.limit),
        currentPage: Math.floor(result.offset / result.limit) + 1,
      },
    }, 'Tickets retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const ticket = await getTicketById(req.params.id);

    // Check authorization based on role
    if (req.user) {
      if (req.user.role === 'student') {
        // Students can only see their own tickets
        if (ticket.user_id !== req.user.userId) {
          sendError(res, 'Unauthorized', 403);
          return;
        }
      } else if (req.user.role === 'teacher') {
        // Teachers can only see assigned academic tickets
        if (ticket.ticket_type !== 'academic' || ticket.assigned_to !== req.user.userId) {
          sendError(res, 'Unauthorized', 403);
          return;
        }
      }
      // Admins can see all tickets (no check needed)
    }

    // Transform snake_case to camelCase
    const transformedTicket = toCamelCase(ticket);

    sendSuccess(res, transformedTicket, 'Ticket retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message, 404);
  }
};

export const updateStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const { status, assignedTo } = req.body;
    
    // Get ticket to check permissions
    const ticket = await getTicketById(req.params.id);
    
    // Role-based permission checks
    if (req.user.role === 'student') {
      // Students can only close their own tickets
      if (ticket.user_id !== req.user.userId) {
        sendError(res, 'Unauthorized', 403);
        return;
      }
      if (status !== 'closed') {
        sendError(res, 'Students can only close tickets', 403);
        return;
      }
    } else if (req.user.role === 'teacher') {
      // Teachers can change status except closed, and only for assigned academic tickets
      if (status === 'closed') {
        sendError(res, 'Teachers cannot close tickets', 403);
        return;
      }
      if (ticket.ticket_type !== 'academic' || ticket.assigned_to !== req.user.userId) {
        sendError(res, 'You can only update assigned academic tickets', 403);
        return;
      }
    }
    // Admins can override any status (no restrictions)

    const updatedTicket = await updateTicketStatus(req.params.id, status, assignedTo);
    
    // Transform snake_case to camelCase
    const transformedTicket = toCamelCase(updatedTicket);
    
    sendSuccess(res, transformedTicket, 'Ticket status updated successfully');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const addResponse = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, errors.array()[0].msg, 400);
      return;
    }

    const response = await addTicketResponse(
      req.params.id,
      req.user.userId,
      req.body.content
    );

    // Transform snake_case to camelCase
    const transformedResponse = toCamelCase(response);

    sendSuccess(res, transformedResponse, 'Response added successfully', 201);
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

// Validation middleware
export const validateCreate = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('ticketType').isIn(['academic', 'platform', 'technical']).withMessage('Invalid ticket type'),
];

export const validateResponse = [
  body('content').trim().notEmpty().withMessage('Content is required'),
];

export const getAssignees = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    // Only teachers and admins can view assignees
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      sendError(res, 'Unauthorized', 403);
      return;
    }

    const ticketType = req.query.ticketType as 'academic' | 'platform' | 'technical';
    if (!ticketType || !['academic', 'platform', 'technical'].includes(ticketType)) {
      sendError(res, 'Invalid ticket type', 400);
      return;
    }

    const assignees = await getAvailableAssignees(ticketType);
    const transformedAssignees = toCamelCase(assignees);

    sendSuccess(res, transformedAssignees, 'Assignees retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const assign = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    // Only admins can manually assign tickets
    if (req.user.role !== 'admin') {
      sendError(res, 'Only admins can assign tickets', 403);
      return;
    }

    const { assignedTo } = req.body;
    if (!assignedTo) {
      sendError(res, 'Assigned user ID is required', 400);
      return;
    }

    const ticket = await assignTicket(req.params.id, assignedTo, req.user.userId);
    const transformedTicket = toCamelCase(ticket);

    sendSuccess(res, transformedTicket, 'Ticket assigned successfully');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const validateStatusUpdate = [
  body('status').isIn(['open', 'in_progress', 'waiting_for_user', 'resolved', 'closed']).withMessage('Invalid status'),
  body('assignedTo').optional().isUUID().withMessage('Invalid assigned user ID'),
];

export const validateAssign = [
  body('assignedTo').isUUID().withMessage('Invalid assigned user ID'),
];

export const reopen = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const ticket = await reopenTicket(req.params.id, req.user.userId);
    const transformedTicket = toCamelCase(ticket);
    
    sendSuccess(res, transformedTicket, 'Ticket reopened successfully');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const reassign = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    // Only admins can reassign
    if (req.user.role !== 'admin') {
      sendError(res, 'Only admins can reassign tickets', 403);
      return;
    }

    const { assignedTo } = req.body;
    if (!assignedTo) {
      sendError(res, 'Assigned user ID is required', 400);
      return;
    }

    const ticket = await reassignTicket(req.params.id, assignedTo, req.user.userId);
    const transformedTicket = toCamelCase(ticket);

    sendSuccess(res, transformedTicket, 'Ticket reassigned successfully');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const escalate = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    // Only admins can escalate
    if (req.user.role !== 'admin') {
      sendError(res, 'Only admins can escalate tickets', 403);
      return;
    }

    const { assignedTo } = req.body;
    const ticket = await escalateTicket(req.params.id, req.user.userId, assignedTo);
    const transformedTicket = toCamelCase(ticket);

    sendSuccess(res, transformedTicket, 'Ticket escalated successfully');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const validateReassign = [
  body('assignedTo').isUUID().withMessage('Invalid assigned user ID'),
];

export const validateEscalate = [
  body('assignedTo').optional().isUUID().withMessage('Invalid assigned user ID'),
];

