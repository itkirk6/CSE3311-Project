'use client';

import { useState } from 'react';
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
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searched, setSearched] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleSearch = async (p = 1) => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `${API_URL}/api/search/locations?q=${encodeURIComponent(query)}&page=${p}&limit=50`
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <NavBar />

      {/* Hero Section */}
      <div className="relative h-[450px] flex items-center justify-center">
        <Image
          src="/search_screen.jpg"
          alt="Search Background"
          fill
          className="object-cover opacity-50"
          priority
        />
        {/* Top to bottom gradient fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-gray-900" />
        <div className="relative z-10 w-full max-w-2xl px-4 text-center">
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

      {/* Results Section */}
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

      <Footer />
    </div>
  );
}
