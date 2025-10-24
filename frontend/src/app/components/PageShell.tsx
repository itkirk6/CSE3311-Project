'use client';

import React, { useEffect } from 'react';
import BackgroundMedia from './BackgroundMedia';

type PageShellProps = {
  children: React.ReactNode;
  imageSrc?: string;
  videoSrc?: string;
  fadeHeight?: string;
  overlay?: boolean;
  withFixedHeaderOffset?: boolean;
  containerClassName?: string;
};

export default function PageShell({
  children,
  imageSrc,
  videoSrc,
  overlay = true,
  fadeHeight,
  withFixedHeaderOffset = true,
  containerClassName = 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8',
}: PageShellProps) {
  // Fallback for --header-h if your NavBar hasn't set it yet
  useEffect(() => {
    const hasVar =
      getComputedStyle(document.documentElement).getPropertyValue('--header-h');
    if (!hasVar) document.documentElement.style.setProperty('--header-h', '64px');
  }, []);

  return (
    // Keep a solid page background (neutral-900)
    <section className="relative isolate min-h-screen bg-neutral-900 text-neutral-100 flex flex-col overflow-x-clip overflow-y-hidden">
      {/* Background media sits at the top and auto-sizes by width */}
      <BackgroundMedia
        imageSrc={imageSrc}
        videoSrc={videoSrc}
        overlay={overlay}
        fadeHeight={fadeHeight}
      />

      {/* Foreground content */}
      <div
        className={`relative z-10 flex-1 ${containerClassName}`}
        style={{
          paddingTop: withFixedHeaderOffset ? 'var(--header-h, 64px)' : undefined,
        }}
      >
        {children}
      </div>
    </section>
  );
}
