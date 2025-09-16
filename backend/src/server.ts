import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import searchRoutes from './routes/search';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'OutdoorSpot Backend is running!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env['NODE_ENV'] || 'development',
  });
});

// Mock API endpoints
app.get('/api/locations', (_req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'Yosemite National Park',
        description: 'Iconic granite cliffs and waterfalls',
        locationType: 'camping',
        latitude: 37.8651,
        longitude: -119.5383,
        city: 'Yosemite Valley',
        state: 'California',
        costPerNight: 35,
        difficultyLevel: 3,
        terrainType: 'mountain',
        petFriendly: true,
        images: ['https://via.placeholder.com/400x300/4ade80/ffffff?text=Yosemite'],
        averageRating: 4.9,
        reviewCount: 1250
      },
      {
        id: '2',
        name: 'Glacier National Park',
        description: 'Pristine wilderness with alpine scenery',
        locationType: 'hiking',
        latitude: 48.7596,
        longitude: -113.7870,
        city: 'West Glacier',
        state: 'Montana',
        costPerNight: 30,
        difficultyLevel: 4,
        terrainType: 'mountain',
        petFriendly: false,
        images: ['https://via.placeholder.com/400x300/3b82f6/ffffff?text=Glacier'],
        averageRating: 4.8,
        reviewCount: 890
      },
      {
        id: '3',
        name: 'Grand Canyon National Park',
        description: 'One of the world\'s most spectacular natural wonders',
        locationType: 'photography',
        latitude: 36.1069,
        longitude: -112.1129,
        city: 'Grand Canyon',
        state: 'Arizona',
        costPerNight: 25,
        difficultyLevel: 2,
        terrainType: 'desert',
        petFriendly: true,
        images: ['https://via.placeholder.com/400x300/f59e0b/ffffff?text=Grand+Canyon'],
        averageRating: 4.9,
        reviewCount: 2100
      }
    ]
  });
});

app.get('/api/activities', (_req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'Half Dome Trail',
        activityType: 'hiking',
        difficultyLevel: 5,
        distanceMiles: 16,
        estimatedDurationHours: 12,
        locationName: 'Yosemite National Park',
        highlights: 'Iconic granite dome with cables for the final ascent'
      },
      {
        id: '2',
        name: 'Going-to-the-Sun Road',
        activityType: 'mountain_biking',
        difficultyLevel: 3,
        distanceMiles: 50,
        estimatedDurationHours: 4,
        locationName: 'Glacier National Park',
        highlights: 'Scenic mountain road with breathtaking views'
      }
    ]
  });
});

// Search routes
app.use('/api/search', searchRoutes);

// Mock auth endpoints
app.post('/api/auth/register', (req, res) => {
  res.json({
    success: true,
    message: 'User registered successfully (mock)',
    data: {
      user: {
        id: 'mock-user-id',
        email: req.body.email,
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
      },
      token: 'mock-jwt-token'
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login successful (mock)',
    data: {
      user: {
        id: 'mock-user-id',
        email: req.body.email,
        username: 'mockuser',
        firstName: 'Mock',
        lastName: 'User',
      },
      token: 'mock-jwt-token'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env['NODE_ENV'] || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API endpoints: http://localhost:${PORT}/api/locations`);
});

export default app;