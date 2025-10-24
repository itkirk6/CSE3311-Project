'use client';

import React from 'react';

type BackgroundMediaProps = {
  imageSrc?: string;
  videoSrc?: string;
  overlay?: boolean;   // top darken overlay
  fadeHeight?: string; // e.g. "28vh" or "12rem"
  className?: string;
};

export default function BackgroundMedia({
  imageSrc,
  videoSrc,
  overlay = true,
  fadeHeight = '80vh',
  className = '',
}: BackgroundMediaProps) {
  const isImage = !!imageSrc;

  return (
    // Position only at the top, not full height; container auto-sizes to media
    <div
      aria-hidden
      className={`pointer-events-none absolute top-0 left-0 right-0 z-0 overflow-hidden ${className}`}
    >
      {isImage ? (
        // Scale by width; height auto
        <img
          src={imageSrc!}
          alt=""
          className="block w-screen h-auto select-none"
          loading="eager"
        />
      ) : videoSrc ? (
        <video
          className="block w-screen h-auto select-none"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        >
          <source src={videoSrc} />
        </video>
      ) : (
        // If no media provided, do nothing here; page bg will show
        <div />
      )}

      {/* Optional: subtle top overlay for contrast */}
      {overlay && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-gradient-to-b from-black/35 via-transparent to-transparent" />
      )}

      {/* Bottom fade to the page background (neutral-900) */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0"
        style={{
          height: fadeHeight,
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgb(23,23,23) 85%)',
        }}
      />
    </div>
  );
}
