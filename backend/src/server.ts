import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import locationsRouter from './routes/locations';
import reviewsRouter from './routes/reviews';
import searchRouter from './routes/search';
import usersRouter from './routes/users';
import authRouter from './routes/auth';

import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

// Static assets
// Allow the server to serve images regardless of whether we're running the
// TypeScript sources directly or from the compiled dist/ folder. The list is
// ordered by most to least specific expected locations.
const imageDirectories = [
  path.resolve(__dirname, '../public/images'),
  path.resolve(__dirname, '../../images'),
  path.resolve(__dirname, '../../frontend/public/images'),
  path.resolve(process.cwd(), 'public/images'),
  path.resolve(process.cwd(), '../public/images'),
  path.resolve(process.cwd(), '../frontend/public/images'),
].filter((dir, index, directories) => directories.indexOf(dir) === index);

const uniqueExistingImageDirectories = candidateImageDirectories
  .filter((dir, index, directories) => directories.indexOf(dir) === index)
  .filter((dir) => fs.existsSync(dir));

if (uniqueExistingImageDirectories.length > 0) {
  uniqueExistingImageDirectories.forEach((dir) => {
    app.use('/images', express.static(dir));
  });
} else {
  console.warn('⚠️  No images directory found for static serving.');
}

// Routes
app.use('/api/locations', locationsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/search', searchRouter);
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);

// Root health check
app.get('/', (_req, res) => {
  res.json({ success: true, message: 'API is running and connected to database!' });
});

// Error handler (must come last)
app.use(errorHandler);


const PORT = process.env['PORT'];
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
