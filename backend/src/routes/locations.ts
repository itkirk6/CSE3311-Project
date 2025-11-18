import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, optionalAuth } from '@/middleware/auth';

const prisma = new PrismaClient();
const router = Router();

console.log("✅ locations router loaded");

// ✅ Create a new location
router.post('/', authenticate, async (req, res, next) => {
  try {
    const body = req.body ?? {};

    const validationErrors: string[] = [];

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const locationType = typeof body.locationType === 'string' ? body.locationType.trim() : '';
    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);
    const country = typeof body.country === 'string' && body.country.trim().length > 0 ? body.country.trim() : 'US';

    if (!name) validationErrors.push('name is required.');
    if (!locationType) validationErrors.push('locationType is required.');
    if (!Number.isFinite(latitude)) validationErrors.push('latitude must be a valid number.');
    if (!Number.isFinite(longitude)) validationErrors.push('longitude must be a valid number.');

    if (validationErrors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: validationErrors });
    }

    const imagePayload = Array.isArray(body.images)
      ? body.images
          .filter((img: unknown): img is string => typeof img === 'string' && img.trim().length > 0)
          .slice(0, 5)
      : undefined;

    const payload: Record<string, any> = {
      name,
      locationType,
      latitude,
      longitude,
      country,
      verified: false,
      isActive: true,
      createdById: req.user?.id,
    };

    const optionalTextFields: Record<string, unknown> = {
      description: body.description,
      address: body.address,
      city: body.city,
      state: body.state,
      terrainType: body.terrainType,
      climateZone: body.climateZone,
      safetyNotes: body.safetyNotes,
      regulations: body.regulations,
      websiteUrl: body.websiteUrl,
    };

    Object.entries(optionalTextFields).forEach(([key, value]) => {
      if (typeof value === 'string' && value.trim().length > 0) {
        payload[key] = value.trim();
      }
    });

    const numericFields: Record<string, unknown> = {
      elevation: body.elevation,
      costPerNight: body.costPerNight,
      maxCapacity: body.maxCapacity,
      difficultyLevel: body.difficultyLevel,
    };

    Object.entries(numericFields).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        const num = Number(value);
        if (Number.isFinite(num)) {
          payload[key] = num;
        }
      }
    });

    if (typeof body.petFriendly === 'boolean') {
      payload.petFriendly = body.petFriendly;
    }

    if (typeof body.reservationRequired === 'boolean') {
      payload.reservationRequired = body.reservationRequired;
    }

    if (body.seasonStart) {
      const seasonStart = new Date(body.seasonStart);
      if (!isNaN(seasonStart.getTime())) {
        payload.seasonStart = seasonStart;
      }
    }

    if (body.seasonEnd) {
      const seasonEnd = new Date(body.seasonEnd);
      if (!isNaN(seasonEnd.getTime())) {
        payload.seasonEnd = seasonEnd;
      }
    }

    if (body.amenities && Array.isArray(body.amenities)) {
      payload.amenities = body.amenities;
    }

    if (body.contactInfo && typeof body.contactInfo === 'object') {
      payload.contactInfo = body.contactInfo;
    }

    if (imagePayload && imagePayload.length > 0) {
      payload.images = imagePayload;
    }

    const newLocation = await prisma.location.create({ data: payload });
    return res.status(201).json({ success: true, data: newLocation });
  } catch (error) {
    next(error);
    return;
  }
});

// ✅ Public: Recommended locations (only 3)
router.get('/recommended', optionalAuth, async (_req, res, next) => {
  try {
    const locations = await prisma.location.findMany({
      where: { isActive: true, verified: true },
      orderBy: { rating: 'desc' },
      take: 3,
      select: {
        id: true,
        name: true,
        description: true,
        costPerNight: true,
        rating: true,
        images: true,
        city: true,
        state: true,
      },
    });

    const formatted = locations.map((loc) => {
      const imageArray = Array.isArray(loc.images) ? (loc.images as string[]) : [];
      const firstImage = imageArray[0];

      return {
        id: loc.id,
        name: loc.name,
        blurb: loc.description || 'No description available.',
        price: loc.costPerNight ? `$${loc.costPerNight}/night` : '—',
        rating: loc.rating?.toFixed(1) || '—',
        img: firstImage || 'https://via.placeholder.com/600x400?text=No+Image',
        location: [loc.city, loc.state].filter(Boolean).join(', '),
      };
    });

    return res.json({ success: true, data: formatted });
  } catch (error) {
    next(error);
    return;
  }
});

// ✅ All locations
router.get('/all', optionalAuth, async (_req, res, next) => {
  try {
    const locations = await prisma.location.findMany();
    return res.json({ success: true, data: locations });
  } catch (error) {
    next(error);
    return;
  }
});

// ✅ Pending approval locations (admin only)
router.get('/pending', authenticate, async (req, res, next) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const locations = await prisma.location.findMany({
      where: { verified: false },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: locations });
  } catch (error) {
    next(error);
    return;
  }
});


// ✅ Single location by ID
router.get('/id/:id', optionalAuth, async (req, res, next) => {
  try {
    const location = await prisma.location.findUnique({
      where: { id: req.params.id },
    });

    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }

    return res.json({ success: true, data: location });
  } catch (error) {
    next(error);
    return;
  }
});

// ✅ Update a location
router.put('/id/:id', async (req, res, next) => {
  try {
    const location = await prisma.location.update({
      where: { id: req.params.id },
      data: req.body,
    });
    return res.json({ success: true, data: location });
  } catch (error) {
    next(error);
    return;
  }
});

// ✅ Approve a location (admin only)
router.post('/id/:id/approve', authenticate, async (req, res, next) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const location = await prisma.location.update({
      where: { id: req.params.id },
      data: { verified: true },
    });

    return res.json({ success: true, data: location });
  } catch (error) {
    next(error);
    return;
  }
});

// ✅ Delete a location
router.delete('/id/:id', async (req, res, next) => {
  try {
    await prisma.location.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: 'Location deleted successfully' });
  } catch (error) {
    next(error);
    return;
  }
});

export default router;
