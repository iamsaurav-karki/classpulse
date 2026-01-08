import { Router } from 'express';
import {
  create,
  list,
  getById,
  update,
  remove,
  download,
  validateCreate,
  validateUpdate,
} from './note.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { requireVerifiedTeacher } from '../../middlewares/role.middleware';
import { uploadDocument } from '../../middlewares/upload.middleware';

const router = Router();

router.get('/', list);
router.get('/:id', getById);
router.get('/:id/download', download);
router.post('/', authenticateToken, requireVerifiedTeacher, uploadDocument.single('file'), validateCreate, create);
router.put('/:id', authenticateToken, requireVerifiedTeacher, validateUpdate, update);
router.delete('/:id', authenticateToken, requireVerifiedTeacher, remove);

export default router;

