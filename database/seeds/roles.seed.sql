-- Seed data for roles and initial admin user
-- Note: Password should be hashed using bcrypt before inserting
-- Default password: 'admin123' (should be changed in production)

-- Insert default admin user (password hash for 'admin123')
-- In production, use: bcrypt.hash('admin123', 10)
INSERT INTO users (email, password_hash, name, role, is_verified, is_active)
VALUES (
    'admin@classpulse.com',
    '$2b$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', -- Replace with actual hash
    'System Admin',
    'admin',
    TRUE,
    TRUE
) ON CONFLICT (email) DO NOTHING;

