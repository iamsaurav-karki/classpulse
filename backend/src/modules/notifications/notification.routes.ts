import { Router } from 'express';
import { list, markRead, markAllRead, getUnread } from './notification.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateToken, list);
router.get('/unread', authenticateToken, getUnread);
router.patch('/:id/read', authenticateToken, markRead);
router.patch('/read-all', authenticateToken, markAllRead);

export default router;

