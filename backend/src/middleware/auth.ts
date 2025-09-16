import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';
// import { prisma } from '../server';
import { CustomError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new CustomError('Access denied. No token provided.', 401);
    }

    // Mock authentication for now
    if (token === 'mock-jwt-token') {
      req.user = {
        id: 'mock-user-id',
        email: 'mock@example.com',
        username: 'mockuser',
      };
      return next();
    }

    throw new CustomError('Invalid token.', 401);
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return next();
    }

    // Mock authentication for now
    if (token === 'mock-jwt-token') {
      req.user = {
        id: 'mock-user-id',
        email: 'mock@example.com',
        username: 'mockuser',
      };
    }

    next();
  } catch (error) {
    // For optional auth, we don't throw errors, just continue without user
    next();
  }
};

export const requireAdmin = (
  _req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  // This would be implemented when you add admin roles
  // For now, we'll just pass through
  next();
};