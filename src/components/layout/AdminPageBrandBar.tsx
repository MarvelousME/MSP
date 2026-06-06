'use client';

import React from 'react';
import {
  ADMIN_PAGE_TITLE_TYPE,
  MspBrandLogo,
} from '@/components/brand/MspBrandLogo';
import { cn } from '@/lib/utils';

/** Logo height = 2× the page title cap height (text-5xl line). */
export const ADMIN_BRAND_LOGO_TITLE_RATIO = 2;

type AdminPageBrandBarProps = {
  left: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
};

/**
 * Three-column page header: title block | centered brand | actions/widgets.
 * Logo is sized at 2× the Control Panel word (text-5xl) with proportional spacing.
 */
export function AdminPageBrandBar({
  left,
  right,
  className,
}: AdminPageBrandBarProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-y-8',
        'lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:gap-x-12 xl:gap-x-16',
        className,
      )}
    >
      <div className="min-w-0 justify-self-start order-2 lg:order-1">{left}</div>

      <div
        className={cn(
          'flex items-center justify-center justify-self-center order-1 lg:order-2',
          'px-6 sm:px-10 lg:px-12 xl:px-16',
          ADMIN_PAGE_TITLE_TYPE,
        )}
      >
        <MspBrandLogo
          heightEm={ADMIN_BRAND_LOGO_TITLE_RATIO}
          priority
          className="max-w-[min(92vw,36rem)]"
        />
      </div>

      {right ? (
        <div className="flex items-center justify-end justify-self-end min-w-0 order-3 lg:pl-4">
          {right}
        </div>
      ) : (
        <div className="hidden lg:block" aria-hidden />
      )}
    </div>
  );
}
