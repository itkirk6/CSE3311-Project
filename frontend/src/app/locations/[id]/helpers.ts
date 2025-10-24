export type LocationReview = {
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

export type LocationDetail = {
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

export type ContactEntry = {
  label: string;
  value: string;
};

export type DisplayStat = {
  label: string;
  value: string | null;
};

export const API_BASE = (() => {
  const envValue =
    process.env.NEXT_PUBLIC_BACKEND_URL ?? process.env.BACKEND_URL ?? 'http://localhost:3001';

  return envValue === 'undefined' ? 'http://localhost:3001' : envValue;
})();

export function parseStructuredValue(value: unknown): unknown {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    if (
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))
    ) {
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

export function formatLabel(label: string): string {
  return label
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

export function extractImageUrls(value: unknown): string[] {
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
  return Array.from(urls).filter(Boolean);
}

export function extractAmenities(value: unknown): string[] {
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

export function extractContactInfo(value: unknown): ContactEntry[] {
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

export function formatCurrency(value: unknown): string | null {
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

export function formatDate(
  value: string | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('en-US', options ?? { year: 'numeric', month: 'short', day: 'numeric' }).format(
    date,
  );
}

export function formatSeason(start?: string | null, end?: string | null): string | null {
  const startFormatted = formatDate(start, { month: 'short', day: 'numeric' });
  const endFormatted = formatDate(end, { month: 'short', day: 'numeric' });

  if (!startFormatted && !endFormatted) {
    return null;
  }

  return `${startFormatted ?? '—'} – ${endFormatted ?? '—'}`;
}

export function composeAddress(location: LocationDetail): string | null {
  const parts = [location.address, location.city, location.state, location.country].filter(
    (part): part is string => !!part && part.trim().length > 0,
  );

  if (parts.length === 0) {
    return null;
  }

  return parts.join(', ');
}

export function buildStats(location: LocationDetail): DisplayStat[] {
  return [
    { label: 'Cost per Night', value: formatCurrency(location.costPerNight) },
    { label: 'Season', value: formatSeason(location.seasonStart, location.seasonEnd) },
    { label: 'Terrain', value: location.terrainType ?? null },
    { label: 'Climate Zone', value: location.climateZone ?? null },
    { label: 'Latitude', value: Number.isFinite(location.latitude) ? location.latitude.toFixed(5) : null },
    { label: 'Longitude', value: Number.isFinite(location.longitude) ? location.longitude.toFixed(5) : null },
    {
      label: 'Elevation',
      value:
        location.elevation !== null && location.elevation !== undefined ? `${location.elevation} ft` : null,
    },
    {
      label: 'Max Capacity',
      value:
        location.maxCapacity !== null && location.maxCapacity !== undefined ? `${location.maxCapacity} people` : null,
    },
    {
      label: 'Difficulty Level',
      value:
        location.difficultyLevel !== null && location.difficultyLevel !== undefined
          ? `${location.difficultyLevel}/5`
          : null,
    },
    { label: 'Safety Notes', value: location.safetyNotes ?? null },
    { label: 'Regulations', value: location.regulations ?? null },
    { label: 'Verified Status', value: location.verified ? 'Verified' : 'Not Verified' },
    { label: 'Active', value: location.isActive ? 'Active' : 'Inactive' },
    { label: 'Created By', value: location.createdById ?? null },
  ];
}

export async function fetchLocationDetail(id: string): Promise<LocationDetail | null> {
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
