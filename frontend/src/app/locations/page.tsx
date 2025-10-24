'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import HeroSection from '@/app/components/HeroSection';
import MapComponent from '@/app/components/MapComponent';
import PageShell from '@/app/components/PageShell';
import Section from '@/app/components/Section';

type LocationImage = string | { url?: string | null } | null;
type LocationMedia = LocationImage | LocationImage[];

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  price?: string;
  rating?: number;
  images?: LocationMedia;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        if (!API_URL || API_URL === 'undefined') {
          throw new Error('Backend URL not configured');
        }

        const res = await fetch(`${API_URL}/api/locations/all`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(5000),
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }

        const json = await res.json();
        if (json.success) {
          setLocations(json.data as Location[]);
        } else {
          throw new Error('API returned unsuccessful response');
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to load locations.';
        setError(message);
        setLocations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [API_URL]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const getFirstImage = (images: LocationMedia | undefined): string => {
    if (!images) return '/placeholder.jpg';
    if (Array.isArray(images)) {
      if (typeof images[0] === 'string') return images[0];
      if (images[0]?.url) return images[0].url;
    }
    if (typeof images === 'object' && images.url) return images.url;
    return '/placeholder.jpg';
  };

  return (
    <PageShell
      mainClassName="space-y-24 pb-24"
      backgroundMedia={{
        type: 'image',
        src: '/locations_screen.jpg',
        alt: 'Locations background',
        className: 'object-cover',
        loading: 'eager',
      }}
    >
      <HeroSection
        className="items-start pt-24"
        overlayClassName="from-neutral-950/60 via-neutral-950/40 to-neutral-900"
        heightClassName="min-h-[420px] h-[70vh]"
      >
        <Section as="div" className="flex h-full items-center justify-center text-center">
          <div className="w-full max-w-xl">
            <h1 className="text-4xl font-bold sm:text-5xl">Explore New Destinations</h1>
            <p className="mt-4 text-neutral-300">
              Browse every outdoor getaway we know about across North Texas, then dive deeper for the perfect stay.
            </p>
            <form onSubmit={handleSearch} className="mt-8 flex overflow-hidden rounded-2xl shadow-lg">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search locations..."
                className="flex-1 bg-white px-4 py-3 text-lg text-gray-900 placeholder-gray-500 focus:outline-none"
              />
              <button type="submit" className="bg-emerald-600 px-6 text-lg font-semibold text-white transition hover:bg-emerald-500">
                Search
              </button>
            </form>
          </div>
        </Section>
      </HeroSection>

      <Section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Interactive Map</h2>
          <p className="mt-2 text-neutral-300">Zoom around North Texas and see every spot at a glance.</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/70 backdrop-blur">
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
      </Section>

      <Section className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">All Locations</h2>
          <p className="mt-2 text-neutral-300">
            Discover cabins, campsites, and hidden gems curated by the OutdoorSpot team.
          </p>
        </div>

        {loading ? (
          <p className="text-center text-neutral-400">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-400">{error}</p>
        ) : locations.length === 0 ? (
          <p className="text-center text-neutral-400">No locations available yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {locations.map((loc) => (
              <article
                key={loc.id}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur transition hover:border-emerald-600"
              >
                <div className="relative h-48 w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getFirstImage(loc.images)}
                    alt={loc.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-900/60 to-transparent" />
                </div>
                <div className="flex flex-1 flex-col p-5 text-left">
                  <h3 className="text-lg font-semibold text-white">{loc.name}</h3>
                  <p className="mt-2 text-sm text-neutral-300 line-clamp-3">{loc.description || 'No description available.'}</p>
                  <div className="mt-4 flex items-center justify-between text-sm text-neutral-300">
                    <span className="text-emerald-400 font-medium">{loc.price || '—'}</span>
                    <span>⭐ {loc.rating ?? '—'}</span>
                  </div>
                  <Link
                    href={`/location?id=${encodeURIComponent(loc.id)}`}
                    className="mt-6 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-500"
                  >
                    View details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </Section>
    </PageShell>
  );
}
