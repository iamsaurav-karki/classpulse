import { pool } from '../../config/database';

export interface CreateSubjectData {
  name: string;
  createdBy?: string;
}

export const getAllSubjects = async () => {
  const result = await pool.query(
    `SELECT 
      s.*,
      u.name as creator_name
    FROM subjects s
    LEFT JOIN users u ON s.created_by = u.id
    ORDER BY s.usage_count DESC, s.name ASC`
  );
  return result.rows;
};

export const getSubjectByName = async (name: string) => {
  const result = await pool.query(
    'SELECT * FROM subjects WHERE LOWER(name) = LOWER($1)',
    [name.trim()]
  );
  return result.rows[0] || null;
};

export const createSubject = async (data: CreateSubjectData) => {
  const { name, createdBy } = data;
  const trimmedName = name.trim();

  // Check if subject already exists (case-insensitive)
  const existing = await getSubjectByName(trimmedName);
  if (existing) {
    return existing;
  }

  // Create new subject
  const result = await pool.query(
    `INSERT INTO subjects (name, created_by)
     VALUES ($1, $2)
     RETURNING *`,
    [trimmedName, createdBy || null]
  );

  return result.rows[0];
};

export const incrementSubjectUsage = async (subjectName: string) => {
  if (!subjectName || !subjectName.trim()) return;
  
  const trimmedName = subjectName.trim();
  
  // Use upsert to either update existing or create new
  await pool.query(
    `INSERT INTO subjects (name, usage_count)
     VALUES ($1, 1)
     ON CONFLICT (name) DO UPDATE 
     SET usage_count = subjects.usage_count + 1,
         updated_at = CURRENT_TIMESTAMP`,
    [trimmedName]
  );
};

export const getPopularSubjects = async (limit: number = 10) => {
  const result = await pool.query(
    `SELECT * FROM subjects
     ORDER BY usage_count DESC, name ASC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
};

