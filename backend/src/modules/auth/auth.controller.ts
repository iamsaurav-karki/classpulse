import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { registerUser, loginUser, getUserById } from './auth.service';
import { sendSuccess, sendError } from '../../utils/response';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, errors.array()[0].msg, 400);
      return;
    }

    const result = await registerUser(req.body);
    sendSuccess(res, result, 'User registered successfully', 201);
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, errors.array()[0].msg, 400);
      return;
    }

    const result = await loginUser(req.body);
    sendSuccess(res, result, 'Login successful');
  } catch (error: any) {
    sendError(res, error.message, 401);
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 401);
      return;
    }

    const user = await getUserById(req.user.userId);
    sendSuccess(res, user, 'Profile retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message, 404);
  }
};

// Validation middleware
export const validateRegister = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('role').isIn(['student', 'teacher']).withMessage('Role must be student or teacher'),
];

export const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

