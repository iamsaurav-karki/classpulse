import bcrypt from 'bcryptjs';
import { pool } from '../config/database';
import { config } from '../config/env';
import { logger } from './logger';

/**
 * Bootstrap admin user on application startup
 * Creates admin user if it doesn't exist, using credentials from environment variables
 */
export async function bootstrapAdmin(): Promise<void> {
  // Skip if admin bootstrap is disabled
  if (!config.admin.enabled) {
    logger.info('ℹ️  Admin bootstrap is disabled (ADMIN_ENABLED=false or ADMIN_PASSWORD not set)');
    return;
  }

  // Validate required admin credentials
  if (!config.admin.email || !config.admin.password) {
    logger.warn('⚠️  Admin bootstrap skipped: ADMIN_EMAIL or ADMIN_PASSWORD not set');
    return;
  }

  try {
    // Efficient check: Only check if admin exists (single query with LIMIT 1)
    const checkResult = await pool.query(
      'SELECT id FROM users WHERE role = $1 LIMIT 1',
      ['admin']
    );

    if (checkResult.rows.length > 0) {
      logger.info('✅ Admin user already exists, skipping bootstrap');
      return;
    }

    // Admin doesn't exist, create it
    logger.info('🔐 Bootstrapping admin user...');
    
    // Hash password
    const passwordHash = await bcrypt.hash(config.admin.password, 10);

    // Insert admin user
    const insertResult = await pool.query(
      `INSERT INTO users (email, password_hash, name, role, is_verified, is_active)
       VALUES ($1, $2, $3, 'admin', TRUE, TRUE)
       RETURNING id, email, name, role`,
      [config.admin.email, passwordHash, config.admin.name]
    );

    const admin = insertResult.rows[0];
    logger.info(`✅ Admin user created successfully: ${admin.email} (ID: ${admin.id})`);
    
  } catch (error: any) {
    // Handle unique constraint violation (email already exists)
    if (error.code === '23505') {
      logger.info('✅ Admin user already exists (email conflict), skipping bootstrap');
      return;
    }
    
    // Log other errors but don't crash the app
    logger.error('❌ Error bootstrapping admin user:', error.message);
    // Don't throw - allow app to start even if admin bootstrap fails
  }
}

