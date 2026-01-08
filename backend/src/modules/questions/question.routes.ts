import { Router } from 'express';
import {
  create,
  list,
  getById,
  update,
  remove,
  markSolved,
  validateCreate,
  validateUpdate,
} from './question.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { uploadImage } from '../../middlewares/upload.middleware';

const router = Router();

router.get('/', list);
router.get('/:id', getById);
router.post('/', authenticateToken, uploadImage.array('images', 5), validateCreate, create);
router.put('/:id', authenticateToken, validateUpdate, update);
router.delete('/:id', authenticateToken, remove);
router.patch('/:id/solve', authenticateToken, markSolved);

export default router;

