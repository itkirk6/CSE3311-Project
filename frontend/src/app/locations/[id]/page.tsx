import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Footer from '@/app/components/Footer';
import NavBar from '@/app/components/NavBar';
import LocationDetailView from './LocationDetailView';
import { extractImageUrls, fetchLocationDetail } from './helpers';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import React from 'react';
import NavBar from '@/app/components/NavBar';
import Footer from '@/app/components/Footer';
import MapComponent from '@/app/components/MapComponent';

type LocationReview = {
  id: string;
  rating: number;
  title: string | null;
  content: string;
  createdAt: string;
  user?: {
    id: string;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
  } | null;
};

type LocationDetail = {
  id: string;
  name: string;
  description?: string | null;
  locationType: string;
  latitude: number;
  longitude: number;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  elevation?: number | null;
  terrainType?: string | null;
  climateZone?: string | null;
  amenities?: unknown;
  costPerNight?: string | number | null;
  maxCapacity?: number | null;
  petFriendly: boolean;
  reservationRequired: boolean;
  seasonStart?: string | null;
  seasonEnd?: string | null;
  difficultyLevel?: number | null;
  safetyNotes?: string | null;
  regulations?: string | null;
  contactInfo?: unknown;
  websiteUrl?: string | null;
  images?: unknown;
  verified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  rating?: number | null;
  createdById?: string | null;
  reviews: LocationReview[];
};

type ContactEntry = {
  label: string;
  value: string;
};

const API_BASE = (() => {
  const envValue = process.env.NEXT_PUBLIC_BACKEND_URL ?? process.env.BACKEND_URL ?? 'http://localhost:3001';
  return envValue === 'undefined' ? 'http://localhost:3001' : envValue;
})();

export const revalidate = 0;
export const dynamic = 'force-dynamic';

interface PageParams {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const location = await fetchLocationDetail(params.id);

  if (!location) {
    return { title: 'Location not found' };
  }

  const subtitleParts = [location.city, location.state, location.country].filter(
    (part): part is string => !!part && part.trim().length > 0,
  );
  const images = extractImageUrls(location.images);
  const heroImage = images[0];

  return {
    title: `${location.name} | Trails & Tails`,
    description: location.description ?? undefined,
    openGraph: {
      title: location.name,
      description: location.description ?? undefined,
      images: heroImage ? [heroImage] : undefined,
    },
    twitter: {
      card: heroImage ? 'summary_large_image' : 'summary',
      title: location.name,
      description: location.description ?? undefined,
      images: heroImage ? [heroImage] : undefined,
    },
    other: subtitleParts.length ? { location: subtitleParts.join(', ') } : undefined,
  };
}

export default async function LocationDetailPage({ params }: PageParams) {
function parseStructuredValue(value: unknown): unknown {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return trimmed;
      }
    }

    return trimmed;
  }

  return value ?? null;
}

function formatLabel(label: string): string {
  return label
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

function extractImageUrls(value: unknown): string[] {
  const urls = new Set<string>();

  const visit = (input: unknown): void => {
    const parsed = parseStructuredValue(input);
    if (!parsed) {
      return;
    }

    if (typeof parsed === 'string') {
      urls.add(parsed);
      return;
    }

    if (Array.isArray(parsed)) {
      parsed.forEach((item) => visit(item));
      return;
    }

    if (typeof parsed === 'object') {
      const record = parsed as Record<string, unknown>;
      const possibleUrl = record.url;
      if (typeof possibleUrl === 'string' && possibleUrl.trim()) {
        urls.add(possibleUrl.trim());
      }
      Object.values(record).forEach((item) => visit(item));
    }
  };

  visit(value);
  return Array.from(urls).filter((url) => !!url);
}

function extractAmenities(value: unknown): string[] {
  const items = new Set<string>();

  const visit = (input: unknown, labelHint?: string): void => {
    const parsed = parseStructuredValue(input);
    if (parsed === null || parsed === undefined) {
      return;
    }

    if (typeof parsed === 'boolean') {
      if (parsed && labelHint) {
        items.add(formatLabel(labelHint));
      }
      return;
    }

    if (typeof parsed === 'string' || typeof parsed === 'number') {
      items.add(formatLabel(String(parsed)));
      return;
    }

    if (Array.isArray(parsed)) {
      parsed.forEach((entry) => visit(entry));
      return;
    }

    if (typeof parsed === 'object') {
      Object.entries(parsed as Record<string, unknown>).forEach(([key, val]) => {
        visit(val, key);
      });
    }
  };

  visit(value);
  return Array.from(items);
}

function extractContactInfo(value: unknown): ContactEntry[] {
  const parsed = parseStructuredValue(value);
  if (!parsed) {
    return [];
  }

  if (Array.isArray(parsed)) {
    return parsed
      .map((entry, index) => {
        const structured = parseStructuredValue(entry);
        if (!structured) {
          return null;
        }

        if (typeof structured === 'string' || typeof structured === 'number') {
          return { label: `Contact ${index + 1}`, value: String(structured) };
        }

        if (typeof structured === 'object') {
          return Object.entries(structured as Record<string, unknown>)
            .filter(([, val]) => val !== null && val !== undefined && String(val).trim() !== '')
            .map(([key, val]) => ({ label: formatLabel(key), value: String(val) }));
        }

        return null;
      })
      .flat()
      .filter(Boolean) as ContactEntry[];
  }

  if (typeof parsed === 'object') {
    return Object.entries(parsed as Record<string, unknown>)
      .filter(([, val]) => val !== null && val !== undefined && String(val).trim() !== '')
      .map(([key, val]) => ({ label: formatLabel(key), value: String(val) }));
  }

  return [{ label: 'Contact', value: String(parsed) }];
}

function formatCurrency(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  let numeric: number | null = null;

  if (typeof value === 'number') {
    numeric = value;
  } else if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const parsed = Number(trimmed.replace(/[^0-9.-]+/g, ''));
    if (!Number.isNaN(parsed)) {
      numeric = parsed;
    }
  }

  if (numeric === null || Number.isNaN(numeric)) {
    return null;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numeric);
}

