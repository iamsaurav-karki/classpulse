import { Router } from 'express';
import {
  create,
  list,
  getById,
  updateStatus,
  addResponse,
  getAssignees,
  assign,
  reopen,
  reassign,
  escalate,
  validateCreate,
  validateResponse,
  validateStatusUpdate,
  validateAssign,
  validateReassign,
  validateEscalate,
} from './support.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateToken, list);
router.get('/assignees', authenticateToken, getAssignees);
router.get('/:id', authenticateToken, getById);
router.post('/', authenticateToken, validateCreate, create);
router.patch('/:id/status', authenticateToken, validateStatusUpdate, updateStatus);
router.post('/:id/assign', authenticateToken, validateAssign, assign);
router.post('/:id/reassign', authenticateToken, validateReassign, reassign);
router.post('/:id/reopen', authenticateToken, reopen);
router.post('/:id/escalate', authenticateToken, validateEscalate, escalate);
router.post('/:id/response', authenticateToken, validateResponse, addResponse);

export default router;

