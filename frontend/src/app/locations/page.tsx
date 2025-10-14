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
  coordinates: { lat: number; lng: number };
  description?: string;
  price?: string;
  rating?: number;
  images?: string[];
  location?: string;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const fetchLocations = async () => {
    try {
      const res = await fetch(`${API_URL}/api/locations`);
      const json = await res.json();
      if (json.success) setLocations(json.data);
      else setError('Failed to load locations.');
    } catch (e) {
      console.error(e);
      setError('Error loading locations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <main className="flex flex-col min-h-screen bg-neutral-900 text-neutral-100">
      <NavBar />

      {/* Hero section with background image */}
      <section className="relative h-[70vh] w-full overflow-hidden">
        <Image
          src="/locations_screen.jpg"
          alt="Locations background"
          fill
          priority
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/60 via-neutral-950/40 to-neutral-900" />
        <div className="relative z-10 flex h-full items-center justify-center">
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
      <section className="py-12 px-6 max-w-7xl mx-auto w-full">
        <h2 className="text-2xl font-bold mb-6">Interactive Map</h2>
        <div className="rounded-2xl overflow-hidden border border-neutral-800">
          <MapComponent
            locations={locations.map((loc) => ({
              id: loc.id,
              name: loc.name,
              latitude: loc.coordinates.lat,
              longitude: loc.coordinates.lng,
              address: loc.location || '',
              city: '',
              state: '',
              activities: [],
              rating: loc.rating || 0,
              price: Number(loc.price) || 0,
              images: loc.images || [],
              availability: true,
            }))}
            onLocationSelect={(location) => {
              const el = document.getElementById(`location-${location.id}`);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
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
                id={`location-${loc.id}`}
                className="rounded-2xl border border-neutral-800 bg-neutral-900 hover:border-emerald-600 transition overflow-hidden"
              >
                <div className="h-48 relative">
                  <img
                    src={loc.images?.[0] || '/placeholder.jpg'}
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