function formatDate(value: string | null | undefined, options?: Intl.DateTimeFormatOptions): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('en-US', options ?? { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
}

function formatSeason(start?: string | null, end?: string | null): string | null {
  const startFormatted = formatDate(start, { month: 'short', day: 'numeric' });
  const endFormatted = formatDate(end, { month: 'short', day: 'numeric' });

  if (!startFormatted && !endFormatted) {
    return null;
  }

  return `${startFormatted ?? '—'} – ${endFormatted ?? '—'}`;
}

function composeAddress(location: LocationDetail): string | null {
  const parts = [location.address, location.city, location.state, location.country].filter(
    (part): part is string => !!part && part.trim().length > 0,
  );
  if (parts.length === 0) {
    return null;
  }
  return parts.join(', ');
}

async function fetchLocationDetail(id: string): Promise<LocationDetail | null> {
  const response = await fetch(`${API_BASE}/api/locations/id/${id}`, {
    cache: 'no-store',
    next: { revalidate: 0 },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch location: ${response.status}`);
  }

  const data = await response.json();
  if (!data.success || !data.data) {
    return null;
  }

  return data.data as LocationDetail;
}

function renderValue(value: string | null, fallback = 'Not provided'): React.ReactNode {
  if (!value) {
    return <span className="text-neutral-500">{fallback}</span>;
  }
  return value;
}

export default async function LocationDetailPage({ params }: { params: { id: string } }) {
  const location = await fetchLocationDetail(params.id);

  if (!location) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100">
      <NavBar />
      <LocationDetailView location={location} />
  const imageUrls = extractImageUrls(location.images);
  const heroImage = imageUrls[0];
  const secondaryImages = imageUrls.slice(1);
  const amenities = extractAmenities(location.amenities);
  const contacts = extractContactInfo(location.contactInfo);
  const season = formatSeason(location.seasonStart, location.seasonEnd);
  const costPerNight = formatCurrency(location.costPerNight);
  const address = composeAddress(location);
  const generalLocation = [location.city, location.state, location.country]
    .filter((part): part is string => !!part && part.trim().length > 0)
    .join(', ');
  const ratingDisplay = location.rating !== null && location.rating !== undefined
    ? `${location.rating.toFixed(1)} / 5`
    : null;

  const stats: { label: string; value: string | null }[] = [
    { label: 'Cost per Night', value: costPerNight },
    { label: 'Season', value: season },
    { label: 'Terrain', value: location.terrainType ?? null },
    { label: 'Climate Zone', value: location.climateZone ?? null },
    { label: 'Elevation', value: location.elevation !== null && location.elevation !== undefined ? `${location.elevation} ft` : null },
    { label: 'Max Capacity', value: location.maxCapacity !== null && location.maxCapacity !== undefined ? `${location.maxCapacity} people` : null },
    { label: 'Difficulty Level', value: location.difficultyLevel !== null && location.difficultyLevel !== undefined ? `${location.difficultyLevel}/5` : null },
    { label: 'Safety Notes', value: location.safetyNotes ?? null },
    { label: 'Regulations', value: location.regulations ?? null },
    { label: 'Verified Status', value: location.verified ? 'Verified' : 'Not Verified' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100">
      <NavBar />

      <div className="flex-1 pt-16">
        <section
          className="relative h-[60vh] w-full overflow-hidden"
          style={heroImage ? { backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        >
          {!heroImage && <div className="absolute inset-0 bg-neutral-900" />}
          {heroImage && <div className="absolute inset-0 bg-neutral-950/60" />}

          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/20 via-neutral-950/60 to-neutral-950" />

          <div className="relative z-10 flex h-full items-end">
            <div className="max-w-6xl w-full mx-auto px-6 pb-12">
              <div className="flex flex-col gap-3">
                <span className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-emerald-300/80">
                  {location.locationType}
                  {location.petFriendly && (
                    <span className="rounded-full border border-emerald-300/60 px-3 py-0.5 text-xs text-emerald-200">
                      Pet Friendly
                    </span>
                  )}
                  {location.reservationRequired && (
                    <span className="rounded-full border border-amber-300/60 px-3 py-0.5 text-xs text-amber-200">
                      Reservation Required
                    </span>
                  )}
                </span>
                <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">{location.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-neutral-200">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-300">⭐</span>
                    {renderValue(ratingDisplay, 'Not yet rated')}
                  </div>
                  <div className="h-4 w-px bg-neutral-500/60" />
                  <div>{renderValue(generalLocation || null, 'Location unavailable')}</div>
                  {costPerNight && (
                    <>
                      <div className="h-4 w-px bg-neutral-500/60" />
                      <div>{costPerNight}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <main className="relative -mt-16 z-20">
          <div className="max-w-6xl mx-auto px-6 pb-24 space-y-16">
            <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
              <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-2xl font-semibold mb-4">Overview</h2>
                <p className="text-neutral-300 leading-relaxed">
                  {location.description ? location.description : (
                    <span className="text-neutral-500">Detailed description not available.</span>
                  )}
                </p>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="flex flex-col gap-1 rounded-2xl bg-neutral-950/60 border border-neutral-800 px-4 py-3">
                      <span className="text-xs uppercase tracking-wide text-neutral-500">{stat.label}</span>
                      <span className={`text-sm md:text-base ${stat.value ? 'text-neutral-100' : 'text-neutral-500'}`}>
                        {stat.value ?? 'Not provided'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <aside className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-8 shadow-xl space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Address</h3>
                  <p className="text-sm leading-6">
                    {renderValue(address, 'Address not available')}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-neutral-300">
                    <span>Pet Friendly</span>
                    <span className={`font-semibold ${location.petFriendly ? 'text-emerald-300' : 'text-neutral-500'}`}>
                      {location.petFriendly ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-neutral-300">
                    <span>Reservation Required</span>
                    <span className={`font-semibold ${location.reservationRequired ? 'text-amber-300' : 'text-neutral-500'}`}>
                      {location.reservationRequired ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-neutral-300">
                    <span>Created</span>
                    <span className="font-semibold text-neutral-200">
                      {renderValue(formatDate(location.createdAt), '—')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-neutral-300">
                    <span>Last Updated</span>
                    <span className="font-semibold text-neutral-200">
                      {renderValue(formatDate(location.updatedAt), '—')}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Website</h3>
                  {location.websiteUrl ? (
                    <a
                      href={location.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-emerald-300 hover:text-emerald-200"
                    >
                      Visit official site
                      <span aria-hidden>↗</span>
                    </a>
                  ) : (
                    <p className="text-sm text-neutral-500">Website not provided.</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Contact</h3>
                  {contacts.length > 0 ? (
                    <ul className="space-y-2 text-sm text-neutral-300">
                      {contacts.map((entry) => (
                        <li key={`${entry.label}-${entry.value}`} className="flex flex-col">
                          <span className="text-xs uppercase tracking-wide text-neutral-500">{entry.label}</span>
                          <span>{entry.value}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-neutral-500">No contact information available.</p>
                  )}
                </div>
              </aside>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
              {amenities.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 text-sm text-neutral-200"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500">Amenities information is not available.</p>
              )}
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Gallery</h2>
              {secondaryImages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {secondaryImages.map((imgUrl) => (
                    <div key={imgUrl} className="relative h-56 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                      <Image
                        src={imgUrl}
                        alt={`${location.name} secondary view`}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-105"
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        priority={false}
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500">No additional images available.</p>
              )}
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
              {location.reviews && location.reviews.length > 0 ? (
                <div className="space-y-4">
                  {location.reviews.map((review) => {
                    const reviewerName = review.user?.username
                      || [review.user?.firstName, review.user?.lastName].filter(Boolean).join(' ')
                      || null;
                    const reviewDate = formatDate(review.createdAt);
                    return (
                      <article
                        key={review.id}
                        className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-neutral-100">
                              {review.title ? review.title : <span className="text-neutral-500">Untitled review</span>}
                            </h3>
                            <span className="text-emerald-300 font-semibold">⭐ {review.rating}</span>
                          </div>
                          <div className="text-sm text-neutral-400 flex items-center gap-2">
                            <span>{renderValue(reviewerName, 'Anonymous explorer')}</span>
                            <span className="text-neutral-600">•</span>
                            <span>{renderValue(reviewDate, 'Date unavailable')}</span>
                          </div>
                        </div>
                        <p className="mt-4 text-neutral-200 leading-relaxed">
                          {review.content || <span className="text-neutral-500">No review text provided.</span>}
                        </p>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <p className="text-neutral-500">There are no reviews for this location yet.</p>
              )}
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Map</h2>
              <div className="rounded-3xl overflow-hidden border border-neutral-800 bg-neutral-900">
                <MapComponent
                  locations={[{
                    id: location.id,
                    name: location.name,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    description: location.description ?? undefined,
                  }]}
                />
              </div>
            </section>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
