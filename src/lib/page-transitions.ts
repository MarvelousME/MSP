export type TransitionVariant = {
  id: string;
  initial: Record<string, number>;
  animate: Record<string, number>;
  exit: Record<string, number>;
  enterDuration: number;
  exitDuration: number;
  enterDelay: number;
};

/** Shared easing — soft deceleration, no bounce */
export const PAGE_TRANSITION_EASE = [0.22, 1, 0.36, 1] as const;
export const PAGE_TRANSITION_ENTER_DELAY = 0.16;

const D = { sm: 16, md: 24, lg: 36 } as const;

/**
 * Curated enter/exit pairs. Each route gets a stable variant via hash(pathname)
 * so navigation feels intentional, not chaotic.
 */
const variants: TransitionVariant[] = [
  {
    id: 'fade-in',
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    enterDuration: 0.52,
    exitDuration: 0.28,
    enterDelay: 0.14,
  },
  {
    id: 'fade-in-left',
    initial: { opacity: 0, x: -D.md },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: D.sm },
    enterDuration: 0.56,
    exitDuration: 0.3,
    enterDelay: 0.16,
  },
  {
    id: 'fade-in-right',
    initial: { opacity: 0, x: D.md },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -D.sm },
    enterDuration: 0.56,
    exitDuration: 0.3,
    enterDelay: 0.16,
  },
  {
    id: 'fade-in-up',
    initial: { opacity: 0, y: D.sm },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -D.sm },
    enterDuration: 0.54,
    exitDuration: 0.28,
    enterDelay: 0.15,
  },
  {
    id: 'fade-in-down',
    initial: { opacity: 0, y: -D.sm },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: D.sm },
    enterDuration: 0.54,
    exitDuration: 0.28,
    enterDelay: 0.15,
  },
  {
    id: 'slide-in',
    initial: { opacity: 0, y: D.lg },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -D.md },
    enterDuration: 0.58,
    exitDuration: 0.32,
    enterDelay: 0.18,
  },
  {
    id: 'slide-in-left',
    initial: { opacity: 0, x: -D.lg },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: D.md },
    enterDuration: 0.58,
    exitDuration: 0.32,
    enterDelay: 0.18,
  },
  {
    id: 'slide-in-right',
    initial: { opacity: 0, x: D.lg },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -D.md },
    enterDuration: 0.58,
    exitDuration: 0.32,
    enterDelay: 0.18,
  },
  {
    id: 'fade-scale-in',
    initial: { opacity: 0, scale: 0.97 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.02 },
    enterDuration: 0.55,
    exitDuration: 0.28,
    enterDelay: 0.16,
  },
  {
    id: 'slide-fade-in-left',
    initial: { opacity: 0, x: -D.md, y: D.sm },
    animate: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, x: D.sm, y: -D.sm },
    enterDuration: 0.6,
    exitDuration: 0.34,
    enterDelay: 0.18,
  },
  {
    id: 'slide-fade-in-right',
    initial: { opacity: 0, x: D.md, y: D.sm },
    animate: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, x: -D.sm, y: -D.sm },
    enterDuration: 0.6,
    exitDuration: 0.34,
    enterDelay: 0.18,
  },
];

const reducedMotionVariant: TransitionVariant = {
  id: 'fade-in-reduced',
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  enterDuration: 0.15,
  exitDuration: 0.1,
  enterDelay: 0,
};

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getPageTransition(routeKey: string, reducedMotion = false): TransitionVariant {
  if (reducedMotion) return reducedMotionVariant;
  return variants[hashString(routeKey) % variants.length];
}

export const PAGE_TRANSITION_VARIANT_IDS = variants.map((v) => v.id);
