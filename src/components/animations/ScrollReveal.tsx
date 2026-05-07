'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
}

export function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 1,
  distance = 50,
  className = '',
}: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const x = direction === 'left' ? -distance : direction === 'right' ? distance : 0;
    const y = direction === 'up' ? distance : direction === 'down' ? -distance : 0;

    gsap.fromTo(
      elementRef.current,
      {
        opacity: 0,
        x,
        y,
        scale: 0.95,
      },
      {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: elementRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  }, [direction, delay, duration, distance]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}
