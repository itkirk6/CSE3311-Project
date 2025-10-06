'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Page() {
  const router = useRouter();
  const [navQuery, setNavQuery] = useState('');
  const [heroQuery, setHeroQuery] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [recommended, setRecommended] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Respect reduced-motion users
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches && videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const res = await fetch(`${API_URL}/api/locations/recommended`);
        const json = await res.json();
        if (json.success) {
          setRecommended(json.data);
        } else {
          setError('Failed to load locations.');
        }
      } catch (err) {
        console.error(err);
        setError('Something went wrong while loading data.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommended();
  }, []);

  const submitSearch = (q: string) => {
    const query = q.trim();
    if (!query) return;
    router.push(`/locations?q=${encodeURIComponent(query)}`);
  };

  return (
    <main className="min-h-screen bg-neutral-900 text-neutral-100">
      {/* Toolbar */}
      <header className="fixed inset-x-0 top-0 z-50 bg-neutral-950/60 backdrop-blur border-b border-neutral-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-3">
            <div className="flex items-center gap-6 min-w-0">
              <Link href="/" className="shrink-0 text-xl sm:text-2xl font-extrabold tracking-tight">
                OutdoorSpot
              </Link>

              {/* Compact nav search (md+) */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitSearch(navQuery);
                }}
                className="hidden md:flex items-center gap-2 w-full max-w-md"
                role="search"
                aria-label="Search locations"
              >
                <div className="relative flex-1">
                  <input
                    value={navQuery}
                    onChange={(e) => setNavQuery(e.target.value)}
                    placeholder="Search locations"
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-700 focus:outline-none"
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-500 transition"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>

            <nav className="flex items-center gap-3">
              <Link href="/auth/login" className="text-sm sm:text-base hover:text-white text-neutral-300">
                Login
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center rounded-xl bg-emerald-600 px-3 sm:px-4 py-2 text-sm font-medium hover:bg-emerald-500"
              >
                Sign Up
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Video Hero (top, scrollable past) */}
      <section className="relative h-[85vh] min-h-[540px] w-full overflow-hidden">
        {/* Background video */}
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover pointer-events-none select-none z-0"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata" /* fast start */
          disablePictureInPicture
          controls={false}
          aria-hidden="true"
          src="/splash_screen.mp4" /* keep working path */
        />

        {/* Readability gradient (non-interactive) */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-neutral-950/40 via-neutral-950/20 to-neutral-900 pointer-events-none"></div>

        {/* Invisible click shield to prevent PiP/pause even if browser overlays appear */}
        <div className="absolute inset-0 z-20" aria-hidden="true"></div>

        {/* Hero content */}
        <div className="relative z-30 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
              Find your next North Texas escape
            </h1>
            <p className="mt-4 max-w-xl text-neutral-300">
              Camp under big skies. Wake to quiet horizons. Discover hidden spots locals love.
            </p>

            {/* Large hero search */}
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
                  placeholder={'Search locations (e.g., "Lake Texoma")'}
                  className="min-w-0 flex-1 rounded-2xl border border-neutral-800 bg-neutral-900/90 px-5 py-3 text-base placeholder:text-neutral-400 focus:border-neutral-700"
                />
                <button
                  type="submit"
                  className="rounded-2xl bg-emerald-600 px-5 py-3 text-base font-semibold hover:bg-emerald-500"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Locations (dark) */}
      <section className="relative py-16 bg-neutral-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold">Featured Locations</h2>
          <p className="mt-2 text-neutral-400">Hand-picked North Texas spots to kickstart your trip.</p>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading && <p className="text-neutral-400">Loading featured locations...</p>}
            {error && <p className="text-red-400">{error}</p>}

            {!loading && !error && recommended.length === 0 && (
              <p className="text-neutral-400">No featured locations found.</p>
            )}

            {recommended.map((spot) => (
              <article
                key={spot.id}
                className="group overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900"
              >
                <div className="relative h-48 overflow-hidden">
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
                    <div className="text-emerald-400 font-medium">{spot.price}</div>
                  </div>
                  <button
                    className="mt-4 w-full rounded-xl bg-emerald-600 py-2.5 font-medium hover:bg-emerald-500"
                    onClick={() => router.push(`/locations/${spot.id}`)}
                  >
                    View Details
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose OutdoorSpot */}
      <section className="border-y border-neutral-900 bg-neutral-900 relative py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">Why Choose OutdoorSpot?</h2>
          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-neutral-900 bg-neutral-900 p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-700/20">🗺️</div>
              <h3 className="text-lg font-semibold">Curated Locations</h3>
              <p className="mt-2 text-neutral-300">Verified info, photos, and details for the best North Texas sites.</p>
            </div>
            <div className="rounded-2xl border border-neutral-900 bg-neutral-900 p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-700/20">🎯</div>
              <h3 className="text-lg font-semibold">Smart Search</h3>
              <p className="mt-2 text-neutral-300">Filter by vibe, terrain, and amenities to find the perfect fit.</p>
            </div>
            <div className="rounded-2xl border border-neutral-900 bg-neutral-900 p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-700/20">⭐</div>
              <h3 className="text-lg font-semibold">Trusted Reviews</h3>
              <p className="mt-2 text-neutral-300">Real campers. Real feedback. Plan with confidence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer (simplified) */}
      <footer className="bg-neutral-950 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <div className="text-2xl font-extrabold text-emerald-400">OutdoorSpot</div>
              <p className="mt-3 text-neutral-400">Your gateway to North Texas outdoor escapes.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold">Explore</h4>
              <ul className="mt-3 space-y-2 text-neutral-300">
                <li><Link href="/locations" className="hover:text-white">Locations</Link></li>
                <li><Link href="/reviews" className="hover:text-white">Reviews</Link></li>
                <li><Link href="/about" className="hover:text-white">About</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold">Account</h4>
              <ul className="mt-3 space-y-2 text-neutral-300">
                <li><Link href="/auth/login" className="hover:text-white">Sign In</Link></li>
                <li><Link href="/auth/register" className="hover:text-white">Sign Up</Link></li>
                <li><Link href="/favorites" className="hover:text-white">Favorites</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-neutral-900 pt-6 text-center text-neutral-400">
            © {new Date().getFullYear()} OutdoorSpot. Built for CSE3311.
          </div>
        </div>
      </footer>
    </main>
  );
}
