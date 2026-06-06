'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { EntryBrandLogo } from '@/components/brand/EntryBrandLogo';
import { consumeEntryAnimation } from '@/lib/entry-animation';

const DEFAULT_LOGO_SRC = '/images/mystableprime-logo.svg';
const DEFAULT_LOGO_ASPECT = 44 / 154;

type DashboardLogoProps = {
  width?: number;
  className?: string;
  logoSrc?: string;
  logoAspect?: number;
  /** Scales logo up inside an overflow-hidden slot (e.g. 2 fills header height). */
  scale?: number;
};

export function DashboardLogo({
  width = 154,
  className,
  logoSrc = DEFAULT_LOGO_SRC,
  logoAspect = DEFAULT_LOGO_ASPECT,
  scale = 1,
}: DashboardLogoProps) {
  const [showEntry, setShowEntry] = useState(false);
  const height = Math.round(width * logoAspect);

  useEffect(() => {
    setShowEntry(consumeEntryAnimation());
  }, []);

  const logoContent = (
    <AnimatePresence mode="wait">
      {showEntry ? (
        <motion.div
          key="entry"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <EntryBrandLogo
            onComplete={() => setShowEntry(false)}
            logoSrc={logoSrc}
            width={width}
            logoAspect={logoAspect}
          />
        </motion.div>
      ) : (
        <motion.div
          key="static"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div
            className="pointer-events-none absolute -inset-0.5 rounded-sm"
            style={{
              boxShadow: '0 0 6px 1px rgba(249,115,22,0.14), 0 0 14px 2px rgba(249,115,22,0.06)',
            }}
          />
          <Image
            src={logoSrc}
            alt="My Stable Prime"
            width={width}
            height={height}
            priority
            className="object-contain relative z-[1] bg-transparent"
            style={{ width, height: 'auto', maxWidth: width, background: 'transparent' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (scale === 1) {
    return (
      <div className={`relative flex items-center justify-center ${className ?? ''}`}>
        {logoContent}
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className ?? ''}`}
      style={className ? undefined : { width, height }}
    >
      <div
        className="flex shrink-0 items-center justify-center origin-center"
        style={{ transform: `scale(${scale})` }}
      >
        {logoContent}
      </div>
    </div>
  );
}
