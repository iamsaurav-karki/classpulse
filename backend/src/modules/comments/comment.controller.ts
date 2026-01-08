import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import {
  createComment,
  getCommentsByAnswer,
  updateComment,
  deleteComment,
} from './comment.service';
import { sendSuccess, sendError } from '../../utils/response';

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, errors.array()[0].msg, 400);
      return;
    }

    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const comment = await createComment({
      answerId: req.params.answerId || req.body.answerId,
      userId: req.user.userId,
      content: req.body.content,
    });

    sendSuccess(res, comment, 'Comment created successfully', 201);
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const getByAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    const comments = await getCommentsByAnswer(req.params.answerId);
    sendSuccess(res, comments, 'Comments retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const comment = await updateComment(req.params.id, req.user.userId, req.body.content);
    sendSuccess(res, comment, 'Comment updated successfully');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    await deleteComment(req.params.id, req.user.userId, req.user.role);
    sendSuccess(res, null, 'Comment deleted successfully');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

// Validation middleware
export const validateCreate = [
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('answerId').optional().isUUID().withMessage('Invalid answer ID'),
];

export const validateUpdate = [
  body('content').trim().notEmpty().withMessage('Content is required'),
];

