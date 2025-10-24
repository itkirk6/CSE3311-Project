'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import NavBar from '@/app/components/NavBar';
import Footer from '@/app/components/Footer';
import PageShell from '@/app/components/PageShell';
import MapComponent from '@/app/components/MapComponent';

type Location = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  price?: string;
  rating?: number;
  images?: any; // JSON or array
};

export default function LocationsPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  // Fetch all locations
  useEffect(() => {
    (async () => {
      try {
        if (!API_URL || API_URL === 'undefined') throw new Error('Backend URL not configured');

        const res = await fetch(`${API_URL}/api/locations/all`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: (AbortSignal as any).timeout ? (AbortSignal as any).timeout(5000) : undefined,
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }

        const json = await res.json();
        if (json?.success) setLocations(json.data || []);
        else throw new Error('API returned unsuccessful response');
      } catch (e: any) {
        console.error(e);
        setError(e?.message || 'Failed to load locations.');
        setLocations([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [API_URL]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  // Safely extract first image (fallbacks to placeholder)
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
    <main className="min-h-screen text-neutral-100">
      {/* Fixed header */}
      <NavBar />

      {/* PageShell gives us a scrollable image background with a bottom fade */}
      <PageShell
        imageSrc="/locations_screen.jpg"   // ⬅️ image instead of video
        fadeHeight="40vh"                  // subtle longer fade than the default
        withFixedHeaderOffset              // pushes content below fixed NavBar
      >
        {/* HERO (content sits in foreground; background image scrolls independently) */}
        <section className="pt-28 pb-24">
          <div className="mx-auto w-full max-w-3xl text-center space-y-8">
            <h1 className="text-4xl sm:text-5xl font-extrabold">
              Explore New Destinations
            </h1>

            <form
              onSubmit={handleSearch}
              className="flex rounded-2xl overflow-hidden border border-neutral-800 shadow-lg"
            >
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
        </section>

        {/* MAP */}
        <section className="py-10">
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
              initialCenter={{ lat: 32.85, lng: -97.01 }}
              initialZoom={8}
              preferCenter
            />
          </div>
        </section>

        {/* GRID */}
        <section className="pt-14 pb-20">
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
                  className="relative group rounded-2xl border border-neutral-800 bg-neutral-900 hover:border-emerald-600 transition overflow-hidden"
                >
                  {/* Make whole card clickable */}
                  <Link
                    href={`/location?id=${encodeURIComponent(loc.id)}`}
                    className="absolute inset-0 z-10"
                    aria-label={`View details for ${loc.name}`}
                  />

                  <div className="h-48 relative">
                    <img
                      src={getFirstImage(loc.images)}
                      alt={loc.name}
                      className="object-cover w-full h-full"
                      loading="lazy"
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
      </PageShell>
    </main>
  );
}
