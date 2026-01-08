import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import {
  getAllSubjects,
  createSubject,
  getPopularSubjects,
} from './subject.service';
import { sendSuccess, sendError } from '../../utils/response';
import { toCamelCase } from '../../utils/transform';

export const list = async (req: Request, res: Response): Promise<void> => {
  try {
    const subjects = await getAllSubjects();
    const transformedSubjects = toCamelCase(subjects);
    sendSuccess(res, transformedSubjects, 'Subjects retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

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

    const subject = await createSubject({
      name: req.body.name,
      createdBy: req.user.userId,
    });

    const transformedSubject = toCamelCase(subject);
    sendSuccess(res, transformedSubject, 'Subject created successfully', 201);
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const getPopular = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt((req.query.limit as string) || '10');
    const subjects = await getPopularSubjects(limit);
    const transformedSubjects = toCamelCase(subjects);
    sendSuccess(res, transformedSubjects, 'Popular subjects retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const validateCreate = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Subject name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Subject name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_&]+$/)
    .withMessage('Subject name can only contain letters, numbers, spaces, hyphens, underscores, and ampersands'),
];

