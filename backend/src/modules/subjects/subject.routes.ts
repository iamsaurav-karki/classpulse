import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import * as subjectController from './subject.controller';

const router = Router();

// Public routes
router.get('/', subjectController.list);
router.get('/popular', subjectController.getPopular);

// Protected routes
router.post('/', authenticateToken, subjectController.validateCreate, subjectController.create);

export default router;

