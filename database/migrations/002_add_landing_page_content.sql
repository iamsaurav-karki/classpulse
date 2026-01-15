-- Migration: Add landing_page_content table for dynamic landing page management
-- Date: 2024

-- Create landing_page_content table if it doesn't exist
CREATE TABLE IF NOT EXISTS landing_page_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section VARCHAR(100) NOT NULL UNIQUE, -- 'hero', 'about', 'features', 'roles', etc.
    content JSONB NOT NULL, -- Flexible JSON structure for different sections
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_landing_page_content_section ON landing_page_content(section);
CREATE INDEX IF NOT EXISTS idx_landing_page_content_active ON landing_page_content(is_active) WHERE is_active = TRUE;

