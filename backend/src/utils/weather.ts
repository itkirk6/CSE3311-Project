import { Router } from 'express';

const router = Router();

// Dummy weather endpoint
router.get('/', async (_req, res, next) => {
  try {
    // Replace this with a real API call later
    const dummyWeather = {
      location: 'Sample City',
      temperature: 72,
      condition: 'Sunny',
      forecast: [
        { day: 'Monday', high: 75, low: 60, condition: 'Partly Cloudy' },
        { day: 'Tuesday', high: 78, low: 62, condition: 'Sunny' },
        { day: 'Wednesday', high: 70, low: 58, condition: 'Rain' },
      ],
    };

    res.json({ success: true, data: dummyWeather });
  } catch (error) {
    next(error);
  }
});

export default router;
