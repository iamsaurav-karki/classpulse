import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '9001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    allowedImageTypes: (process.env.ALLOWED_IMAGE_TYPES || 'jpg,jpeg,png,webp').split(','),
    allowedDocTypes: (process.env.ALLOWED_DOC_TYPES || 'pdf,doc,docx,ppt,pptx').split(','),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:9000',
  },
  storage: {
    type: process.env.STORAGE_TYPE || 'local',
    // Add cloud storage configs here if needed
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  nats: {
    servers: (process.env.NATS_SERVERS || 'nats://localhost:4222').split(','),
  },
  cache: {
    ttl: {
      questions: parseInt(process.env.CACHE_TTL_QUESTIONS || '300'), // 5 minutes
      answers: parseInt(process.env.CACHE_TTL_ANSWERS || '300'),
      user: parseInt(process.env.CACHE_TTL_USER || '600'), // 10 minutes
      notes: parseInt(process.env.CACHE_TTL_NOTES || '600'),
    },
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@classpulse.com',
    password: process.env.ADMIN_PASSWORD || '',
    name: process.env.ADMIN_NAME || 'System Admin',
    enabled: process.env.ADMIN_ENABLED === 'true' || process.env.ADMIN_PASSWORD !== undefined,
  },
};

