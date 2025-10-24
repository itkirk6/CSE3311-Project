'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import HeroSection from '@/app/components/HeroSection';
import PageShell from '@/app/components/PageShell';
import Section from '@/app/components/Section';

type Location = {
  id: string;
  name: string;
  blurb?: string;
  price?: string;
  rating?: number;
  img?: string;
};

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searched, setSearched] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleSearch = async (p = 1, qOverride?: string) => {
    const searchTerm = qOverride ?? query;
    if (!searchTerm.trim()) return;

    router.push(`/search?q=${encodeURIComponent(searchTerm)}`);

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(
        `${API_URL}/api/search/locations?q=${encodeURIComponent(searchTerm)}&page=${p}&limit=50`
      );
      const data = await res.json();
      if (data.success) {
        setResults(data.data || []);
        setTotalPages(data.totalPages || 1);
        setPage(p);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      handleSearch(1, initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  return (
    <PageShell
      mainClassName="space-y-16 pb-24"
      background={
        <Image
          src="/search_screen.jpg"
          alt="Search background"
          fill
          priority
          className="object-cover"
        />
      }
    >
      <HeroSection
        className="items-center py-12"
        overlayClassName="from-neutral-950/60 via-neutral-950/30 to-neutral-900"
        heightClassName="min-h-[460px] h-[70vh]"
      >
        <Section as="div" className="flex h-full items-center justify-center text-center">
          <div className="w-full max-w-2xl">
            <h1 className="text-4xl font-bold sm:text-5xl">Find Your Next Adventure</h1>
            <p className="mt-4 text-neutral-300">
              Search our full catalog of outdoor escapes by name, vibe, or must-have amenities.
            </p>
            <div className="mt-8 flex overflow-hidden rounded-2xl shadow-lg">
              <input
                type="text"
                placeholder="Search for locations..."
                className="flex-1 bg-white px-4 py-3 text-lg text-gray-900 placeholder-gray-500 focus:outline-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(1)}
              />
              <button
                onClick={() => handleSearch(1)}
                className="bg-emerald-600 px-6 text-lg font-semibold text-white transition hover:bg-emerald-500"
              >
                Search
              </button>
            </div>
          </div>
        </Section>
      </HeroSection>

      <Section className="space-y-8">
        <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold">Search Results</h2>
            <p className="text-neutral-300">Browse everything that matches your latest search.</p>
          </div>
          {searched && (
            <p className="text-sm text-neutral-400">
              Showing page {page} of {Math.max(totalPages, 1)} for “{query}”.
            </p>
          )}
        </header>

        {searched && loading && <p className="text-center text-neutral-400">Loading...</p>}

        {searched && !loading && results.length === 0 && (
          <p className="text-center text-neutral-400">No results found.</p>
        )}

        <div className="space-y-6">
          {results.map((loc) => (
            <article
              key={loc.id}
              className="group relative flex items-center overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 backdrop-blur transition hover:border-emerald-600"
            >
              <Link
                href={`/location?id=${encodeURIComponent(loc.id)}`}
                className="absolute inset-0"
                aria-label={`View details for ${loc.name}`}
              />

              <div className="relative h-24 w-36 flex-shrink-0 overflow-hidden rounded-xl border border-neutral-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={loc.img || 'https://via.placeholder.com/150'}
                  alt={loc.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              <div className="ml-4 flex-1 pr-4">
                <h3 className="text-lg font-semibold text-white">{loc.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-neutral-300">
                  {loc.blurb || 'No description available.'}
                </p>
                <div className="mt-3 flex items-center gap-4 text-sm text-neutral-400">
                  <span>⭐ {loc.rating ?? '—'}</span>
                  <span className="text-emerald-400">{loc.price || '—'}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {searched && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => handleSearch(Math.max(page - 1, 1))}
              disabled={page === 1}
              className="rounded-xl border border-neutral-800 px-4 py-2 text-sm font-medium text-neutral-200 transition disabled:cursor-not-allowed disabled:opacity-40 hover:border-emerald-600"
            >
              Previous
            </button>
            <span className="text-sm text-neutral-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => handleSearch(Math.min(page + 1, totalPages))}
              disabled={page === totalPages}
              className="rounded-xl border border-neutral-800 px-4 py-2 text-sm font-medium text-neutral-200 transition disabled:cursor-not-allowed disabled:opacity-40 hover:border-emerald-600"
            >
              Next
            </button>
          </div>
        )}
      </Section>
    </PageShell>
  );
}
