const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/$/, '');

const isAbsoluteUrl = (value: string): boolean => /^https?:\/\//i.test(value);

const normalisePath = (value: string): string => {
  if (!value) return value;
  return value.startsWith('/') ? value : `/${value}`;
};

export const buildImageUrl = (value?: string | null): string | undefined => {
  if (!value) return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (isAbsoluteUrl(trimmed)) return trimmed;
  if (!backendBase) return normalisePath(trimmed);
  return `${backendBase}${normalisePath(trimmed)}`;
};
