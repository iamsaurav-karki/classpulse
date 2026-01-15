-- Script to create an admin account
-- Usage: psql -U postgres -d classpulse -f database/seeds/create_admin.sql
-- Or run this SQL directly in your database

-- Default admin credentials:
-- Email: admin@classpulse.com
-- Password: admin123
-- 
-- IMPORTANT: Change the password after first login!

-- Generate password hash for 'admin123' using bcrypt
-- You can generate a new hash using Node.js:
-- const bcrypt = require('bcryptjs');
-- bcrypt.hash('your_password', 10).then(hash => console.log(hash));

-- Insert admin user (password hash for 'admin123')
INSERT INTO users (email, password_hash, name, role, is_verified, is_active)
VALUES (
    'admin@classpulse.com',
    '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', -- This is a placeholder, see below
    'System Admin',
    'admin',
    TRUE,
    TRUE
) ON CONFLICT (email) DO UPDATE
SET 
    role = 'admin',
    is_verified = TRUE,
    is_active = TRUE;

-- Note: The password hash above is a placeholder.
-- To generate a proper hash, run this in Node.js:
-- 
-- const bcrypt = require('bcryptjs');
-- bcrypt.hash('admin123', 10).then(hash => console.log(hash));
--
-- Then replace the password_hash value above with the generated hash.

