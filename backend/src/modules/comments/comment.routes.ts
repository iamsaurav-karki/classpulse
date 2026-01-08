import { Router } from 'express';
import {
  create,
  getByAnswer,
  update,
  remove,
  validateCreate,
  validateUpdate,
} from './comment.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/answer/:answerId', getByAnswer);
router.post('/', authenticateToken, validateCreate, create);
router.post('/answer/:answerId', authenticateToken, validateCreate, create);
router.put('/:id', authenticateToken, validateUpdate, update);
router.delete('/:id', authenticateToken, remove);

export default router;

