/**
 * JWT Authentication Middleware
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { fail } from '../utils/response';

// Extend Express Request type to include user info
declare global {
  namespace Express {
    interface Request {
      userId?: number;
      userOpenid?: string;
    }
  }
}

interface JwtPayload {
  id: number;
  openid: string;
}

const getJwtSecret = () => process.env.JWT_SECRET || 'tally-pro-secret-key';

/**
 * Middleware that requires a valid JWT token in the Authorization header.
 * Attaches userId and userOpenid to the request object.
 */
export function authRequired(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json(fail('未提供认证令牌', 401));
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;

    req.userId = decoded.id;
    req.userOpenid = decoded.openid;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json(fail('认证令牌已过期', 401));
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json(fail('无效的认证令牌', 401));
      return;
    }
    res.status(500).json(fail('认证失败'));
  }
}

/**
 * Sign a JWT token for a user
 */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '30d' });
}
