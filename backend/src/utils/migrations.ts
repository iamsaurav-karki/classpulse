import { pool } from '../config/database';
import { logger } from './logger';
import fs from 'fs';
import path from 'path';

interface Migration {
  name: string;
  file: string;
  sql: string;
}

/**
 * Create migrations table if it doesn't exist
 */
async function ensureMigrationsTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

/**
 * Get list of already applied migrations
 */
async function getAppliedMigrations(): Promise<string[]> {
  const result = await pool.query('SELECT name FROM migrations ORDER BY applied_at');
  return result.rows.map((row: any) => row.name);
}

/**
 * Load migration files from the migrations directory
 */
function loadMigrations(): Migration[] {
  const migrationsDir = path.join(__dirname, '../../../database/migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    logger.warn('Migrations directory not found:', migrationsDir);
    return [];
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Sort alphabetically to ensure order

  return files.map(file => {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');
    return {
      name: file,
      file: filePath,
      sql,
    };
  });
}

/**
 * Apply a single migration
 */
async function applyMigration(migration: Migration): Promise<void> {
  try {
    logger.info(`🔄 Applying migration: ${migration.name}`);
    
    // Execute migration SQL
    await pool.query(migration.sql);
    
    // Record migration as applied
    await pool.query(
      'INSERT INTO migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
      [migration.name]
    );
    
    logger.info(`✅ Migration applied: ${migration.name}`);
  } catch (error: any) {
    // If error is about table already existing, that's okay (idempotent)
    if (error.message && error.message.includes('already exists')) {
      logger.info(`ℹ️  Migration ${migration.name} already applied (table exists)`);
      // Still record it as applied
      await pool.query(
        'INSERT INTO migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [migration.name]
      );
      return;
    }
    throw error;
  }
}

/**
 * Run all pending migrations
 */
export async function runMigrations(): Promise<void> {
  try {
    logger.info('🔍 Checking for database migrations...');
    
    // Ensure migrations table exists
    await ensureMigrationsTable();
    
    // Get applied migrations
    const appliedMigrations = await getAppliedMigrations();
    logger.info(`📋 Found ${appliedMigrations.length} applied migration(s)`);
    
    // Load all migration files
    const allMigrations = loadMigrations();
    logger.info(`📁 Found ${allMigrations.length} migration file(s)`);
    
    // Filter out already applied migrations
    const pendingMigrations = allMigrations.filter(
      migration => !appliedMigrations.includes(migration.name)
    );
    
    if (pendingMigrations.length === 0) {
      logger.info('✅ Database is up to date - no pending migrations');
      return;
    }
    
    logger.info(`🚀 Applying ${pendingMigrations.length} pending migration(s)...`);
    
    // Apply each pending migration
    for (const migration of pendingMigrations) {
      await applyMigration(migration);
    }
    
    logger.info('✅ All migrations completed successfully');
  } catch (error: any) {
    logger.error('❌ Migration failed:', error.message);
    throw error;
  }
}

