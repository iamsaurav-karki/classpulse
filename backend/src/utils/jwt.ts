import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../config/auth';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    // Log for debugging (remove in production if needed)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Authenticated user:', { userId: decoded.userId, email: decoded.email, role: decoded.role });
    }
    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error);
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

