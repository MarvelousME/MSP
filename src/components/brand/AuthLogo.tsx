'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type AuthLogoProps = {
  pulseKey?: number;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
};

export function AuthLogo({
  pulseKey = 0,
  width = 280,
  height = 72,
  className,
  priority = true,
}: AuthLogoProps) {
  return (
    <motion.div
      key={pulseKey}
      initial={{ scale: 1 }}
      animate={pulseKey > 0 ? { scale: [1, 1.015, 1, 1.015, 1, 1.015, 1] } : { scale: 1 }}
      transition={{ duration: 1.2, ease: 'easeInOut' }}
      className={cn('flex justify-center w-full max-w-full overflow-hidden', className)}
    >
      <Image
        src="/images/mystableprime-logo.svg"
        alt="My Stable Prime"
        width={width}
        height={height}
        priority={priority}
        className="object-contain max-w-full"
        style={{ width, height: 'auto', maxWidth: width }}
      />
    </motion.div>
  );
}
