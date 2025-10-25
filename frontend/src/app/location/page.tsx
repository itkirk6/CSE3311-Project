'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import NavBar from '@/app/components/NavBar';
import Footer from '@/app/components/Footer';
import PageShell from '@/app/components/PageShell';

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
  reviews?: Review[] | null;
};

// --- Helpers: images -----------------------------------------------------
const normalizeImages = (images?: Img[] | Img | null): string[] => {
  if (!images) return [];
  if (Array.isArray(images)) {
    return images
      .map((i) => (typeof i === 'string' ? i : i?.url || ''))
      .filter(Boolean);
  }
  const one = typeof images === 'string' ? images : images?.url || '';
  return one ? [one] : [];
};

const getFirstImage = (images?: Img[] | Img | null): string | null => {
  const arr = normalizeImages(images);
  return arr[0] ?? null;
};

const fmt = (value: unknown): string => {
  if (value === undefined || value === null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
};

const isPresent = (v: unknown) => v !== undefined && v !== null && v !== '';

// Simple fetch with timeout that works everywhere
async function fetchWithTimeout(url: string, opts: RequestInit = {}, ms = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

// --- Helpers: weather ----------------------------------------------------
type WeatherDay = {
  date: string; // ISO yyyy-mm-dd
  tMax?: number;
  tMin?: number;
  precip?: number;
  windMax?: number;
  code?: number;
};

function weatherCodeLabel(code?: number): string {
  switch (code) {
    case 0: return 'Clear';
    case 1:
    case 2:
    case 3: return 'Partly cloudy';
    case 45:
    case 48: return 'Fog';
    case 51:
    case 53:
    case 55: return 'Drizzle';
    case 56:
    case 57: return 'Freezing drizzle';
    case 61:
    case 63:
    case 65: return 'Rain';
    case 66:
    case 67: return 'Freezing rain';
    case 71:
    case 73:
    case 75: return 'Snow';
    case 77: return 'Snow grains';
    case 80:
    case 81:
    case 82: return 'Rain showers';
    case 85:
    case 86: return 'Snow showers';
    case 95: return 'Thunderstorm';
    case 96:
    case 99: return 'Thunder w/ hail';
    default: return '—';
  }
}

function weatherCodeEmoji(code?: number): string {
  switch (code) {
    case 0: return '☀️';
    case 1:
    case 2:
    case 3: return '⛅';
    case 45:
    case 48: return '🌫️';
    case 51:
    case 53:
    case 55: return '🌦️';
    case 56:
    case 57: return '🌧️❄️';
    case 61:
    case 63:
    case 65: return '🌧️';
    case 66:
    case 67: return '🌧️❄️';
    case 71:
    case 73:
    case 75: return '❄️';
    case 77: return '🌨️';
    case 80:
    case 81:
    case 82: return '🌦️';
    case 85:
    case 86: return '🌨️';
    case 95: return '⛈️';
    case 96:
    case 99: return '⛈️🧊';
    default: return '—';
  }
}

// --- Component ----------------------------------------------------------
export default function LocationPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [data, setData] = useState<LocationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const [weather, setWeather] = useState<WeatherDay[] | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const buildEndpoint = (locId: string) => {
    const base = (API_URL || '').replace(/\/$/, '');
    return `${base}/api/locations/id/${encodeURIComponent(locId)}`;
  };

  useEffect(() => {
    const run = async () => {
      if (!id) {
        setError('Missing id in URL.');
        setLoading(false);
        return;
      }
      if (!API_URL || API_URL === 'undefined') {
        setError('Backend URL not configured.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetchWithTimeout(
          buildEndpoint(id),
          { headers: { 'Content-Type': 'application/json' } },
          8000
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) throw new Error('Response is not JSON');

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
    run();
  }, [API_URL, id]);

  // Fetch weather once we have coords (Imperial units)
  useEffect(() => {
    const lat = Number(data?.latitude ?? NaN);
    const lng = Number(data?.longitude ?? NaN);
    if (!isFinite(lat) || !isFinite(lng)) {
      setWeather(null);
      return;
    }

    const getWeather = async () => {
      setWeatherLoading(true);
      setWeatherError(null);

      const url = new URL('https://api.open-meteo.com/v1/forecast');
      url.searchParams.set('latitude', String(lat));
      url.searchParams.set('longitude', String(lng));
      url.searchParams.set('daily', [
        'weathercode',
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
        'windspeed_10m_max',
      ].join(','));
      url.searchParams.set('forecast_days', '7');
      url.searchParams.set('timezone', 'auto');

      // Units: Fahrenheit + mph (+ inches for precip)
      url.searchParams.set('temperature_unit', 'fahrenheit');
      url.searchParams.set('wind_speed_unit', 'mph');
      url.searchParams.set('precipitation_unit', 'inch');

      try {
        const res = await fetchWithTimeout(url.toString(), {}, 8000);
        if (!res.ok) throw new Error(`Weather HTTP ${res.status}`);
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) throw new Error('Weather: response is not JSON');

        const json = await res.json();
        const d = json?.daily;
        if (!d?.time) throw new Error('Weather: missing daily data');

        const out: WeatherDay[] = d.time.map((t: string, i: number) => ({
          date: t,
          tMax: d.temperature_2m_max?.[i],
          tMin: d.temperature_2m_min?.[i],
          precip: d.precipitation_sum?.[i],
          windMax: d.windspeed_10m_max?.[i],
          code: d.weathercode?.[i],
        }));

        setWeather(out);
      } catch (err: any) {
        console.error(err);
        setWeather(null);
        setWeatherError(err?.message || 'Failed to load weather.');
      } finally {
        setWeatherLoading(false);
      }
    };

    getWeather();
  }, [data?.latitude, data?.longitude]);

  // Background image = first of images (if any)
  const bgImage = getFirstImage(data?.images ?? null) || undefined;

  // Gallery always = images after the first
  const gallery: string[] = (() => {
    if (!data) return [];
    const all = normalizeImages(data.images);
    return all.slice(1);
  })();

  return (
    <main className="text-neutral-100">
      <NavBar />

      <PageShell
        imageSrc={bgImage}
        withFixedHeaderOffset
        containerClassName="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        {/* Flex column so mt-auto can push footer; height = viewport minus fixed header */}
        <div className="flex min-h-[calc(100vh-var(--header-h,64px))] flex-col">
          {/* Title & blurb */}
          <section className="pt-2 sm:pt-4 pb-10">
            <div className="max-w-3xl">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
                {loading ? 'Loading…' : data?.name ?? '—'}
              </h1>
              <p className="mt-3 text-lg text-neutral-200">
                {loading ? '' : data?.blurb || data?.description || '—'}
              </p>
            </div>
          </section>

          {/* Row: Details (left) + Map (right) */}
          <section className="relative py-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left: Details container (keeps quick facts, address, website) */}
              <article className="lg:col-span-2 rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur p-6">
                {loading && <p className="text-neutral-400">Loading details…</p>}
                {error && !loading && <p className="text-red-400">{error}</p>}

                {!loading && !error && data && (
                  <div className="space-y-6">
                    {/* Quick facts */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      <Info label="Price" value={fmt(data.price ?? data.cost)} />
                      <Info label="Rating" value={fmt(data.rating)} />
                      <Info label="Pet friendly" value={fmt(data.petFriendly)} />
                      <Info label="Reservation required" value={fmt(data.reservationRequired)} />
                      <Info label="Season start" value={fmt(data.seasonStart)} />
                      <Info label="Season end" value={fmt(data.seasonEnd)} />
                    </div>

                    {/* Address */}
                    <div className="rounded-xl border border-neutral-800 p-4">
                      <h3 className="font-semibold mb-2">Address</h3>
                      <p className="text-neutral-300" style={{ whiteSpace: 'pre-line' }}>
                        {[
                          data.addressLine1,
                          data.addressLine2,
                          [data.city, data.state].filter(isPresent).join(', '),
                          data.postalCode,
                        ]
                          .filter(isPresent)
                          .join('\n') || '—'}
                      </p>
                    </div>

                    {/* Website */}
                    <div className="rounded-xl border border-neutral-800 p-4">
                      <h3 className="font-semibold mb-2">Website</h3>
                      {data.website ? (
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
                  </div>
                )}
              </article>

              {/* Right: Map (no label) */}
              <aside className="rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur p-4">
                {isPresent(data?.latitude) && isPresent(data?.longitude) ? (
                  <MapComponent
                    locations={[
                      {
                        id: data!.id,
                        name: data!.name,
                        latitude: Number(data!.latitude!),
                        longitude: Number(data!.longitude!),
                        description: data!.description ?? undefined,
                      },
                    ]}
                  />
                ) : (
                  <div className="w-full h-96 flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-500">
                    —
                  </div>
                )}
              </aside>
            </div>
          </section>

          {/* Full-width Weather */}
          <section className="pb-8">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur p-6">
              <h3 className="font-semibold mb-3">Weather</h3>
              {!isPresent(data?.latitude) || !isPresent(data?.longitude) ? (
                <p className="text-neutral-500">No coordinates available.</p>
              ) : weatherLoading ? (
                <p className="text-neutral-400">Loading 7-day forecast…</p>
              ) : weatherError ? (
                <p className="text-red-400">{weatherError}</p>
              ) : weather && weather.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {weather.slice(0, 7).map((d) => {
                    const date = new Date(d.date);
                    const short = date.toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    });
                    return (
                      <div
                        key={d.date}
                        className="rounded-lg border border-neutral-800 bg-neutral-900/70 p-3 text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{short}</span>
                          <span className="text-xl">{weatherCodeEmoji(d.code)}</span>
                        </div>
                        <div className="mt-2 text-neutral-300">{weatherCodeLabel(d.code)}</div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-emerald-300 font-semibold">
                            {Number.isFinite(d.tMax ?? NaN) ? Math.round(d.tMax!) : '—'}°
                            <span className="text-xs align-top">F</span>
                          </span>
                          <span className="text-neutral-400">
                            {Number.isFinite(d.tMin ?? NaN) ? Math.round(d.tMin!) : '—'}°
                            <span className="text-xs align-top">F</span>
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-neutral-400">
                          💧 {typeof d.precip === 'number' ? d.precip.toFixed(2) : '—'} in
                        </div>
                        <div className="mt-1 text-xs text-neutral-400">
                          🌬️ {Number.isFinite(d.windMax ?? NaN) ? Math.round(d.windMax!) : '—'} mph
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-neutral-500">—</p>
              )}
            </div>
          </section>

          {/* Full-width Gallery */}
          <section className="pb-8">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur p-6">
              <h3 className="font-semibold mb-3">Gallery</h3>
              {gallery.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {gallery.map((src, i) => (
                    <div
                      key={i}
                      className="relative aspect-[4/3] overflow-hidden rounded-xl border border-neutral-800"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`Photo ${i + 1}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500">—</p>
              )}
            </div>
          </section>

          {/* Full-width Reviews */}
          <section className="pb-12">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur p-6">
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
          </section>

          {/* Spacer pushes footer to bottom when content is short */}
          <div className="mt-auto" />

          <Footer />
        </div>
      </PageShell>
    </main>
  );
}

// --- Small UI -----------------------------------------------------------
function Info({ label, value }: { label: string; value: string }) {
  const isMissing = value === '—';
  return (
    <div
      className={`rounded-xl border p-3 ${
        isMissing ? 'border-neutral-800 text-neutral-500' : 'border-neutral-800 bg-neutral-900/70'
      }`}
    >
      <div className="text-xs uppercase tracking-wide text-neutral-400">{label}</div>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}
