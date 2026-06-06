'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/** Full MSP wordmark + emblem (viewBox 265.5 × 109.5). */
export const MSP_FULL_LOGO_SRC = '/images/msp-full-logo.svg';
export const MSP_FULL_LOGO_ASPECT = 109.5 / 265.5;

/** Matches admin page titles (Control Panel, Operatives, etc.). */
export const ADMIN_PAGE_TITLE_TYPE = 'text-4xl sm:text-5xl';

type MspBrandLogoProps = {
  /** Visual height in px; ignored when `heightEm` is set. */
  height?: number;
  /** Logo height as a multiple of the surrounding font-size (use inside ADMIN_PAGE_TITLE_TYPE wrapper). */
  heightEm?: number;
  className?: string;
  frameClassName?: string;
  priority?: boolean;
};

/**
 * Renders the full MSP brand mark on dark surfaces.
 * Uses a native img so complex SVG+raster assets are not altered by the image optimizer.
 */
export function MspBrandLogo({
  height = 56,
  heightEm,
  className,
  frameClassName,
  priority = false,
}: MspBrandLogoProps) {
  const useEm = heightEm != null;
  const width = useEm ? undefined : Math.round(height / MSP_FULL_LOGO_ASPECT);

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-sm border border-orange-500/25 bg-transparent',
        'shadow-[0_0_12px_rgba(249,115,22,0.08)]',
        useEm ? 'px-[0.4em] py-[0.18em]' : 'px-3 py-1.5',
        frameClassName,
        className,
      )}
    >
      <img
        src={MSP_FULL_LOGO_SRC}
        alt="My Stable Prime"
        width={width}
        height={useEm ? undefined : height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className="block w-auto max-w-full object-contain object-center select-none bg-transparent"
        style={
          useEm
            ? { height: `${heightEm}em`, width: 'auto', aspectRatio: `${265.5} / ${109.5}` }
            : { height, width: 'auto', maxHeight: height }
        }
      />
    </div>
  );
}
