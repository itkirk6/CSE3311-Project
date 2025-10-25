'use client';

import { useEffect, useMemo, useState } from 'react';

export default function GalleryLightbox({
  images,
  isOpen,
  startIndex = 0,
  onClose,
  ariaLabel = 'Image gallery',
}: {
  images: string[];
  isOpen: boolean;
  startIndex?: number;
  onClose: () => void;
  ariaLabel?: string;
}) {
  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    if (!isOpen) return;
    setIndex(Math.min(Math.max(0, startIndex), Math.max(0, safeImages.length - 1)));
  }, [isOpen, startIndex, safeImages.length]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % safeImages.length);
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + safeImages.length) % safeImages.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, safeImages.length, onClose]);

  if (!isOpen || safeImages.length === 0) return null;

  const current = safeImages[index];

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center"
      aria-label={ariaLabel}
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        // close when clicking the backdrop (but not when clicking inside image/card area)
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-white hover:bg-white/20"
        aria-label="Close"
      >
        ✕
      </button>

      {/* Prev */}
      <button
        onClick={() => setIndex((i) => (i - 1 + safeImages.length) % safeImages.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-white hover:bg-white/20"
        aria-label="Previous image"
      >
        ‹
      </button>

      {/* Image */}
      <div className="max-w-[90vw] max-h-[85vh] rounded-xl overflow-hidden border border-white/15 bg-black/30 shadow-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current}
          alt={`Image ${index + 1} of ${safeImages.length}`}
          className="block max-h-[85vh] max-w-[90vw] object-contain"
          draggable={false}
        />
      </div>

      {/* Next */}
      <button
        onClick={() => setIndex((i) => (i + 1) % safeImages.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-white hover:bg-white/20"
        aria-label="Next image"
      >
        ›
      </button>

      {/* Counter */}
      <div className="absolute bottom-4 text-white/80 text-sm">
        {index + 1} / {safeImages.length}
      </div>
    </div>
  );
}
