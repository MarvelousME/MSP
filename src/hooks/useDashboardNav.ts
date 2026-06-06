'use client';

import { startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useSidebar } from '@/components/ui/sidebar';

export function useDashboardNav() {
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();

  const closeIfMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  const navigate = (url: string) => {
    closeIfMobile();
    startTransition(() => router.push(url));
  };

  return { navigate, closeIfMobile };
}
