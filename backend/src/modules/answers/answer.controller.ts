import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import {
  createAnswer,
  getAnswersByQuestion,
  getAnswerById,
  updateAnswer,
  deleteAnswer,
  addAnswerFile,
  voteAnswer,
  acceptAnswer,
  pinAnswer,
} from './answer.service';
import { sendSuccess, sendError } from '../../utils/response';
import { CacheService } from '../../services/cache.service';
import { publishEvent, NATS_SUBJECTS } from '../../config/nats';
import { NotificationService } from '../../services/notification.service';
import { getQuestionById } from '../questions/question.service';
import { toCamelCase } from '../../utils/transform';

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    // Extract questionId and content from FormData
    // When using multer with FormData, fields are in req.body
    const questionId = req.params.questionId || req.body?.questionId;
    const content = req.body?.content;

    // Manual validation (express-validator doesn't work well with FormData)
    if (!questionId) {
      sendError(res, 'Question ID is required', 400);
      return;
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
      sendError(res, 'Content is required', 400);
      return;
    }

    // Validate questionId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(questionId)) {
      sendError(res, 'Invalid question ID format', 400);
      return;
    }

    const answer = await createAnswer({
      questionId,
      userId: req.user.userId,
      content: content.trim(),
    });

    // Handle file uploads if any
    if (req.files && Array.isArray(req.files)) {
      const filePromises = req.files.map((file: any) => {
        const fileType = file.mimetype.startsWith('image/') ? 'image' : 'document';
        
        // Determine the actual folder where multer stored the file based on fieldname
        // Multer stores based on fieldname: 'files' -> documents, 'images' -> images
        let uploadFolder = 'documents'; // default
        if (file.fieldname === 'image' || file.fieldname === 'images') {
          uploadFolder = 'images';
        } else if (file.fieldname === 'file' || file.fieldname === 'files') {
          uploadFolder = 'documents';
        } else {
          // Fallback: use fileType to determine folder
          uploadFolder = fileType === 'image' ? 'images' : 'documents';
        }
        
        const fileUrl = `/uploads/${uploadFolder}/${file.filename}`;
        
        return addAnswerFile(
          answer.id,
          fileUrl,
          file.originalname,
          fileType,
          file.size
        );
      });
      await Promise.all(filePromises);
    }

    const answerWithFiles = await getAnswerById(answer.id);
    
    // Cache the answer
    await CacheService.setAnswer(answer.id, answerWithFiles);
    await CacheService.invalidateAnswer(answer.id, answer.questionId);
    
    // Get question details for notification (don't fail if question not found)
    try {
      const question = await getQuestionById(answer.questionId);
      
      // Send notification to question author (if not the same user)
      if (question && question.userId !== req.user.userId) {
        // Get user name from JWT or use default
        const userName = (req.user as any).name || 'Someone';
        await NotificationService.notifyQuestionAnswered(
          question.userId,
          userName,
          answer.questionId,
          question.title
        );
      }
    } catch (error) {
      // Question might not exist, but answer was created - log error but don't fail
      console.error('Failed to get question for notification (answer was still created):', error);
    }
    
    // Publish event
    await publishEvent(NATS_SUBJECTS.ANSWER_CREATED, {
      answerId: answer.id,
      questionId: answer.questionId,
      userId: req.user.userId,
    });
    
    // Transform snake_case to camelCase
    const transformedAnswer = toCamelCase(answerWithFiles);
    
    sendSuccess(res, transformedAnswer, 'Answer created successfully', 201);
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const getByQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const answers = await getAnswersByQuestion(req.params.questionId);
    
    // Transform snake_case to camelCase
    // The toCamelCase should handle nested arrays and objects
    const transformedAnswers = toCamelCase(answers);
    
    // Ensure content field exists for each answer
    const validatedAnswers = transformedAnswers.map((answer: any) => {
      // Ensure content field is present (might be null or undefined)
      // Try multiple possible field names
      if (!answer.hasOwnProperty('content') || answer.content === null || answer.content === undefined) {
        answer.content = answer.contentText || answer.content_text || answer.content || '';
      }
      
      // Ensure content is a string
      if (answer.content != null) {
        answer.content = String(answer.content);
      } else {
        answer.content = '';
      }
      
      // Ensure files array exists
      if (!answer.files) {
        answer.files = [];
      }
      
      return answer;
    });
    
    sendSuccess(res, validatedAnswers, 'Answers retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const answer = await getAnswerById(req.params.id);
    
    // Transform snake_case to camelCase
    const transformedAnswer = toCamelCase(answer);
    
    sendSuccess(res, transformedAnswer, 'Answer retrieved successfully');
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

    const answer = await updateAnswer(req.params.id, req.user.userId, req.body.content);
    
    // Transform snake_case to camelCase
    const transformedAnswer = toCamelCase(answer);
    
    sendSuccess(res, transformedAnswer, 'Answer updated successfully');
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

    await deleteAnswer(req.params.id, req.user.userId, req.user.role);
    sendSuccess(res, null, 'Answer deleted successfully');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const vote = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const { voteType } = req.body;
    if (voteType !== 'upvote' && voteType !== 'downvote') {
      sendError(res, 'Invalid vote type', 400);
      return;
    }

    const answer = await voteAnswer(req.params.id, req.user.userId, voteType);
    
    // Transform snake_case to camelCase
    const transformedAnswer = toCamelCase(answer);
    
    sendSuccess(res, transformedAnswer, 'Vote recorded successfully');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const accept = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const { questionId } = req.body;
    
    if (!questionId) {
      sendError(res, 'Question ID is required', 400);
      return;
    }

    // Validate questionId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(questionId)) {
      sendError(res, 'Invalid question ID format', 400);
      return;
    }

    const answer = await acceptAnswer(
      req.params.id,
      questionId,
      req.user.userId,
      req.user.role
    );
    
    // Invalidate cache
    await CacheService.invalidateAnswer(answer.id, questionId);
    
    // Get question for notification (don't fail if question not found)
    try {
      const question = await getQuestionById(questionId);
      
      // Send notification to answer author
      if (question && answer.userId !== req.user.userId) {
        await NotificationService.notifyAnswerAccepted(
          answer.userId,
          questionId,
          question.title
        );
      }
    } catch (error) {
      // Question might not exist, but answer was accepted - log error but don't fail
      console.error('Failed to get question for notification (answer was still accepted):', error);
    }
    
    // Publish event
    await publishEvent(NATS_SUBJECTS.ANSWER_UPDATED, {
      answerId: answer.id,
      questionId,
      action: 'accepted',
    });
    
    // Transform snake_case to camelCase
    const transformedAnswer = toCamelCase(answer);
    
    sendSuccess(res, transformedAnswer, 'Answer accepted successfully');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const pin = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const answer = await pinAnswer(req.params.id, req.user.role);
    
    // Transform snake_case to camelCase
    const transformedAnswer = toCamelCase(answer);
    
    sendSuccess(res, transformedAnswer, 'Answer pin status updated');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

// Validation middleware
// Note: For FormData, validation might not work as expected, so we validate manually in the controller
export const validateCreate = [
  body('content').optional().trim().notEmpty().withMessage('Content is required'),
  body('questionId').optional().isUUID().withMessage('Invalid question ID'),
];

export const validateUpdate = [
  body('content').trim().notEmpty().withMessage('Content is required'),
];

export const validateVote = [
  body('voteType').isIn(['upvote', 'downvote']).withMessage('Vote type must be upvote or downvote'),
];

