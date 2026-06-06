'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

const DEFAULT_LOGO_SRC = '/images/mystableprime-logo.svg';
const DEFAULT_LOGO_ASPECT = 44 / 154;

type EntryBrandLogoProps = {
  onComplete?: () => void;
  className?: string;
  logoSrc?: string;
  width?: number;
  logoAspect?: number;
};

function LogoSlice({
  leftPct,
  widthPct,
  logoWidth,
  children,
}: {
  leftPct: number;
  widthPct: number;
  logoWidth: number;
  children: React.ReactNode;
}) {
  const offset = (leftPct / 100) * logoWidth;
  return (
    <div
      className="absolute top-0 h-full overflow-hidden"
      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
    >
      <div
        className="absolute top-0"
        style={{ left: -offset, width: logoWidth }}
      >
        {children}
      </div>
    </div>
  );
}

export function EntryBrandLogo({
  onComplete,
  className,
  logoSrc = DEFAULT_LOGO_SRC,
  width = 180,
  logoAspect = DEFAULT_LOGO_ASPECT,
}: EntryBrandLogoProps) {
  const reducedMotion = useReducedMotion();
  const logoHeight = Math.round(width * logoAspect);

  useEffect(() => {
    if (reducedMotion) {
      onComplete?.();
      return;
    }
    const timer = window.setTimeout(() => onComplete?.(), 2400);
    return () => window.clearTimeout(timer);
  }, [onComplete, reducedMotion]);

  const image = (
    <Image
      src={logoSrc}
      alt="My Stable Prime"
      width={width}
      height={logoHeight}
      priority
      className="object-contain"
      style={{ width, height: 'auto' }}
    />
  );

  if (reducedMotion) {
    return (
      <div className={className} style={{ width, height: logoHeight }}>
        {image}
      </div>
    );
  }

  return (
    <div
      className={`relative mx-auto ${className ?? ''}`}
      style={{ width, height: logoHeight }}
    >
      {/* Tight orange glow hugging the logo */}
      <motion.div
        className="pointer-events-none absolute -inset-1 rounded-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.55, 0.4, 0.5] }}
        transition={{ duration: 1.6, ease: 'easeOut' }}
        style={{
          boxShadow:
            '0 0 8px 2px rgba(249,115,22,0.22), 0 0 16px 4px rgba(249,115,22,0.12), inset 0 0 12px rgba(249,115,22,0.08)',
        }}
      />

      {/* Flame — left emblem */}
      <LogoSlice leftPct={0} widthPct={30} logoWidth={width}>
        <motion.div
          initial={{ opacity: 0, scale: 0.82, filter: 'brightness(0.6)' }}
          animate={{
            opacity: 1,
            scale: [0.82, 1.06, 1, 1.03, 1],
            filter: ['brightness(0.6)', 'brightness(1.15)', 'brightness(1)', 'brightness(1.08)', 'brightness(1)'],
          }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {image}
        </motion.div>
      </LogoSlice>

      {/* Dice — rolls into place */}
      <LogoSlice leftPct={26} widthPct={26} logoWidth={width}>
        <motion.div
          initial={{ opacity: 0, rotate: -280, y: -18, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 0, y: 0, scale: 1 }}
          transition={{
            delay: 0.35,
            duration: 0.85,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ transformOrigin: '50% 60%', perspective: 400 }}
        >
          {image}
        </motion.div>
      </LogoSlice>

      {/* Name — sweeps in from the left */}
      <LogoSlice leftPct={50} widthPct={50} logoWidth={width}>
        <motion.div
          initial={{ opacity: 0, x: -48 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: 0.75,
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {image}
        </motion.div>
      </LogoSlice>
    </div>
  );
}
