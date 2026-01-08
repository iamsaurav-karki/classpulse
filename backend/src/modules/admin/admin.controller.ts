import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import {
  getAllUsers,
  getUserById,
  suspendUser,
  activateUser,
  updateUserRole,
  getPendingTeachers,
  approveTeacher,
  rejectTeacher,
  getAllQuestions,
  lockQuestion,
  unlockQuestion,
  deleteQuestion,
  getAllAnswers,
  deleteAnswer,
  getAllSupportTickets,
  getAnalytics,
  createAdminLog,
  getAdminLogs,
} from './admin.service';
import { sendSuccess, sendError } from '../../utils/response';
import { toCamelCase } from '../../utils/transform';

// Helper to get client IP and user agent
const getClientInfo = (req: Request) => {
  const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.get('user-agent') || 'unknown';
  return { ipAddress, userAgent };
};

// User Management
export const listUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      sendError(res, 'Unauthorized', 403);
      return;
    }

    const filters = {
      role: req.query.role as string,
      isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
      isVerified: req.query.isVerified ? req.query.isVerified === 'true' : undefined,
      limit: parseInt((req.query.limit as string) || '50'),
      offset: parseInt((req.query.offset as string) || '0'),
      search: req.query.search as string,
    };

    const users = await getAllUsers(filters);
    const transformed = toCamelCase(users);
    sendSuccess(res, transformed, 'Users retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      sendError(res, 'Unauthorized', 403);
      return;
    }

    const user = await getUserById(req.params.id);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    const transformed = toCamelCase(user);
    sendSuccess(res, transformed, 'User retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const suspend = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      sendError(res, 'Unauthorized', 403);
      return;
    }

    const user = await suspendUser(req.params.id);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    // Log action
    const { ipAddress, userAgent } = getClientInfo(req);
    await createAdminLog(
      req.user.userId,
      'suspend_user',
      'user',
      req.params.id,
      { reason: req.body.reason },
      ipAddress,
      userAgent
    );

    const transformed = toCamelCase(user);
    sendSuccess(res, transformed, 'User suspended successfully');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const activate = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      sendError(res, 'Unauthorized', 403);
      return;
    }

    const user = await activateUser(req.params.id);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    // Log action
    const { ipAddress, userAgent } = getClientInfo(req);
    await createAdminLog(
      req.user.userId,
      'activate_user',
      'user',
      req.params.id,
      null,
      ipAddress,
      userAgent
    );

    const transformed = toCamelCase(user);
    sendSuccess(res, transformed, 'User activated successfully');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const changeRole = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      sendError(res, 'Unauthorized', 403);
      return;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, errors.array()[0].msg, 400);
      return;
    }

    const user = await updateUserRole(req.params.id, req.body.role);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    // Log action
    const { ipAddress, userAgent } = getClientInfo(req);
    await createAdminLog(
      req.user.userId,
      'change_user_role',
      'user',
      req.params.id,
      { newRole: req.body.role },
      ipAddress,
      userAgent
    );

    const transformed = toCamelCase(user);
    sendSuccess(res, transformed, 'User role updated successfully');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

// Teacher Verification
export const listPendingTeachers = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      sendError(res, 'Unauthorized', 403);
      return;
    }

    const teachers = await getPendingTeachers();
    const transformed = toCamelCase(teachers);
    sendSuccess(res, transformed, 'Pending teachers retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const approve = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      sendError(res, 'Unauthorized', 403);
      return;
    }

    const teacher = await approveTeacher(req.params.id);
    if (!teacher) {
      sendError(res, 'Teacher not found', 404);
      return;
    }

    // Log action
    const { ipAddress, userAgent } = getClientInfo(req);
    await createAdminLog(
      req.user.userId,
      'approve_teacher',
      'teacher',
      req.params.id,
      null,
      ipAddress,
      userAgent
    );

    const transformed = toCamelCase(teacher);
    sendSuccess(res, transformed, 'Teacher approved successfully');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const reject = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      sendError(res, 'Unauthorized', 403);
      return;
    }

    const teacher = await rejectTeacher(req.params.id);
    if (!teacher) {
      sendError(res, 'Teacher not found', 404);
      return;
    }

    // Log action
    const { ipAddress, userAgent } = getClientInfo(req);
    await createAdminLog(
      req.user.userId,
      'reject_teacher',
      'teacher',
      req.params.id,
      { reason: req.body.reason },
      ipAddress,
      userAgent
    );

    const transformed = toCamelCase(teacher);
    sendSuccess(res, transformed, 'Teacher rejected successfully');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

