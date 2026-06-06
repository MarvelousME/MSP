'use client';

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { getPageTransition, PAGE_TRANSITION_EASE } from '@/lib/page-transitions';

type PageTransitionProps = {
  routeKey: string;
  children: React.ReactNode;
};

export function PageTransition({ routeKey, children }: PageTransitionProps) {
  const prefersReducedMotion = useReducedMotion();
  const variant = getPageTransition(routeKey, prefersReducedMotion ?? false);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={routeKey}
        initial={variant.initial}
        animate={variant.animate}
        exit={{
          ...variant.exit,
          transition: {
            duration: variant.exitDuration,
            ease: PAGE_TRANSITION_EASE,
          },
        }}
        transition={{
          duration: variant.enterDuration,
          delay: variant.enterDelay,
          ease: PAGE_TRANSITION_EASE,
        }}
        className="relative z-10 will-change-[opacity,transform]"
        style={{ transformOrigin: '50% 20%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
