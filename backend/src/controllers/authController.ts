import { Request, Response, NextFunction } from 'express';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import { prisma } from '@/server';
import { CustomError } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';

// Register new user (mock version)
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, username, password, firstName, lastName } = req.body;

    // Validate required fields
    if (!email || !username || !password) {
      throw new CustomError('Email, username, and password are required', 400);
    }

    // Mock response for now
    const user = {
      id: 'mock-user-id',
      email,
      username,
      firstName,
      lastName,
      createdAt: new Date(),
    };

    const token = 'mock-jwt-token';

    res.status(201).json({
      success: true,
      message: 'User registered successfully (mock)',
      data: {
        user,
        token,
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user (mock version)
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      throw new CustomError('Email and password are required', 400);
    }

    // Mock response for now
    const user = {
      id: 'mock-user-id',
      email,
      username: 'mockuser',
      firstName: 'Mock',
      lastName: 'User',
      isActive: true,
    };

    const token = 'mock-jwt-token';

    res.json({
      success: true,
      message: 'Login successful (mock)',
      data: {
        user,
        token,
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user profile (mock version)
export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = {
      id: 'mock-user-id',
      email: 'mock@example.com',
      username: 'mockuser',
      firstName: 'Mock',
      lastName: 'User',
      avatarUrl: null,
      bio: 'This is a mock user profile',
      locationPreferences: null,
      activityPreferences: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile (mock version)
export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { firstName, lastName, bio, locationPreferences, activityPreferences } = req.body;

    const user = {
      id: 'mock-user-id',
      email: 'mock@example.com',
      username: 'mockuser',
      firstName,
      lastName,
      avatarUrl: null,
      bio,
      locationPreferences,
      activityPreferences,
      updatedAt: new Date(),
    };

    res.json({
      success: true,
      message: 'Profile updated successfully (mock)',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};