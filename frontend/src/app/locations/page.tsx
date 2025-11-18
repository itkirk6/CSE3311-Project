'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import NavBar from '@/app/components/NavBar';
import Footer from '@/app/components/Footer';
import PageShell from '@/app/components/PageShell';
import MapComponent from '@/app/components/MapComponent';
import Backplate from '@/app/components/Backplate';
import { useAuth } from '@/app/context/AuthContext';

type LocationImageEntry = string | { url?: string | null } | null;
type LocationImages = LocationImageEntry[] | LocationImageEntry | null;

type Location = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  price?: string;
  rating?: number;
  images?: LocationImages;
};

export default function LocationsPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { isAuthenticated } = useAuth();

  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        if (!API_URL || API_URL === 'undefined') throw new Error('Backend URL not configured');

        const res = await fetch(`${API_URL}/api/locations/all`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }

        const json = await res.json();
        if (json?.success) setLocations(json.data || []);
        else throw new Error('API returned unsuccessful response');
        } catch (e) {
          console.error(e);
          const message = e instanceof Error ? e.message : 'Failed to load locations.';
          setError(message);
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

  const extractImageUrl = (entry: LocationImageEntry | undefined | null): string | null => {
    if (!entry) return null;
    if (typeof entry === 'string' && entry.trim().length > 0) {
      return entry;
    }
    if (typeof entry === 'object' && typeof entry.url === 'string' && entry.url.trim().length > 0) {
      return entry.url;
    }
    return null;
  };

  const getFirstImage = (images: Location['images']): string => {
    if (!images) return '/placeholder.jpg';
    if (Array.isArray(images)) {
      for (const item of images) {
        const url = extractImageUrl(item);
        if (url) return url;
      }
      return '/placeholder.jpg';
    }
    return extractImageUrl(images) ?? '/placeholder.jpg';
  };

  return (
    <main className="min-h-screen text-neutral-100">
      <NavBar />

      <PageShell
        imageSrc="/locations_screen.jpg"   // image background (no video)
        fadeHeight="40vh"                  // smooth bottom fade
        withFixedHeaderOffset              // start content below fixed header
      >
        <div className="flex flex-col gap-24">
          {/* HERO with reusable Backplate for readability */}
          <section className="pt-24 sm:pt-28 md:pt-32">
            <div className="mx-auto w-full max-w-3xl">
              <Backplate className="text-center">
                <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
                  Explore New Destinations
                </h1>

                <form
                  onSubmit={handleSearch}
                  className="mt-6 flex rounded-xl overflow-hidden border border-white/10 shadow-lg"
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

                {isAuthenticated && (
                  <div className="mt-6 flex justify-center sm:justify-end">
                    <Link
                      href="/locations/add"
                      className="inline-flex items-center justify-center rounded-2xl border border-emerald-500/50 bg-emerald-600/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500/20"
                    >
                      Add location
                    </Link>
                  </div>
                )}
              </Backplate>
            </div>
          </section>

          {/* MAP (no heading) */}
          <section className="px-4">
            <div className="mx-auto max-w-6xl rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl">
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
          <section className="px-4 pb-20">
            <h2 className="text-2xl font-bold mb-6">All Locations</h2>

            {loading ? (
              <p className="text-neutral-400 text-center">Loading...</p>
            ) : error ? (
              <p className="text-red-400 text-center">{error}</p>
            ) : (
              <div className="mx-auto max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {locations.map((loc) => (
                  <article
                    key={loc.id}
                    className="relative group rounded-2xl border border-neutral-800 bg-neutral-900 hover:border-emerald-600 transition overflow-hidden"
                  >
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
        </div>
      </PageShell>
    </main>
  );
}
