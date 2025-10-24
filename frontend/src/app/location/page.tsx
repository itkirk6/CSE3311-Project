'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import NavBar from '@/app/components/NavBar';
import Footer from '@/app/components/Footer';
import dynamic from 'next/dynamic';

// Lazy-load MapComponent to avoid SSR issues
const MapComponent = dynamic(() => import('@/app/components/MapComponent'), { ssr: false });

// --- Types ---------------------------------------------------------------
type Img = string | { url?: string };

type Review = {
  id?: string;
  author?: string;
  rating?: number | null;
  comment?: string | null;
  createdAt?: string | Date;
};

type LocationDetail = {
  id: string;
  name: string;
  description?: string | null;
  blurb?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  price?: string | null;
  cost?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  petFriendly?: boolean | null;
  reservationRequired?: boolean | null;
  website?: string | null;
  seasonStart?: string | null;
  seasonEnd?: string | null;
  rating?: number | null;
  images?: Img[] | Img | null;
  secondaryImages?: Img[] | null;
  reviews?: Review[] | null;
};

// --- Helpers ------------------------------------------------------------
const getFirstImage = (images?: Img[] | Img | null): string | null => {
  if (!images) return null;
  if (Array.isArray(images)) {
    if (images.length === 0) return null;
    const first = images[0];
    return typeof first === 'string' ? first : first?.url ?? null;
  }
  return typeof images === 'string' ? images : images?.url ?? null;
};

