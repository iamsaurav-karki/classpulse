import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env';
import { getUploadPath } from '../config/storage';

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = '';
    // Handle both singular and plural fieldnames
    if (file.fieldname === 'image' || file.fieldname === 'images' || file.fieldname === 'profilePicture') {
      uploadPath = path.join(config.upload.dir, 'images');
    } else if (file.fieldname === 'document' || file.fieldname === 'documents' || file.fieldname === 'file' || file.fieldname === 'files') {
      uploadPath = path.join(config.upload.dir, 'documents');
    } else {
      uploadPath = path.join(config.upload.dir, 'images'); // Default to images
    }
    
    // Ensure directory exists synchronously
    try {
      const fsSync = require('fs');
      if (!fsSync.existsSync(uploadPath)) {
        fsSync.mkdirSync(uploadPath, { recursive: true, mode: 0o755 });
      }
    } catch (error) {
      console.error('Error creating upload directory:', error);
      // Continue anyway - directory might already exist
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter
const fileFilter = (allowedTypes: string[]) => {
  return (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type .${ext} is not allowed. Allowed types: ${allowedTypes.join(', ')}`));
    }
  };
};

// Upload middleware for images
export const uploadImage = multer({
  storage,
  limits: { fileSize: config.upload.maxFileSize },
  fileFilter: fileFilter(config.upload.allowedImageTypes),
});

// Upload middleware for documents
export const uploadDocument = multer({
  storage,
  limits: { fileSize: config.upload.maxFileSize * 2 }, // 20MB for documents
  fileFilter: fileFilter(config.upload.allowedDocTypes),
});

// Upload middleware for multiple files
export const uploadMultiple = multer({
  storage,
  limits: { fileSize: config.upload.maxFileSize },
  fileFilter: fileFilter([...config.upload.allowedImageTypes, ...config.upload.allowedDocTypes]),
});