// Content Moderation
export const listQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      sendError(res, 'Unauthorized', 403);
      return;
    }

    const filters = {
      isLocked: req.query.isLocked ? req.query.isLocked === 'true' : undefined,
      limit: parseInt((req.query.limit as string) || '50'),
      offset: parseInt((req.query.offset as string) || '0'),
      search: req.query.search as string,
    };

    const questions = await getAllQuestions(filters);
    const transformed = toCamelCase(questions);
    sendSuccess(res, transformed, 'Questions retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const lock = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      sendError(res, 'Unauthorized', 403);
      return;
    }

    const question = await lockQuestion(req.params.id);
    if (!question) {
      sendError(res, 'Question not found', 404);
      return;
    }

    // Log action
    const { ipAddress, userAgent } = getClientInfo(req);
    await createAdminLog(
      req.user.userId,
      'lock_question',
      'question',
      req.params.id,
      null,
      ipAddress,
      userAgent
    );

    const transformed = toCamelCase(question);
    sendSuccess(res, transformed, 'Question locked successfully');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const unlock = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      sendError(res, 'Unauthorized', 403);
      return;
    }

    const question = await unlockQuestion(req.params.id);
    if (!question) {
      sendError(res, 'Question not found', 404);
      return;
    }

    // Log action
    const { ipAddress, userAgent } = getClientInfo(req);
    await createAdminLog(
      req.user.userId,
      'unlock_question',
      'question',
      req.params.id,
      null,
      ipAddress,
      userAgent
    );

    const transformed = toCamelCase(question);
    sendSuccess(res, transformed, 'Question unlocked successfully');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const deleteQ = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      sendError(res, 'Unauthorized', 403);
      return;
    }

    const question = await deleteQuestion(req.params.id);
    if (!question) {
      sendError(res, 'Question not found', 404);
      return;
    }

    // Log action
    const { ipAddress, userAgent } = getClientInfo(req);
    await createAdminLog(
      req.user.userId,
      'delete_question',
      'question',
      req.params.id,
      null,
      ipAddress,
      userAgent
    );

    const transformed = toCamelCase(question);
    sendSuccess(res, transformed, 'Question deleted successfully');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const listAnswers = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      sendError(res, 'Unauthorized', 403);
      return;
    }

    const filters = {
      limit: parseInt((req.query.limit as string) || '50'),
      offset: parseInt((req.query.offset as string) || '0'),
      search: req.query.search as string,
    };

    const answers = await getAllAnswers(filters);
    const transformed = toCamelCase(answers);
    sendSuccess(res, transformed, 'Answers retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const deleteA = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      sendError(res, 'Unauthorized', 403);
      return;
    }

    const answer = await deleteAnswer(req.params.id);
    if (!answer) {
      sendError(res, 'Answer not found', 404);
      return;
    }

    // Log action
    const { ipAddress, userAgent } = getClientInfo(req);
    await createAdminLog(
      req.user.userId,
      'delete_answer',
      'answer',
      req.params.id,
      null,
      ipAddress,
      userAgent
    );

    const transformed = toCamelCase(answer);
    sendSuccess(res, transformed, 'Answer deleted successfully');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

// Support Management
export const listSupportTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      sendError(res, 'Unauthorized', 403);
      return;
    }

    const filters = {
      status: req.query.status as string,
      ticketType: req.query.ticketType as string,
      limit: parseInt((req.query.limit as string) || '50'),
      offset: parseInt((req.query.offset as string) || '0'),
    };

    const tickets = await getAllSupportTickets(filters);
    const transformed = toCamelCase(tickets);
    sendSuccess(res, transformed, 'Support tickets retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

// Analytics
export const analytics = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      sendError(res, 'Unauthorized', 403);
      return;
    }

    const data = await getAnalytics();
    const transformed = toCamelCase(data);
    sendSuccess(res, transformed, 'Analytics retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

// Admin Logs
export const listLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      sendError(res, 'Unauthorized', 403);
      return;
    }

    const filters = {
      adminId: req.query.adminId as string,
      action: req.query.action as string,
      limit: parseInt((req.query.limit as string) || '50'),
      offset: parseInt((req.query.offset as string) || '0'),
    };

    const logs = await getAdminLogs(filters);
    const transformed = toCamelCase(logs);
    sendSuccess(res, transformed, 'Admin logs retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

// Validation
export const validateRoleChange = [
  body('role').isIn(['student', 'teacher', 'admin']).withMessage('Invalid role'),
];