const fmt = (value: unknown): string => {
  if (value === undefined || value === null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
};

const isTruthy = (v: unknown) => v !== undefined && v !== null && v !== '';

// --- Component ----------------------------------------------------------
export default function LocationPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [data, setData] = useState<LocationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Build the single, correct endpoint: /api/locations/id/:id
  const buildEndpoint = (locId: string) => {
    const base = API_URL?.replace(/\/$/, '') || '';
    const prefix = base || '';
    return `${prefix}/api/locations/id/${encodeURIComponent(locId)}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('Missing id in URL.');
        setLoading(false);
        return;
      }
      const endpoint = buildEndpoint(id);

      try {
        const res = await fetch(endpoint, {
          headers: { 'Content-Type': 'application/json' },
          signal: (AbortSignal as any).timeout?.(5000) ?? undefined,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }

        const json = await res.json();
        const payload = json?.success ? json.data : json;
        setData(payload as LocationDetail);
        setError(null);
      } catch (e: any) {
        console.error(e);
        setError(e?.message || 'Failed to load location.');
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL, id]);

  const bgImage = getFirstImage(data?.images ?? data?.secondaryImages ?? null);

  // Hero sizing + header measurement
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroMinH, setHeroMinH] = useState(0);
  const [navH, setNavH] = useState(0);
  const [mapReady, setMapReady] = useState(false);


  useEffect(() => {
    const updateHero = () => setHeroMinH(Math.max(window.innerHeight * 0.65, 420));

    const el =
      (document.querySelector('header') as HTMLElement | null) ||
      (document.querySelector('#site-nav') as HTMLElement | null) ||
      (document.querySelector('nav') as HTMLElement | null);

    const measureNow = () => {
      const h = el ? Math.ceil(el.getBoundingClientRect().height) : 64;
      setNavH(h);
      // expose to CSS variable so we can use it in calc()
      document.documentElement.style.setProperty('--header-h', `${h}px`);
    };

    updateHero();
    const raf = requestAnimationFrame(measureNow);
    window.addEventListener('resize', updateHero);

    let ro: ResizeObserver | null = null;
    if (el && 'ResizeObserver' in window) {
      ro = new ResizeObserver(measureNow);
      ro.observe(el);
    } else {
      window.addEventListener('resize', measureNow);
    }
    window.addEventListener('load', measureNow);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', updateHero);
      window.removeEventListener('load', measureNow);
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', measureNow);
    };
  }, []);


  useEffect(() => {
  if (navH > 0 && !loading) {
    const id = requestAnimationFrame(() => setMapReady(true));
    return () => cancelAnimationFrame(id);
  }
}, [navH, loading]);

  // Responsive, variable-based spacing (no hard-coded px):
  // - Title sits well below the header (10vh or 3.5rem, whichever is larger)
  // - Body section pulls up ~80% of that to keep the layout tight
  const heroTopPad = 'calc(var(--header-h, 64px) + max(10vh, 3.5rem))';
  const bodyPullUp = 'calc((var(--header-h, 64px) + max(10vh, 3.5rem)) * -1)';

  return (
    <main className="flex min-h-screen flex-col bg-neutral-900 text-neutral-100">
      <NavBar />

      {/* Hero ----------------------------------------------------------- */}
      <section
        ref={heroRef}
        className="relative w-full"
        style={{ minHeight: heroMinH, paddingTop: heroTopPad, scrollMarginTop: heroTopPad }}
      >
        {/* Background image or fallback tint */}
        {bgImage ? (
          <Image src={bgImage} alt={data?.name ?? 'Location'} fill priority className="object-cover opacity-60" />
        ) : (
          <div className="absolute inset-0 bg-neutral-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/60 via-neutral-950/40 to-neutral-900" />

        <div className="relative z-10 flex h-full items-end">
          <div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
                {loading ? 'Loading…' : data?.name ?? '—'}
              </h1>
              <p className="mt-3 text-lg text-neutral-200">
                {loading ? '' : data?.blurb || data?.description || '—'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Body ----------------------------------------------------------- */}
      <section className="relative z-10" style={{ marginTop: bodyPullUp }}>
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left: Details */}
            <article className="lg:col-span-2 rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur p-6">
              {loading && <p className="text-neutral-400">Loading details…</p>}
              {error && !loading && <p className="text-red-400">{error}</p>}

              {!loading && !error && (
                <div className="space-y-6">
                  {/* Quick facts */}
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    <Info label="Price" value={fmt(data?.price ?? data?.cost)} />
                    <Info label="Rating" value={fmt(data?.rating)} />
                    <Info label="Pet friendly" value={fmt(data?.petFriendly)} />
                    <Info label="Reservation required" value={fmt(data?.reservationRequired)} />
                    <Info label="Season start" value={fmt(data?.seasonStart)} />
                    <Info label="Season end" value={fmt(data?.seasonEnd)} />
                  </div>

                  {/* Address */}
                  <div className="rounded-xl border border-neutral-800 p-4">
                    <h3 className="font-semibold mb-2">Address</h3>
                    <p className="text-neutral-300" style={{ whiteSpace: 'pre-line' }}>
                      {[
                        data?.addressLine1,
                        data?.addressLine2,
                        [data?.city, data?.state].filter(isTruthy).join(', '),
                        data?.postalCode,
                      ]
                        .filter(isTruthy)
                        .join('\n') || '—'}
                    </p>
                  </div>

                  {/* Website */}
                  <div className="rounded-xl border border-neutral-800 p-4">
                    <h3 className="font-semibold mb-2">Website</h3>
                    {data?.website ? (
                      <a
                        href={data.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:underline break-words"
                      >
                        {data.website}
                      </a>
                    ) : (
                      <span className="text-neutral-500">—</span>
                    )}
                  </div>

                  {/* Secondary images */}
                  <div>
                    <h3 className="font-semibold mb-3">Gallery</h3>
                    {data?.secondaryImages && data.secondaryImages.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {data.secondaryImages.map((img, i) => {
                          const src = typeof img === 'string' ? img : img?.url || '';
                          if (!src) return null;
                          return (
                            <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-neutral-800">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-neutral-500">—</p>
                    )}
                  </div>

                  {/* Reviews */}
                  <div>
                    <h3 className="font-semibold mb-3">Reviews</h3>
                    {data?.reviews && data.reviews.length > 0 ? (
                      <ul className="space-y-3">
                        {data.reviews.map((r, i) => (
                          <li key={r.id ?? i} className="rounded-xl border border-neutral-800 p-4">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">{r.author || 'Anonymous'}</div>
                              <div className="text-sm text-neutral-400">{fmt(r.rating)}</div>
                            </div>
                            {r.comment && <p className="mt-2 text-neutral-300">{r.comment}</p>}
                            {r.createdAt && (
                              <div className="mt-1 text-xs text-neutral-500">
                                {new Date(r.createdAt).toLocaleDateString()}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-neutral-500">—</p>
                    )}
                  </div>
                </div>
              )}
            </article>

            {/* Right: Map */}
            <aside className="rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur p-4">
              <h3 className="font-semibold mb-3">Map</h3>
              {mapReady && isTruthy(data?.latitude) && isTruthy(data?.longitude) ? (
                <MapComponent
                  locations={[{
                    id: data!.id,
                    name: data!.name,
                    latitude: Number(data!.latitude!),
                    longitude: Number(data!.longitude!),
                    description: data!.description ?? undefined,
                  }]}
                />
              ) : (
                <div className="w-full h-96 flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-500">
                  —
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

// --- Small UI -----------------------------------------------------------
function Info({ label, value }: { label: string; value: string }) {
  const isMissing = value === '—';
  return (
    <div className={`rounded-xl border p-3 ${isMissing ? 'border-neutral-800 text-neutral-500' : 'border-neutral-800 bg-neutral-900/70'}`}>
      <div className="text-xs uppercase tracking-wide text-neutral-400">{label}</div>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}
