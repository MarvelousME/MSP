'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';

type BackToTopProps = {
  scrollContainerId?: string;
  threshold?: number;
};

export function BackToTop({ scrollContainerId = 'dashboard-main', threshold = 320 }: BackToTopProps) {
  const [visible, setVisible] = useState(false);

  const getContainer = useCallback(() => {
    if (typeof document === 'undefined') return null;
    return document.getElementById(scrollContainerId);
  }, [scrollContainerId]);

  useEffect(() => {
    const container = getContainer();
    const target: HTMLElement | Window = container ?? window;

    const onScroll = () => {
      const scrollTop = container ? container.scrollTop : window.scrollY;
      setVisible(scrollTop > threshold);
    };

    target.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => target.removeEventListener('scroll', onScroll);
  }, [getContainer, threshold]);

  const scrollToTop = () => {
    const container = getContainer();
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          transition={{ duration: 0.25 }}
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 flex h-11 w-11 items-center justify-center rounded-md border-2 border-orange-500/80 bg-[#020617]/90 text-orange-400 shadow-[0_8px_24px_rgba(0,0,0,0.45),0_4px_16px_rgba(249,115,22,0.2)] backdrop-blur-md transition-colors hover:border-orange-400 hover:text-orange-300 hover:shadow-[0_12px_32px_rgba(249,115,22,0.25)]"
        >
          <AnimatedIcon icon={ArrowUp} className="text-orange-400" size={19} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
