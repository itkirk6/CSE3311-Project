'use client';
import Link from 'next/link';

export default function NavBar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-neutral-950/60 backdrop-blur border-b border-neutral-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Brand */}
          <Link
            href="/"
            className="text-xl sm:text-2xl font-extrabold tracking-tight text-white hover:text-emerald-400 transition"
          >
            OutdoorSpot
          </Link>

          {/* Center: Nav Links */}
          <nav className="flex-1 flex justify-center">
            <ul className="flex items-center gap-8 text-sm sm:text-base text-neutral-300">
              <li>
                <Link href="/locations" className="hover:text-white transition">
                  Locations
                </Link>
              </li>
              {/* Removed Search Link */}
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About
                </Link>
              </li>
            </ul>
          </nav>

          {/* Right: Auth links */}
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm hover:text-white text-neutral-300">
              Login
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center rounded-xl bg-emerald-600 px-3 sm:px-4 py-2 text-sm font-medium hover:bg-emerald-500"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
