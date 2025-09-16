import { Router, Request, Response } from 'express';
import { optionalAuth } from '../middleware/auth';
import { getWeatherForLocation } from '../utils/weather';

const router = Router();

// Mock data for search
const mockLocations = [
  {
    id: 1,
    name: 'Yosemite National Park',
    description: 'Iconic granite cliffs, waterfalls, and ancient sequoias await you in this world-renowned park.',
    location: 'California',
    coordinates: { lat: 37.8651, lng: -119.5383 },
    activities: ['Camping', 'Hiking', 'Photography', 'Rock Climbing'],
    amenities: ['Restrooms', 'Water', 'Parking', 'Visitor Center'],
    rating: 4.9,
    price: 35,
    images: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=600&fit=crop'
    ],
    availability: true
  },
  {
    id: 2,
    name: 'Glacier National Park',
    description: 'Pristine wilderness with over 700 miles of trails and stunning alpine scenery.',
    location: 'Montana',
    coordinates: { lat: 48.7596, lng: -113.7870 },
    activities: ['Camping', 'Hiking', 'Wildlife Viewing', 'Photography'],
    amenities: ['Restrooms', 'Water', 'Parking', 'Lodge'],
    rating: 4.8,
    price: 30,
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1464822759844-d150baec5c2b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
    ],
    availability: true
  },
  {
    id: 3,
    name: 'Grand Canyon National Park',
    description: 'One of the world\'s most spectacular natural wonders with incredible hiking opportunities.',
    location: 'Arizona',
    coordinates: { lat: 36.1069, lng: -112.1129 },
    activities: ['Camping', 'Hiking', 'Photography', 'River Rafting'],
    amenities: ['Restrooms', 'Water', 'Parking', 'Visitor Center'],
    rating: 4.9,
    price: 25,
    images: [
      'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
    ],
    availability: true
  },
  {
    id: 4,
    name: 'Rocky Mountain National Park',
    description: 'High-altitude adventures with stunning mountain views and diverse wildlife.',
    location: 'Colorado',
    coordinates: { lat: 40.3428, lng: -105.6836 },
    activities: ['Camping', 'Hiking', 'Mountain Biking', 'Climbing'],
    amenities: ['Restrooms', 'Water', 'Parking', 'Visitor Center'],
    rating: 4.7,
    price: 28,
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1464822759844-d150baec5c2b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
    ],
    availability: true
  },
  {
    id: 5,
    name: 'Lake Tahoe',
    description: 'Crystal-clear waters surrounded by majestic mountains, perfect for water activities.',
    location: 'California',
    coordinates: { lat: 39.0968, lng: -120.0324 },
    activities: ['Camping', 'Kayaking', 'Swimming', 'Photography'],
    amenities: ['Restrooms', 'Water', 'Parking', 'Marina'],
    rating: 4.8,
    price: 40,
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1464822759844-d150baec5c2b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
    ],
    availability: true
  },
  {
    id: 6,
    name: 'Zion National Park',
    description: 'Dramatic red cliffs and narrow slot canyons create an otherworldly hiking experience.',
    location: 'Utah',
    coordinates: { lat: 37.2982, lng: -113.0263 },
    activities: ['Camping', 'Hiking', 'Photography', 'Canyoneering'],
    amenities: ['Restrooms', 'Water', 'Parking', 'Visitor Center'],
    rating: 4.9,
    price: 30,
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1464822759844-d150baec5c2b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
    ],
    availability: true
  },
  {
    id: 7,
    name: 'Yellowstone National Park',
    description: 'America\'s first national park featuring geysers, hot springs, and abundant wildlife.',
    location: 'Wyoming',
    coordinates: { lat: 44.4280, lng: -110.5885 },
    activities: ['Camping', 'Hiking', 'Wildlife Viewing', 'Photography'],
    amenities: ['Restrooms', 'Water', 'Parking', 'Visitor Center'],
    rating: 4.8,
    price: 32,
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1464822759844-d150baec5c2b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
    ],
    availability: true
  },
  {
    id: 8,
    name: 'Acadia National Park',
    description: 'Rugged Atlantic coastline with granite peaks, woodlands, and lakes.',
    location: 'Maine',
    coordinates: { lat: 44.3386, lng: -68.2733 },
    activities: ['Camping', 'Hiking', 'Kayaking', 'Photography'],
    amenities: ['Restrooms', 'Water', 'Parking', 'Visitor Center'],
    rating: 4.7,
    price: 30,
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1464822759844-d150baec5c2b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
    ],
    availability: true
  },
  {
    id: 9,
    name: 'Dinosaur Valley State Park',
    description: 'Walk in the footsteps of dinosaurs along the Paluxy River with authentic dinosaur tracks.',
    location: 'Glen Rose, Texas',
    coordinates: { lat: 32.2509, lng: -97.8256 },
    activities: ['Camping', 'Hiking', 'Swimming', 'Fossil Hunting'],
    amenities: ['Restrooms', 'Water', 'Parking', 'Visitor Center', 'Picnic Areas'],
    rating: 4.6,
    price: 22,
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1464822759844-d150baec5c2b?w=800&h=600&fit=crop'
    ],
    availability: true
  },
  {
    id: 10,
    name: 'Cedar Hill State Park',
    description: 'Beautiful park on Joe Pool Lake with hiking trails, camping, and water activities.',
    location: 'Cedar Hill, Texas',
    coordinates: { lat: 32.5876, lng: -96.9667 },
    activities: ['Camping', 'Hiking', 'Fishing', 'Boating', 'Swimming'],
    amenities: ['Restrooms', 'Water', 'Parking', 'Marina', 'Boat Ramp'],
    rating: 4.4,
    price: 18,
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1464822759844-d150baec5c2b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
    ],
    availability: true
  },
  {
    id: 11,
    name: 'Lake Mineral Wells State Park',
    description: 'Scenic lake park with rock climbing, hiking trails, and excellent camping facilities.',
    location: 'Mineral Wells, Texas',
    coordinates: { lat: 32.8121, lng: -98.0914 },
    activities: ['Camping', 'Hiking', 'Rock Climbing', 'Fishing', 'Swimming'],
    amenities: ['Restrooms', 'Water', 'Parking', 'Climbing Area', 'Swim Beach'],
    rating: 4.5,
    price: 20,
    images: [
      'https://images.unsplash.com/photo-1464822759844-d150baec5c2b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1464822759844-d150baec5c2b?w=800&h=600&fit=crop'
    ],
    availability: true
  },
  {
    id: 12,
    name: 'Cleburne State Park',
    description: 'Peaceful park with spring-fed lake, hiking trails, and family-friendly camping.',
    location: 'Cleburne, Texas',
    coordinates: { lat: 32.3510, lng: -97.3906 },
    activities: ['Camping', 'Hiking', 'Fishing', 'Swimming', 'Wildlife Viewing'],
    amenities: ['Restrooms', 'Water', 'Parking', 'Swim Beach', 'Fishing Pier'],
    rating: 4.3,
    price: 16,
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1464822759844-d150baec5c2b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
    ],
    availability: true
  },
  {
    id: 13,
    name: 'Fort Worth Nature Center',
    description: 'Urban nature preserve with extensive hiking trails and wildlife viewing opportunities.',
    location: 'Fort Worth, Texas',
    coordinates: { lat: 32.7767, lng: -97.3453 },
    activities: ['Hiking', 'Wildlife Viewing', 'Photography', 'Nature Education'],
    amenities: ['Restrooms', 'Visitor Center', 'Parking', 'Nature Trails'],
    rating: 4.7,
    price: 0,
    images: [
      'https://images.unsplash.com/photo-1464822759844-d150baec5c2b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1464822759844-d150baec5c2b?w=800&h=600&fit=crop'
    ],
    availability: true
  },
  {
    id: 14,
    name: 'Eagle Mountain Lake',
    description: 'Popular lake destination with camping, fishing, and water sports activities.',
    location: 'Fort Worth, Texas',
    coordinates: { lat: 32.9201, lng: -97.4711 },
    activities: ['Camping', 'Fishing', 'Boating', 'Swimming', 'Kayaking'],
    amenities: ['Restrooms', 'Water', 'Parking', 'Marina', 'Boat Ramp'],
    rating: 4.2,
    price: 15,
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1464822759844-d150baec5c2b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
    ],
    availability: true
  },
  {
    id: 15,
    name: 'Possum Kingdom State Park',
    description: 'Stunning lake park with dramatic cliffs, crystal clear water, and excellent camping.',
    location: 'Caddo, Texas',
    coordinates: { lat: 33.0862, lng: -98.5245 },
    activities: ['Camping', 'Hiking', 'Swimming', 'Rock Climbing', 'Scuba Diving'],
    amenities: ['Restrooms', 'Water', 'Parking', 'Swim Beach', 'Marina'],
    rating: 4.6,
    price: 25,
    images: [
      'https://images.unsplash.com/photo-1464822759844-d150baec5c2b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1464822759844-d150baec5c2b?w=800&h=600&fit=crop'
    ],
    availability: true
  }
];

