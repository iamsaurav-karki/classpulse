import bcrypt from 'bcryptjs';
import { pool } from '../../config/database';
import { generateToken, JWTPayload } from '../../config/auth';
import { logger } from '../../utils/logger';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'teacher';
  bio?: string;
  subjects?: string[];
}

export interface LoginData {
  email: string;
  password: string;
}

export const registerUser = async (data: RegisterData) => {
  const { email, password, name, role, bio, subjects } = data;

  // Check if user exists
  const existingUser = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Insert user
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, name, role, bio, subjects, is_verified)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, email, name, role, bio, subjects, profile_picture_url, is_verified, created_at`,
    [email, passwordHash, name, role, bio || null, subjects || [], role === 'teacher' ? false : true]
  );

  const user = result.rows[0];

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      bio: user.bio,
      subjects: user.subjects,
      profilePictureUrl: user.profile_picture_url,
      isVerified: user.is_verified,
    },
    token,
  };
};

export const loginUser = async (data: LoginData) => {
  const { email, password } = data;

  // Find user
  const result = await pool.query(
    'SELECT id, email, password_hash, name, role, bio, subjects, profile_picture_url, is_verified, is_active FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid email or password');
  }

  const user = result.rows[0];

  if (!user.is_active) {
    throw new Error('Account is deactivated');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      bio: user.bio,
      subjects: user.subjects,
      profilePictureUrl: user.profile_picture_url,
      isVerified: user.is_verified,
    },
    token,
  };
};

export const getUserById = async (userId: string) => {
  const result = await pool.query(
    `SELECT id, email, name, role, bio, subjects, profile_picture_url, is_verified, is_active, created_at
     FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error('User not found');
  }

  const user = result.rows[0];
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    bio: user.bio,
    subjects: user.subjects,
    profilePictureUrl: user.profile_picture_url,
    isVerified: user.is_verified,
    isActive: user.is_active,
    createdAt: user.created_at,
  };
};

