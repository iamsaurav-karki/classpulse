import { Router } from 'express';
import {
  listUsers,
  getUser,
  suspend,
  activate,
  changeRole,
  listPendingTeachers,
  approve,
  reject,
  listQuestions,
  lock,
  unlock,
  deleteQ,
  listAnswers,
  deleteA,
  listSupportTickets,
  analytics,
  listLogs,
  validateRoleChange,
} from './admin.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/role.middleware';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// User Management
router.get('/users', listUsers);
router.get('/users/:id', getUser);
router.patch('/users/:id/suspend', suspend);
router.patch('/users/:id/activate', activate);
router.patch('/users/:id/role', validateRoleChange, changeRole);

// Teacher Verification
router.get('/teachers/pending', listPendingTeachers);
router.post('/teachers/:id/approve', approve);
router.post('/teachers/:id/reject', reject);

// Content Moderation
router.get('/questions', listQuestions);
router.post('/questions/:id/lock', lock);
router.post('/questions/:id/unlock', unlock);
router.delete('/questions/:id', deleteQ);

router.get('/answers', listAnswers);
router.delete('/answers/:id', deleteA);

// Support Management
router.get('/support', listSupportTickets);

// Analytics
router.get('/analytics', analytics);

// Admin Logs
router.get('/logs', listLogs);

export default router;

