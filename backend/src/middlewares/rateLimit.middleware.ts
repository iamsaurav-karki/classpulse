import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../config/redis';
import { sendError } from '../utils/response';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  keyGenerator?: (req: Request) => string; // Custom key generator
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export const createRateLimiter = (options: RateLimitOptions) => {
  const {
    windowMs,
    max,
    keyGenerator = (req: Request) => {
      // Default: use IP address or user ID if authenticated
      return req.user?.userId || req.ip || 'unknown';
    },
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const redis = getRedisClient();
      
      // Check if Redis is connected and ready
      if (!redis || (redis.status !== 'ready' && redis.status !== 'connect')) {
        // If Redis is not connected, allow request (fail open)
        console.warn('Redis not ready, skipping rate limit check');
        next();
        return;
      }

      // Try to ping Redis to ensure it's actually working
      try {
        await redis.ping();
      } catch (pingError) {
        // If ping fails, Redis is not available, allow request
        console.warn('Redis ping failed, skipping rate limit check');
        next();
        return;
      }

      const key = `rate_limit:${keyGenerator(req)}`;
      const now = Date.now();
      const windowStart = now - windowMs;

      // Get current count
      const count = await redis.zcount(key, windowStart, now);

      if (count >= max) {
        const ttl = await redis.ttl(key);
        res.setHeader('Retry-After', Math.ceil(ttl / 1000));
        sendError(
          res,
          `Too many requests. Please try again in ${Math.ceil(ttl / 1000)} seconds.`,
          429
        );
        return;
      }

      // Add current request
      await redis.zadd(key, now, `${now}-${Math.random()}`);
      await redis.expire(key, Math.ceil(windowMs / 1000));

      // Track response status for skip options
      const originalSend = res.send;
      res.send = function (body: any) {
        const statusCode = res.statusCode;
        const isSuccess = statusCode >= 200 && statusCode < 300;
        const isFailure = statusCode >= 400;

        if ((skipSuccessfulRequests && isSuccess) || (skipFailedRequests && isFailure)) {
          // Remove the request from count if we should skip it
          redis.zremrangebyscore(key, now, now).catch(() => {
            // Silently fail if Redis is unavailable
          });
        }

        return originalSend.call(this, body);
      };

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      // On Redis error, allow request (fail open) - don't block users if Redis is down
      next();
    }
  };
};

// Pre-configured rate limiters
export const generalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes (increased for development)
});

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 login attempts per 15 minutes (increased)
  keyGenerator: (req) => `auth:${req.ip || 'unknown'}`,
});

export const questionRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 questions per hour (increased)
  keyGenerator: (req) => `question:${req.user?.userId || req.ip || 'unknown'}`,
});

export const answerRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 200, // 200 answers per hour (increased)
  keyGenerator: (req) => `answer:${req.user?.userId || req.ip || 'unknown'}`,
});

