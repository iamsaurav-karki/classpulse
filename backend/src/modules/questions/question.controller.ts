import { Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  addQuestionImage,
  markQuestionAsSolved,
} from './question.service';
import { sendSuccess, sendError } from '../../utils/response';
import { uploadImage } from '../../middlewares/upload.middleware';
import { pool } from '../../config/database';
import path from 'path';
import { CacheService } from '../../services/cache.service';
import { publishEvent, NATS_SUBJECTS } from '../../config/nats';
import { NotificationService } from '../../services/notification.service';
import { toCamelCase } from '../../utils/transform';

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

    // Teachers should not ask regular questions - they can post sample questions or use support tickets
    if (req.user.role === 'teacher' || req.user.role === 'admin') {
      // Check if this is a sample question (marked with category 'sample' or 'practice')
      const isSampleQuestion = req.body.category === 'sample' || req.body.category === 'practice';
      
      if (!isSampleQuestion) {
        sendError(
          res,
          'Teachers should not ask regular academic questions. Please use sample/practice questions for students or raise a support ticket for other issues.',
          403
        );
        return;
      }
    }

    const question = await createQuestion({
      userId: req.user.userId,
      title: req.body.title,
      description: req.body.description,
      subject: req.body.subject,
      category: req.body.category,
    });

    // Handle image uploads if any
    if (req.files && Array.isArray(req.files)) {
      const imagePromises = req.files.map((file: any) =>
        addQuestionImage(
          question.id,
          `/uploads/images/${file.filename}`,
          file.originalname,
          file.size
        )
      );
      await Promise.all(imagePromises);
    }

    const questionWithImages = await getQuestionById(question.id);
    
    // Transform snake_case to camelCase
    const transformedQuestion = toCamelCase(questionWithImages);
    
    // Cache the question (non-blocking)
    try {
      await CacheService.setQuestion(question.id, questionWithImages);
      await CacheService.invalidateQuestion(question.id); // Invalidate list cache
    } catch (cacheError) {
      console.error('Cache error (non-fatal):', cacheError);
    }
    
    // Publish event (non-blocking)
    try {
      await publishEvent(NATS_SUBJECTS.QUESTION_CREATED, {
        questionId: question.id,
        userId: req.user.userId,
        title: question.title,
      });
    } catch (eventError) {
      console.error('Event publish error (non-fatal):', eventError);
    }
    
    sendSuccess(res, transformedQuestion, 'Question created successfully', 201);
  } catch (error: any) {
    console.error('Question creation error:', error);
    sendError(res, error.message || 'Failed to create question', 500);
  }
};

export const list = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = {
      subject: req.query.subject as string,
      category: req.query.category as string,
      isSolved: req.query.isSolved === 'true' ? true : req.query.isSolved === 'false' ? false : undefined,
      userId: req.query.userId as string,
      search: req.query.search as string,
      limit: parseInt((req.query.limit as string) || '20'),
      offset: parseInt((req.query.offset as string) || '0'),
    };

    // Fetch from database (pagination metadata changes with filters, so caching is complex)
    const result = await getQuestions(filters);

    // Transform snake_case to camelCase
    const transformedData = toCamelCase(result.data);

    sendSuccess(res, {
      items: transformedData,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        totalPages: Math.ceil(result.total / result.limit),
        currentPage: Math.floor(result.offset / result.limit) + 1,
      },
    }, 'Questions retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    // Try to get from cache first
    let question = await CacheService.getQuestion(req.params.id);
    
    if (!question) {
      // Cache miss - fetch from database
      question = await getQuestionById(req.params.id);
      // Cache the result
      await CacheService.setQuestion(req.params.id, question);
    }
    
    // Increment view count
    await pool.query(
      'UPDATE questions SET views = views + 1 WHERE id = $1',
      [req.params.id]
    );

    // Transform snake_case to camelCase
    const transformedQuestion = toCamelCase(question);

    sendSuccess(res, transformedQuestion, 'Question retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message, 404);
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const question = await updateQuestion(req.params.id, req.user.userId, req.body);
    
    // Transform snake_case to camelCase
    const transformedQuestion = toCamelCase(question);
    
    // Invalidate cache
    await CacheService.invalidateQuestion(req.params.id);
    
    // Publish event
    await publishEvent(NATS_SUBJECTS.QUESTION_UPDATED, {
      questionId: req.params.id,
      userId: req.user.userId,
    });
    
    sendSuccess(res, transformedQuestion, 'Question updated successfully');
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

    await deleteQuestion(req.params.id, req.user.userId, req.user.role);
    
    // Invalidate cache
    await CacheService.invalidateQuestion(req.params.id);
    
    sendSuccess(res, null, 'Question deleted successfully');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const markSolved = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const { answerId } = req.body;
    const question = await markQuestionAsSolved(req.params.id, answerId);
    
    // Transform snake_case to camelCase
    const transformedQuestion = toCamelCase(question);
    
    sendSuccess(res, transformedQuestion, 'Question marked as solved');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

// Validation middleware
export const validateCreate = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
];

export const validateUpdate = [
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
];

