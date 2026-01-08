import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes';
import questionRoutes from './modules/questions/question.routes';
import answerRoutes from './modules/answers/answer.routes';
import noteRoutes from './modules/notes/note.routes';
import supportRoutes from './modules/support/support.routes';
import subjectRoutes from './modules/subjects/subject.routes';
import commentRoutes from './modules/comments/comment.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import adminRoutes from './modules/admin/admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/questions', questionRoutes);
router.use('/answers', answerRoutes);
router.use('/notes', noteRoutes);
router.use('/support', supportRoutes);
router.use('/subjects', subjectRoutes);
router.use('/comments', commentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);

export default router;

