'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import HeroSection from '@/app/components/HeroSection';
import PageShell from '@/app/components/PageShell';
import Section from '@/app/components/Section';

const MapComponent = dynamic(() => import('@/app/components/MapComponent'), { ssr: false });

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

export default function LocationPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [data, setData] = useState<LocationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('Missing id in URL.');
        setLoading(false);
        return;
      }

      try {
        const base = API_URL?.replace(/\/$/, '') || '';
        const endpoint = `${base}/api/locations/id/${encodeURIComponent(id)}`;
        const abortSignal =
          typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
            ? (AbortSignal as unknown as { timeout: (ms: number) => AbortSignal }).timeout(5000)
            : undefined;

        const res = await fetch(endpoint, {
          headers: { 'Content-Type': 'application/json' },
          signal: abortSignal,
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
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load location.');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL, id]);

  const bgImage = getFirstImage(data?.images ?? data?.secondaryImages ?? null);

  return (
    <PageShell
      mainClassName="space-y-16 pb-24"
      backgroundMedia={
        bgImage
          ? {
              type: 'image',
              src: bgImage,
              alt: data?.name ?? 'Location background',
              className: 'object-cover',
              loading: 'eager',
            }
          : {
              type: 'solid',
              className: 'bg-neutral-900',
            }
      }
      overlayClassName="from-neutral-950/70 via-neutral-950/80 to-neutral-950"
    >
      <HeroSection
        className="items-end pb-12"
        overlayClassName="from-neutral-950/60 via-neutral-950/40 to-neutral-900"
        heightClassName="min-h-[420px] h-[70vh]"
      >
        <Section as="div" className="flex h-full items-end">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              {loading ? 'Loading…' : data?.name ?? '—'}
            </h1>
            <p className="mt-3 text-lg text-neutral-200">
              {loading ? '' : data?.blurb || data?.description || '—'}
            </p>
          </div>
        </Section>
      </HeroSection>

      <Section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <article className="lg:col-span-2 space-y-6 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6 backdrop-blur">
          {loading && <p className="text-neutral-400">Loading details…</p>}
          {error && !loading && <p className="text-red-400">{error}</p>}

          {!loading && !error && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <Info label="Price" value={fmt(data?.price ?? data?.cost)} />
                <Info label="Rating" value={fmt(data?.rating)} />
                <Info label="Pet friendly" value={fmt(data?.petFriendly)} />
                <Info label="Reservation required" value={fmt(data?.reservationRequired)} />
                <Info label="Season start" value={fmt(data?.seasonStart)} />
                <Info label="Season end" value={fmt(data?.seasonEnd)} />
              </div>

              <div className="rounded-xl border border-neutral-800 p-4">
                <h3 className="mb-2 font-semibold">Address</h3>
                <p className="whitespace-pre-line text-neutral-300">
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

              <div className="rounded-xl border border-neutral-800 p-4">
                <h3 className="mb-2 font-semibold">Website</h3>
                {data?.website ? (
                  <a
                    href={data.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-words text-emerald-400 hover:underline"
                  >
                    {data.website}
                  </a>
                ) : (
                  <span className="text-neutral-500">—</span>
                )}
              </div>

              <div>
                <h3 className="mb-3 font-semibold">Gallery</h3>
                {data?.secondaryImages && data.secondaryImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
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

              <div>
                <h3 className="mb-3 font-semibold">Reviews</h3>
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

        <aside className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 backdrop-blur">
          <h3 className="font-semibold">Map</h3>
          {!loading && data && isTruthy(data.latitude) && isTruthy(data.longitude) ? (
            <MapComponent
              locations={[
                {
                  id: data.id,
                  name: data.name,
                  latitude: Number(data.latitude!),
                  longitude: Number(data.longitude!),
                  description: data.description ?? undefined,
                },
              ]}
            />
          ) : (
            <div className="flex h-96 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-500">
              —
            </div>
          )}
        </aside>
      </Section>
    </PageShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  const isMissing = value === '—';
  return (
    <div className={`rounded-xl border p-3 ${isMissing ? 'border-neutral-800 text-neutral-500' : 'border-neutral-800 bg-neutral-900/70'}`}>
      <div className="text-xs uppercase tracking-wide text-neutral-400">{label}</div>
      <div className="mt-1 text-sm text-neutral-100">{value}</div>
    </div>
  );
}
