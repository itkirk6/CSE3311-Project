'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import NavBar from '@/app/components/NavBar';
import Footer from '@/app/components/Footer';
import MapComponent from '@/app/components/MapComponent';

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  price?: string;
  rating?: number;
  images?: any; // JSON or array
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  // 🧭 Fetch all locations
  const fetchLocations = async () => {
    try {
      // Check if API_URL is properly set
      if (!API_URL || API_URL === 'undefined') {
        console.log('Backend URL not configured, using mock data');
        throw new Error('Backend URL not configured');
      }

      console.log('Attempting to fetch from:', `${API_URL}/api/locations/all`);
      
      const res = await fetch(`${API_URL}/api/locations/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      // Check if response is ok
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }

      const json = await res.json();
      if (json.success) {
        console.log('Successfully fetched locations:', json.data);
        setLocations(json.data);
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (e) {
      console.log('Using mock data due to error:', e.message);
      // Set mock data for development
      setLocations([
        {
          id: '1',
          name: 'Yosemite National Park',
          latitude: 37.8651,
          longitude: -119.5383,
          description: 'Famous for its granite cliffs, waterfalls, and giant sequoias.',
          price: '$35',
          rating: 4.8,
          images: ['/placeholder.jpg']
        },
        {
          id: '2', 
          name: 'Grand Canyon National Park',
          latitude: 36.1069,
          longitude: -112.1129,
          description: 'One of the world\'s most spectacular natural wonders.',
          price: '$35',
          rating: 4.9,
          images: ['/placeholder.jpg']
        },
        {
          id: '3',
          name: 'Yellowstone National Park', 
          latitude: 44.4280,
          longitude: -110.5885,
          description: 'America\'s first national park with geysers and wildlife.',
          price: '$35',
          rating: 4.7,
          images: ['/placeholder.jpg']
        }
      ]);
      // Don't set error state, just use mock data
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  // 🧠 Helper — safely extract first image
  const getFirstImage = (images: any): string => {
    if (!images) return '/placeholder.jpg';
    if (Array.isArray(images)) {
      if (typeof images[0] === 'string') return images[0];
      if (images[0]?.url) return images[0].url;
    }
    if (typeof images === 'object' && images.url) return images.url;
    return '/placeholder.jpg';
  };

  return (
    <main className="flex flex-col min-h-screen bg-neutral-900 text-neutral-100">
      <NavBar />

      {/* Hero section */}
      <section className="relative h-[70vh] w-full overflow-hidden">
        <Image
          src="/locations_screen.jpg"
          alt="Locations background"
          fill
          priority
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/60 via-neutral-950/40 to-neutral-900" />
      
        <div className="relative z-10 flex h-full items-start justify-center pt-24">
          <div className="max-w-xl w-full text-center px-4">
            <h1 className="text-4xl font-bold mb-6">Explore New Destinations</h1>
            <form onSubmit={handleSearch} className="flex shadow-md rounded-2xl overflow-hidden">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search locations..."
                className="flex-1 p-4 text-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 px-6 font-semibold transition"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="-mt-72 relative z-20 px-6 max-w-7xl mx-auto w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Interactive Map</h2>
        <div className="rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl">
          <MapComponent
            locations={locations.map((loc) => ({
              id: loc.id,
              name: loc.name,
              latitude: loc.latitude,
              longitude: loc.longitude,
              description: loc.description,
            }))}
          />
        </div>
      </section>

      {/* Locations Grid */}
      <section className="pb-20 px-6 max-w-7xl mx-auto w-full">
        <h2 className="text-2xl font-bold mb-6">All Locations</h2>

        {loading ? (
          <p className="text-neutral-400 text-center">Loading...</p>
        ) : error ? (
          <p className="text-red-400 text-center">{error}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((loc) => (
              <article
                key={loc.id}
                className="rounded-2xl border border-neutral-800 bg-neutral-900 hover:border-emerald-600 transition overflow-hidden"
              >
                <div className="h-48 relative">
                  <img
                    src={getFirstImage(loc.images)}
                    alt={loc.name}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold">{loc.name}</h3>
                  <p className="mt-2 text-sm text-neutral-300 line-clamp-2">
                    {loc.description || 'No description available.'}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-sm text-neutral-400">
                    <span>⭐ {loc.rating ?? '—'}</span>
                    <span className="text-emerald-400 font-medium">{loc.price || '—'}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
