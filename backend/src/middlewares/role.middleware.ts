import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';

type UserRole = 'student' | 'teacher' | 'admin';

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Normalize role to lowercase for comparison (database stores as enum but JWT might vary)
    const userRole = (req.user.role as string)?.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());

    if (!normalizedAllowedRoles.includes(userRole)) {
      console.error(`❌ Access denied: User role '${req.user.role}' not in allowed roles:`, allowedRoles);
      res.status(403).json({ 
        error: 'Insufficient permissions',
        userRole: req.user.role,
        requiredRoles: allowedRoles
      });
      return;
    }

    next();
  };
};

export const requireTeacher = requireRole('teacher', 'admin');
export const requireAdmin = requireRole('admin');

// Debug logging for admin access issues
export const requireAdminWithLogging = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    console.log('❌ Admin access denied: No user in request');
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  console.log('🔍 Admin check - User role:', req.user.role, 'User ID:', req.user.userId);
  
  if (req.user.role !== 'admin') {
    console.log('❌ Admin access denied: User role is', req.user.role, 'expected admin');
    res.status(403).json({ error: 'Insufficient permissions', userRole: req.user.role });
    return;
  }

  next();
};

/**
 * Middleware to require verified teacher (or admin)
 * Teachers must be verified by admin before they can answer questions or create notes
 */
export const requireVerifiedTeacher = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  // Admins can always proceed
  if (req.user.role === 'admin') {
    next();
    return;
  }

  // Teachers must be verified and active
  if (req.user.role === 'teacher') {
    try {
      const result = await pool.query(
        'SELECT is_verified, is_active FROM users WHERE id = $1',
        [req.user.userId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const user = result.rows[0];
      
      // Check if account is active
      if (!user.is_active) {
        res.status(403).json({
          error: 'Your teacher account has been rejected or deactivated. Please contact an administrator.',
        });
        return;
      }
      
      // Check if account is verified
      if (!user.is_verified) {
        res.status(403).json({
          error: 'Your teacher account is pending verification. Please wait for admin approval before answering questions or creating notes.',
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Error checking teacher verification:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    return;
  }

  // Students cannot access teacher-only endpoints
  res.status(403).json({ error: 'Insufficient permissions' });
};

