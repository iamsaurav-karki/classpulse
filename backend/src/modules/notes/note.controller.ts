import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  incrementDownloadCount,
} from './note.service';
import { sendSuccess, sendError } from '../../utils/response';
import { requireVerifiedTeacher } from '../../middlewares/role.middleware';
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

    const file = req.file as Express.Multer.File;
    const note = await createNote({
      userId: req.user.userId,
      title: req.body.title,
      description: req.body.description,
      subject: req.body.subject,
      chapter: req.body.chapter,
      classGrade: req.body.classGrade,
      fileUrl: file ? `/uploads/documents/${file.filename}` : undefined,
      fileName: file ? file.originalname : undefined,
      fileType: file ? file.mimetype : undefined,
      fileSize: file ? file.size : undefined,
    });

    sendSuccess(res, note, 'Note created successfully', 201);
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const list = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = {
      subject: req.query.subject as string,
      chapter: req.query.chapter as string,
      classGrade: req.query.classGrade as string,
      userId: req.query.userId as string,
      search: req.query.search as string,
      limit: parseInt((req.query.limit as string) || '20'),
      offset: parseInt((req.query.offset as string) || '0'),
    };

    const result = await getNotes(filters);
    
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
    }, 'Notes retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const note = await getNoteById(req.params.id);
    sendSuccess(res, note, 'Note retrieved successfully');
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

    const note = await updateNote(req.params.id, req.user.userId, req.body);
    sendSuccess(res, note, 'Note updated successfully');
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

    await deleteNote(req.params.id, req.user.userId, req.user.role);
    sendSuccess(res, null, 'Note deleted successfully');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const download = async (req: Request, res: Response): Promise<void> => {
  try {
    const note = await getNoteById(req.params.id);
    await incrementDownloadCount(req.params.id);
    
    // Construct full download URL
    const { config } = require('../../config/env');
    const protocol = req.protocol || 'http';
    const host = req.get('host') || `localhost:${config.port}`;
    const baseUrl = `${protocol}://${host}`;
    const fileUrl = note.file_url || '';
    
    // Ensure fileUrl is a full URL
    let downloadUrl = fileUrl;
    if (fileUrl && !fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
      // Prepend base URL to relative path
      downloadUrl = `${baseUrl}${fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`}`;
    }
    
    res.json({
      success: true,
      data: {
        downloadUrl,
        fileName: note.file_name,
      },
    });
  } catch (error: any) {
    sendError(res, error.message, 404);
  }
};

// Validation middleware
export const validateCreate = [
  body('title').trim().notEmpty().withMessage('Title is required'),
];

export const validateUpdate = [
  body('title').optional().trim().notEmpty(),
];

