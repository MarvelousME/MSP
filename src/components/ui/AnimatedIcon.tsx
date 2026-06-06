'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type AnimatedIconProps = {
  icon: LucideIcon;
  className?: string;
  size?: number;
};

export function AnimatedIcon({ icon: Icon, className, size = 19 }: AnimatedIconProps) {
  return (
    <motion.span
      className={cn('inline-flex shrink-0 items-center justify-center', className)}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.12, 1] }}
      transition={{ duration: 0.75, times: [0, 0.45, 1], ease: 'easeOut' }}
      whileHover={{ scale: 1.14 }}
    >
      <Icon className="shrink-0" style={{ width: size, height: size }} />
    </motion.span>
  );
}