const mockActivities = [
  { id: 1, name: 'Camping', description: 'Overnight stays in tents or RVs', category: 'Accommodation' },
  { id: 2, name: 'Hiking', description: 'Walking trails and nature paths', category: 'Outdoor' },
  { id: 3, name: 'Mountain Biking', description: 'Cycling on mountain trails', category: 'Outdoor' },
  { id: 4, name: 'Kayaking', description: 'Paddling on lakes and rivers', category: 'Water' },
  { id: 5, name: 'Photography', description: 'Capturing nature and landscapes', category: 'Creative' },
  { id: 6, name: 'Rock Climbing', description: 'Climbing natural rock formations', category: 'Adventure' },
  { id: 7, name: 'Wildlife Viewing', description: 'Observing animals in their natural habitat', category: 'Nature' },
  { id: 8, name: 'Swimming', description: 'Water activities in natural bodies', category: 'Water' },
  { id: 9, name: 'Fishing', description: 'Catching fish in lakes and rivers', category: 'Water' },
  { id: 10, name: 'Boating', description: 'Motorized and non-motorized watercraft', category: 'Water' },
  { id: 11, name: 'Fossil Hunting', description: 'Searching for prehistoric remains', category: 'Nature' },
  { id: 12, name: 'Scuba Diving', description: 'Underwater exploration and diving', category: 'Water' }
];

