-- Quick Admin Account Creation
-- Run this SQL directly in your PostgreSQL database
-- 
-- Default credentials:
-- Email: admin@classpulse.com
-- Password: admin123
--
-- IMPORTANT: Change password after first login!

-- First, generate a password hash using Node.js:
-- Run: node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('admin123', 10).then(h => console.log(h));"
-- Then replace the hash below with the output

-- Or use this pre-generated hash for 'admin123':
-- (Generated with: bcrypt.hash('admin123', 10))

INSERT INTO users (email, password_hash, name, role, is_verified, is_active)
VALUES (
    'admin@classpulse.com',
    '$2a$10$NCu1bmueay0i9JlkI56e2uZUPcq8a5YfRx2LcfXQtcDhEwxYCiWZK', -- Hash for 'admin123'
    'System Admin',
    'admin',
    TRUE,
    TRUE
) 
ON CONFLICT (email) DO UPDATE
SET 
    password_hash = EXCLUDED.password_hash,
    role = 'admin',
    is_verified = TRUE,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

-- After running this, you can login with:
-- Email: admin@classpulse.com
-- Password: admin123

