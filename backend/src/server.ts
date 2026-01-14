import app from './app';
import { config } from './config/env';
import { logger } from './utils/logger';
import { ensureUploadDir } from './config/storage';
import { getRedisClient, closeRedis } from './config/redis';
import { getNatsConnection, closeNats } from './config/nats';
import { bootstrapAdmin } from './utils/bootstrap';
import { runMigrations } from './utils/migrations';
import path from 'path';

const PORT = config.port;
let server: any;

// Initialize services
async function initializeServices() {
  try {
    // Ensure upload directories exist with proper permissions
    try {
      await ensureUploadDir();
      // Set permissions on upload directories
      const fs = require('fs');
      const uploadDirs = [
        config.upload.dir,
        path.join(config.upload.dir, 'images'),
        path.join(config.upload.dir, 'documents'),
        path.join(config.upload.dir, 'profiles'),
      ];
      for (const dir of uploadDirs) {
        try {
          if (fs.existsSync(dir)) {
            fs.chmodSync(dir, 0o755);
          }
        } catch (err) {
          // Ignore permission errors
        }
      }
    } catch (error) {
      logger.warn('Upload directory setup warning:', error);
    }

    // Connect to Redis
    try {
      const redis = getRedisClient();
      await redis.connect();
      logger.info('✅ Redis connected');
    } catch (error) {
      logger.error('❌ Redis connection failed:', error);
      // Continue without Redis in development
      if (config.nodeEnv === 'production') {
        throw error;
      }
    }

    // Connect to NATS
    try {
      await getNatsConnection();
      logger.info('✅ NATS connected');
    } catch (error) {
      logger.error('❌ NATS connection failed:', error);
      // Continue without NATS in development
      if (config.nodeEnv === 'production') {
        throw error;
      }
    }

    // Run database migrations (runs after database connection is established)
    try {
      await runMigrations();
    } catch (error) {
      logger.error('❌ Migration failed:', error);
      // In production, fail if migrations fail
      if (config.nodeEnv === 'production') {
        throw error;
      }
      // In development, log but continue
      logger.warn('⚠️  Continuing despite migration errors (development mode)');
    }

    // Bootstrap admin user (runs after migrations)
    await bootstrapAdmin();
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Initialize and start server
initializeServices().then(() => {
  server = app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📝 Environment: ${config.nodeEnv}`);
  });
});

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  logger.info(`${signal} signal received: starting graceful shutdown`);
  
  if (!server) {
    process.exit(0);
    return;
  }
  
  // Close HTTP server
  server.close(async () => {
    logger.info('HTTP server closed');
    
    // Close Redis
    try {
      await closeRedis();
      logger.info('Redis connection closed');
    } catch (error) {
      logger.error('Error closing Redis:', error);
    }
    
    // Close NATS
    try {
      await closeNats();
      logger.info('NATS connection closed');
    } catch (error) {
      logger.error('Error closing NATS:', error);
    }
    
    process.exit(0);
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

