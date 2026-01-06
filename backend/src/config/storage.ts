import fs from 'fs/promises';
import path from 'path';
import { config } from './env';

// Ensure upload directory exists
export const ensureUploadDir = async () => {
  try {
    await fs.mkdir(config.upload.dir, { recursive: true, mode: 0o755 });
    await fs.mkdir(path.join(config.upload.dir, 'images'), { recursive: true, mode: 0o755 });
    await fs.mkdir(path.join(config.upload.dir, 'documents'), { recursive: true, mode: 0o755 });
    await fs.mkdir(path.join(config.upload.dir, 'profiles'), { recursive: true, mode: 0o755 });
  } catch (error) {
    // Log but don't fail - directories might already exist or be created by volume mount
    console.warn('Note: Upload directories may need to be created manually:', error);
  }
};

export const getUploadPath = (type: 'image' | 'document' | 'profile', filename: string): string => {
  const subdir = type === 'image' ? 'images' : type === 'document' ? 'documents' : 'profiles';
  return path.join(config.upload.dir, subdir, filename);
};

export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

// Initialize upload directories on module load
ensureUploadDir();

