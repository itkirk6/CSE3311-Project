'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import NavBar from '@/app/components/NavBar';
import Footer from '@/app/components/Footer';

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

  // ✅ Main search logic
  const handleSearch = async (p = 1, qOverride?: string) => {
    const searchTerm = qOverride ?? query;
    if (!searchTerm.trim()) return;

    // Update URL without reload
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

  // ✅ Auto-run search when query param changes
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      handleSearch(1, initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  // 🖼 Background / dimension logic
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageRatio, setImageRatio] = useState<number | null>(null);
  const [imageHeight, setImageHeight] = useState(0);
  const [containerMinHeight, setContainerMinHeight] = useState(0);

  const updateDimensions = () => {
    if (containerRef.current && imageRatio !== null) {
      const width = containerRef.current.clientWidth;
      const scaled = width * imageRatio;
      setImageHeight(scaled);
      setContainerMinHeight(Math.max(scaled, window.innerHeight * 0.65));
    } else {
      setContainerMinHeight(window.innerHeight * 0.65);
    }
  };

  useEffect(() => {
    updateDimensions();
  }, [imageRatio]);

  useEffect(() => {
    const handleResize = () => updateDimensions();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imageRatio]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <NavBar />

      <div
        ref={containerRef}
        className="relative flex-1"
        style={{ minHeight: `${containerMinHeight}px` }}
      >
        {/* Background */}
        <div className="absolute inset-x-0 top-0" style={{ height: `${imageHeight}px` }}>
          <Image
            src="/search_screen.jpg"
            alt="Search Background"
            fill
            className="object-cover opacity-50"
            priority
            onLoad={(e) =>
              setImageRatio(
                (e.target as HTMLImageElement).naturalHeight /
                  (e.target as HTMLImageElement).naturalWidth
              )
            }
          />
        </div>
        <div
          className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/60 via-black/50 to-gray-900"
          style={{ height: `${imageHeight}px` }}
        />

        {/* Foreground */}
        <div className="relative z-10 flex flex-col w-full">
          {/* Hero */}
          <div className="h-[60vh] flex items-center justify-center">
            <div className="w-full max-w-2xl px-4 text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-6">Find Your Next Adventure</h1>
              <div className="flex shadow-lg rounded-lg overflow-hidden">
                <input
                  type="text"
                  placeholder="Search for locations..."
                  className="flex-1 p-4 text-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(1)}
                />
                <button
                  onClick={() => handleSearch(1)}
                  className="bg-green-600 hover:bg-green-700 px-6 text-lg font-semibold transition-colors"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <main className="flex-1 px-6 py-10 max-w-5xl mx-auto w-full">
            {searched && loading && <p className="text-center">Loading...</p>}

            {searched && !loading && results.length === 0 && (
              <p className="text-center text-gray-400">No results found.</p>
            )}

            <div className="space-y-6">
              {results.map((loc) => (
                <div
                  key={loc.id}
                  className="flex items-center bg-gray-800 rounded-lg shadow-md p-4 hover:bg-gray-750 transition-colors"
                >
                  <img
                    src={loc.img || 'https://via.placeholder.com/150'}
                    alt={loc.name}
                    width={140}
                    height={100}
                  />
                  <div className="ml-4 flex-1">
                    <h2 className="text-lg font-bold">{loc.name}</h2>
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {loc.blurb || 'No description available.'}
                    </p>
                    <div className="flex items-center mt-2 space-x-4 text-sm">
                      <span>⭐ {loc.rating ?? '—'}</span>
                      <span>{loc.price || '—'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {searched && totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-4">
                <button
                  onClick={() => handleSearch(page - 1)}
                  disabled={page <= 1}
                  className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-40"
                >
                  Prev
                </button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => handleSearch(page + 1)}
                  disabled={page >= totalPages}
                  className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
