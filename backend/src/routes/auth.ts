import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticate } from '@/middleware/auth';

const prisma = new PrismaClient();
const router = Router();

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, username, firstName, lastName } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { 
        email, 
        username, 
        passwordHash: hashedPassword,
        firstName,
        lastName 
      }
    });

    res.status(201).json({ 
      id: user.id, 
      email: user.email, 
      username: user.username, 
      firstName: user.firstName, 
      lastName: user.lastName 
    });

  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      res.status(401).json({ error: 'Invalid email or password' });
    } else {

      // Generate a JWT token
      const token = jwt.sign(
        { userId: user.id },
        process.env["JWT_SECRET"] as string,
        { expiresIn: '1h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    }
  } catch (err) {
    next(err);
  }
});


// Verify token (for debugging / checking auth)
router.get('/verify', authenticate, async (req: any, res, next) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (error) {
    next(error);
  }
});


export default router;
