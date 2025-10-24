'use client';

import { ElementType, PropsWithChildren } from 'react';

type BackplateProps = PropsWithChildren<{
  as?: ElementType;
  className?: string;
  paddingClassName?: string;
  roundedClassName?: string;
  backdropBlurClassName?: string;
  backgroundClassName?: string;
  ringClassName?: string;
  tintPointerEventsNone?: boolean;
}>;

export default function Backplate({
  as: Tag = 'div',
  className = '',
  paddingClassName = 'p-6 sm:p-8 md:p-10',
  roundedClassName = 'rounded-2xl',
  backdropBlurClassName = 'backdrop-blur-[2px]',
  backgroundClassName = 'bg-black/45',
  ringClassName = 'ring-1 ring-white/10',
  tintPointerEventsNone = true,
  children,
}: BackplateProps) {
  return (
    <Tag className={`relative ${className}`}>
      {/* Background tint + blur */}
      <div
        aria-hidden="true"
        className={[
          'absolute inset-0',
          roundedClassName,
          backgroundClassName,
          backdropBlurClassName,
          ringClassName,
          tintPointerEventsNone ? 'pointer-events-none' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      />
      {/* Foreground content */}
      <div
        className={[
          'relative z-10 text-inherit',
          paddingClassName,
          roundedClassName,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </div>
    </Tag>
  );
}