// Search locations endpoint
router.get('/locations', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, activity, state, limit = 10 } = req.query;
    
    let filteredLocations = [...mockLocations];
    
    // Filter by search query
    if (q && typeof q === 'string') {
      const query = q.toLowerCase();
      filteredLocations = filteredLocations.filter(location => 
        location.name.toLowerCase().includes(query) ||
        location.description.toLowerCase().includes(query) ||
        location.location.toLowerCase().includes(query) ||
        location.activities.some(act => act.toLowerCase().includes(query))
      );
    }
    
    // Filter by activity
    if (activity && typeof activity === 'string') {
      filteredLocations = filteredLocations.filter(location =>
        location.activities.some(act => 
          act.toLowerCase().includes(activity.toLowerCase())
        )
      );
    }
    
    // Filter by state
    if (state && typeof state === 'string') {
      filteredLocations = filteredLocations.filter(location =>
        location.location.toLowerCase().includes(state.toLowerCase())
      );
    }
    
    // Limit results
    const limitNum = parseInt(limit as string);
    filteredLocations = filteredLocations.slice(0, limitNum);
    
    // Add weather data to each location
    const locationsWithWeather = await Promise.all(
      filteredLocations.map(async (location) => {
        const weather = await getWeatherForLocation(location.name);
        return {
          ...location,
          weather
        };
      })
    );
    
    res.json({
      success: true,
      data: locationsWithWeather,
      total: locationsWithWeather.length,
      query: { q, activity, state, limit }
    });
  } catch (error) {
    console.error('Search locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Search activities endpoint
router.get('/activities', optionalAuth, (req: Request, res: Response): void => {
  try {
    const { q, category, limit = 10 } = req.query;
    
    let filteredActivities = [...mockActivities];
    
    // Filter by search query
    if (q && typeof q === 'string') {
      const query = q.toLowerCase();
      filteredActivities = filteredActivities.filter(activity =>
        activity.name.toLowerCase().includes(query) ||
        activity.description.toLowerCase().includes(query)
      );
    }
    
    // Filter by category
    if (category && typeof category === 'string') {
      filteredActivities = filteredActivities.filter(activity =>
        activity.category.toLowerCase().includes(category.toLowerCase())
      );
    }
    
    // Limit results
    const limitNum = parseInt(limit as string);
    filteredActivities = filteredActivities.slice(0, limitNum);
    
    res.json({
      success: true,
      data: filteredActivities,
      total: filteredActivities.length,
      query: { q, category, limit }
    });
  } catch (error) {
    console.error('Search activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Combined search endpoint
router.get('/', optionalAuth, (req: Request, res: Response): void => {
  try {
    const { q, activity, state, category, type = 'all' } = req.query;
    
    let results: any = {
      locations: [],
      activities: []
    };
    
    if (type === 'all' || type === 'locations') {
      let filteredLocations = [...mockLocations];
      
      if (q && typeof q === 'string') {
        const query = q.toLowerCase();
        filteredLocations = filteredLocations.filter(location => 
          location.name.toLowerCase().includes(query) ||
          location.description.toLowerCase().includes(query) ||
          location.location.toLowerCase().includes(query) ||
          location.activities.some(act => act.toLowerCase().includes(query))
        );
      }
      
      if (activity && typeof activity === 'string') {
        filteredLocations = filteredLocations.filter(location =>
          location.activities.some(act => 
            act.toLowerCase().includes(activity.toLowerCase())
          )
        );
      }
      
      if (state && typeof state === 'string') {
        filteredLocations = filteredLocations.filter(location =>
          location.location.toLowerCase().includes(state.toLowerCase())
        );
      }
      
      results.locations = filteredLocations.slice(0, 6);
    }
    
    if (type === 'all' || type === 'activities') {
      let filteredActivities = [...mockActivities];
      
      if (q && typeof q === 'string') {
        const query = q.toLowerCase();
        filteredActivities = filteredActivities.filter(activity =>
          activity.name.toLowerCase().includes(query) ||
          activity.description.toLowerCase().includes(query)
        );
      }
      
      if (category && typeof category === 'string') {
        filteredActivities = filteredActivities.filter(activity =>
          activity.category.toLowerCase().includes(category.toLowerCase())
        );
      }
      
      results.activities = filteredActivities.slice(0, 8);
    }
    
    res.json({
      success: true,
      data: results,
      query: { q, activity, state, category, type }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Find nearby locations
router.get('/nearby', optionalAuth, (req: Request, res: Response): void => {
  try {
    const { lat, lng, radius = 50, limit = 10 } = req.query;
    
    if (!lat || !lng) {
      res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
      return;
    }
    
    const userLat = parseFloat(lat as string);
    const userLng = parseFloat(lng as string);
    const radiusKm = parseFloat(radius as string);
    
    // Simple distance calculation (not perfect but good for demo)
    const locationsWithDistance = mockLocations.map(location => {
      const distance = Math.sqrt(
        Math.pow(location.coordinates.lat - userLat, 2) + 
        Math.pow(location.coordinates.lng - userLng, 2)
      ) * 111; // Rough conversion to km
      
      return { ...location, distance };
    });
    
    const nearbyLocations = locationsWithDistance
      .filter(location => location.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, parseInt(limit as string));
    
    res.json({
      success: true,
      data: nearbyLocations,
      total: nearbyLocations.length,
      query: { lat, lng, radius, limit }
    });
  } catch (error) {
    console.error('Nearby search error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
