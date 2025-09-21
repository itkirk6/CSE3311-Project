import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a dummy user for seeding reviews (to handle ratings)
  const dummyUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      username: 'seeduser',
      passwordHash: 'dummyhash', // Note: In production, use a proper hash
      firstName: 'Seed',
      lastName: 'User',
    },
  });

  // Hardcoded mock locations data (exactly as provided)
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
      activities: ['Camping', 'Hiking', 'Wildlife Viewing'],
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
  ];

  for (const loc of mockLocations) {
    // Determine locationType based on name
    let locationType = 'park';
    if (loc.name.toLowerCase().includes('national park')) {
      locationType = 'national_park';
    } else if (loc.name.toLowerCase().includes('lake')) {
      locationType = 'lake';
    }

    // Create or skip location
    let location = await prisma.location.findFirst({ where: { name: loc.name } });
    if (!location) {
      location = await prisma.location.create({
        data: {
          name: loc.name,
          description: loc.description,
          locationType,
          latitude: loc.coordinates.lat,
          longitude: loc.coordinates.lng,
          state: loc.location,
          country: 'US',
          amenities: loc.amenities,
          costPerNight: loc.price,
          images: loc.images,
          verified: true,
          isActive: loc.availability,
        },
      });
    }

    // Seed activities from the activities array
    for (const act of loc.activities) {
      const existingAct = await prisma.activity.findFirst({
        where: {
          locationId: location.id,
          name: act,
        },
      });

      if (!existingAct) {
        await prisma.activity.create({
          data: {
            locationId: location.id,
            activityType: act.toLowerCase().replace(/ /g, '_'),
            name: act,
            description: `Enjoy ${act} at ${loc.name}`,
          },
        });
      }
    }

    // Seed a review to capture the rating (since rating isn't directly on Location)
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: dummyUser.id,
        locationId: location.id,
      },
    });

    if (!existingReview) {
      await prisma.review.create({
        data: {
          userId: dummyUser.id,
          locationId: location.id,
          rating: Math.round(loc.rating), // Round to nearest int (1-5)
          content: 'Seeded review to match mock rating',
        },
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });