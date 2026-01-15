-- Migration: Add subjects table for user-created subjects
-- Date: 2024

-- Create subjects table if it doesn't exist
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subjects_name ON subjects(name);
CREATE INDEX IF NOT EXISTS idx_subjects_usage_count ON subjects(usage_count DESC);

-- Migrate existing subjects from questions and notes to subjects table
INSERT INTO subjects (name, usage_count)
SELECT DISTINCT subject, COUNT(*) as count
FROM (
    SELECT subject FROM questions WHERE subject IS NOT NULL
    UNION ALL
    SELECT subject FROM notes WHERE subject IS NOT NULL
) AS all_subjects
WHERE subject IS NOT NULL AND subject != ''
GROUP BY subject
ON CONFLICT (name) DO UPDATE 
SET usage_count = subjects.usage_count + EXCLUDED.usage_count;

