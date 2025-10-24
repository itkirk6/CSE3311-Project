'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import HeroSection from './components/HeroSection';
import PageShell from './components/PageShell';
import Section from './components/Section';

type RecommendedLocation = {
  id: string;
  name: string;
  blurb: string;
  img: string;
  rating: number;
  price: string;
};

export default function Page() {
  const router = useRouter();
  const [heroQuery, setHeroQuery] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [recommended, setRecommended] = useState<RecommendedLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches && videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        if (!API_URL || API_URL === 'undefined') {
          throw new Error('Backend URL not configured');
        }

        const res = await fetch(`${API_URL}/api/locations/recommended`, {
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
          setRecommended(json.data as RecommendedLocation[]);
        } else {
          throw new Error('API returned unsuccessful response');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load featured locations.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommended();
  }, [API_URL]);

  const submitSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <PageShell
      mainClassName="space-y-24 pb-24"
      backgroundMedia={{
        type: 'video',
        src: '/splash_screen.mp4',
        className: 'pointer-events-none select-none',
        videoRef,
      }}
      overlayClassName="from-neutral-950/60 via-neutral-950/70 to-neutral-950"
    >
      <HeroSection
        className="items-center py-12"
        overlayClassName="from-neutral-950/40 via-neutral-950/20 to-neutral-900"
        heightClassName="min-h-[540px] h-[85vh]"
      >
        <Section as="div" className="flex h-full items-center">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
              Find your next North Texas escape
            </h1>
            <p className="mt-4 max-w-xl text-neutral-300">
              Camp under big skies. Wake to quiet horizons. Discover hidden spots locals love.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitSearch(heroQuery);
              }}
              className="mt-6 max-w-xl"
              role="search"
              aria-label="Hero search"
            >
              <div className="flex gap-2">
                <input
                  value={heroQuery}
                  onChange={(e) => setHeroQuery(e.target.value)}
                  placeholder='Search locations (e.g., "Lake Texoma")'
                  className="min-w-0 flex-1 rounded-2xl border border-neutral-800 bg-neutral-900/90 px-5 py-3 text-base text-neutral-100 placeholder:text-neutral-400 focus:border-neutral-700 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-2xl bg-emerald-600 px-5 py-3 text-base font-semibold text-white transition hover:bg-emerald-500"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </Section>
      </HeroSection>

      <Section className="py-16 backdrop-blur-sm">
        <h2 className="text-2xl font-bold sm:text-3xl">Featured Locations</h2>
        <p className="mt-2 text-neutral-300">Hand-picked North Texas spots to kickstart your trip.</p>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading && <p className="text-neutral-400">Loading featured locations...</p>}
          {error && <p className="text-red-400">{error}</p>}
          {!loading && !error && recommended.length === 0 && (
            <p className="text-neutral-400">No featured locations found.</p>
          )}

          {recommended.map((spot) => (
            <article
              key={spot.id}
              className="group overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur transition hover:border-emerald-600"
            >
              <div className="relative h-48 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={spot.img}
                  alt={spot.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 to-transparent" />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold">{spot.name}</h3>
                <p className="mt-2 text-sm text-neutral-300">{spot.blurb}</p>
                <div className="mt-4 flex items-center justify-between text-sm text-neutral-300">
                  <div>
                    <span className="text-yellow-400">★★★★★</span>
                    <span className="ml-1">({spot.rating})</span>
                  </div>
                  <div className="font-medium text-emerald-400">{spot.price}</div>
                </div>
                <button
                  className="mt-4 w-full rounded-xl bg-emerald-600 py-2.5 font-medium text-white transition hover:bg-emerald-500"
                  onClick={() => router.push(`/location?id=${spot.id}`)}
                >
                  View Details
                </button>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section className="relative rounded-3xl border border-neutral-800 bg-neutral-900/70 py-16 backdrop-blur">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">Why Choose OutdoorSpot?</h2>
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-700/20">🗺️</div>
            <h3 className="text-lg font-semibold">Curated Locations</h3>
            <p className="mt-2 text-neutral-300">Verified info, photos, and details for the best North Texas sites.</p>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-700/20">🎯</div>
            <h3 className="text-lg font-semibold">Smart Search</h3>
            <p className="mt-2 text-neutral-300">Filter by vibe, terrain, and amenities to find the perfect fit.</p>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-700/20">⭐</div>
            <h3 className="text-lg font-semibold">Trusted Reviews</h3>
            <p className="mt-2 text-neutral-300">Real campers. Real feedback. Plan with confidence.</p>
          </div>
        </div>
      </Section>
    </PageShell>
  );
}
