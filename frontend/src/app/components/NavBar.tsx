'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NavBar() {
  const router = useRouter();
  const [navQuery, setNavQuery] = useState('');

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = navQuery.trim();
    if (query) router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-neutral-950/60 backdrop-blur border-b border-neutral-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <div className="flex items-center gap-6 min-w-0">
            <Link href="/" className="shrink-0 text-xl sm:text-2xl font-extrabold tracking-tight">
              OutdoorSpot
            </Link>

            {/* Compact nav search */}
            <form onSubmit={submitSearch} className="hidden md:flex items-center gap-2 w-full max-w-md" role="search">
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
  );
}
