import { Router } from 'express';
import {
  create,
  getByQuestion,
  getById,
  update,
  remove,
  vote,
  accept,
  pin,
  validateCreate,
  validateUpdate,
  validateVote,
} from './answer.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { requireVerifiedTeacher } from '../../middlewares/role.middleware';
import { uploadMultiple } from '../../middlewares/upload.middleware';

const router = Router();

router.get('/question/:questionId', getByQuestion);
router.get('/:id', getById);
// Note: validateCreate is skipped for FormData requests - validation is done manually in the controller
// Teachers must be verified to answer questions
router.post('/', authenticateToken, requireVerifiedTeacher, uploadMultiple.array('files', 5), create);
router.post('/:questionId', authenticateToken, requireVerifiedTeacher, uploadMultiple.array('files', 5), create);
router.put('/:id', authenticateToken, validateUpdate, update);
router.delete('/:id', authenticateToken, remove);
router.post('/:id/vote', authenticateToken, validateVote, vote);
router.post('/:id/accept', authenticateToken, accept);
router.post('/:id/pin', authenticateToken, pin);

export default router;

