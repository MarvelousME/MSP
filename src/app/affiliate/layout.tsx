'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardNav } from '@/hooks/useDashboardNav';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  Wallet,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  ChevronsUpDown,
  Loader2,
  Lock,
} from 'lucide-react';
import { FlameBackground } from '@/components/animations/FlameBackground';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';
import { DashboardLogo } from '@/components/brand/DashboardLogo';
import { PageTransition } from '@/components/layout/PageTransition';
import { BackToTop } from '@/components/layout/BackToTop';
import { NotificationCenter } from '@/components/layout/NotificationCenter';

interface BrandSettings {
  companyName?: string;
  companyLogo?: string;
  brandBackgroundColor?: string;
  brandButtonColor?: string;
  brandTextColor?: string;
}

const mainNavItems = [
  { title: 'Dashboard', url: '/affiliate', icon: LayoutDashboard },
  { title: 'Referrals', url: '/affiliate/referrals', icon: Users },
  { title: 'Payouts', url: '/affiliate/payouts', icon: Wallet },
  { title: 'Resources', url: '/affiliate/resources', icon: BookOpen },
  { title: 'Reports', url: '/affiliate/reports', icon: BarChart3, badge: 'BETA' },
];

const accountNavItems = [
  { title: 'Settings', url: '/affiliate/settings', icon: Settings },
];

function AffiliateSidebar({ brand }: { brand: BrandSettings }) {
  const pathname = usePathname();
  const { navigate, closeIfMobile } = useDashboardNav();
  const { user, logout } = useAuth();

  const isActive = (url: string) => {
    if (url === '/affiliate') return pathname === '/affiliate';
    return pathname.startsWith(url);
  };

  const accentColor = brand.brandButtonColor || '#14b8a6';
  const brandName = brand.companyName || 'My Stable Prime';

  return (
    <Sidebar variant="inset" className="border-r border-white/5 bg-[#020617]/80 backdrop-blur-2xl">
      <SidebarHeader className="border-b border-white/5">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="px-4 py-5">
              <p className="text-[13px] font-black uppercase tracking-[0.25em] text-teal-500/70 truncate">
                {brandName}
              </p>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="scrollbar-hide py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 text-[13px] font-black uppercase tracking-[0.2em] text-teal-500/50">
            Partner Hub
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-3">
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={isActive(item.url)}
                    onClick={() => navigate(item.url)}
                    tooltip={item.title}
                    className={`h-11 rounded-md transition-all cursor-pointer ${isActive(item.url) ? 'bg-teal-500/10 border border-teal-500/20' : 'hover:bg-white/5'}`}
                  >
                    <AnimatedIcon icon={item.icon} className={isActive(item.url) ? 'text-teal-400' : 'text-slate-500'} />
                    <span className={`text-sm ${isActive(item.url) ? 'font-bold text-teal-400' : 'text-slate-400'}`}>
                      {item.title}
                    </span>
                    {item.badge && (
                      <span className="ml-auto rounded-none bg-orange-500 px-1.5 py-0.5 text-[12px] font-black text-black">
                        {item.badge}
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="px-6 text-[13px] font-black uppercase tracking-[0.2em] text-slate-600">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-3">
              {accountNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={isActive(item.url)}
                    onClick={() => navigate(item.url)}
                    tooltip={item.title}
                    className={`h-11 rounded-md transition-all cursor-pointer ${isActive(item.url) ? 'bg-slate-800 border border-white/10' : 'hover:bg-white/5'}`}
                  >
                    <AnimatedIcon icon={item.icon} className={isActive(item.url) ? 'text-slate-200' : 'text-slate-500'} />
                    <span className={`text-sm ${isActive(item.url) ? 'font-bold text-slate-100' : 'text-slate-500'}`}>
                      {item.title}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/5 bg-black/40 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-white/5 transition-all rounded-lg border border-transparent hover:border-white/10 cursor-pointer"
                >
                  <Avatar className="h-12 w-12 rounded-lg border border-white/20">
                    <AvatarImage src={user?.profilePicture} alt={user?.name} className="object-cover" />
                    <AvatarFallback className="rounded-lg text-white text-lg font-bold" style={{ backgroundColor: accentColor }}>
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight ml-3">
                    <span className="truncate font-bold text-slate-200 uppercase text-[14px] tracking-wider">{user?.name}</span>
                    <span className="truncate text-[13px] font-mono text-slate-500">{user?.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto h-4 w-4 text-slate-500" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-none bg-slate-900 border-teal-500/20"
                side="top"
                align="end"
                sideOffset={8}
              >
                <DropdownMenuItem
                  onClick={() => navigate('/affiliate/settings')}
                  className="focus:bg-teal-500/10 focus:text-teal-400 cursor-pointer py-3 uppercase text-[13px] font-bold tracking-widest"
                >
                  <AnimatedIcon icon={Settings} className="mr-2 text-teal-400" size={19} />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem
                  onClick={() => { closeIfMobile(); logout(); }}
                  className="text-red-400 focus:bg-red-500/10 cursor-pointer py-3 uppercase text-[13px] font-bold tracking-widest"
                >
                  <AnimatedIcon icon={LogOut} className="mr-2 text-red-400" size={19} />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail className="hover:bg-teal-500/10 transition-colors" />
    </Sidebar>
  );
}

export default function AffiliateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [brand, setBrand] = useState<BrandSettings>({});

  useEffect(() => {
    fetch('/api/affiliate/branding')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) setBrand(data.settings);
      })
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#020617] relative">
        <FlameBackground />
        <div className="text-center relative">
          <Loader2 className="h-14 w-14 animate-spin text-teal-500 mx-auto" />
          <p className="mt-6 text-[13px] font-black text-teal-400 uppercase tracking-[0.3em]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.hasAffiliate) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#020617] relative p-6">
        <FlameBackground />
        <div className="text-center space-y-6 max-w-sm p-10 bg-slate-900/80 backdrop-blur-xl border border-red-500/20 rounded-none relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500/50" />
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-none bg-red-500/5 border border-red-500/20">
            <Lock className="h-10 w-10 text-red-500" aria-hidden="true" />
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Access Denied</h1>
            <p className="text-[15px] text-slate-400 uppercase tracking-widest leading-relaxed">
              An active affiliate account is required to access this area.
            </p>
          </div>
          <Button asChild className="w-full bg-red-500 hover:bg-red-600 transition-all font-black uppercase tracking-widest h-14 rounded-none">
            <a href="/login">Go to Login</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AffiliateSidebar brand={brand} />
      <SidebarInset className="bg-transparent overflow-hidden flex flex-col relative">
        <FlameBackground />
        <header className="relative flex h-16 sm:h-20 shrink-0 items-center gap-2 border-b border-white/5 bg-[#020617]/40 backdrop-blur-md px-4 sm:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-2 shrink-0 z-10 min-w-[2.5rem]">
            <SidebarTrigger className="-ml-1 text-slate-500 hover:text-teal-400 transition-colors" aria-label="Open menu" />
            <Separator orientation="vertical" className="mx-1 sm:mx-2 h-5 bg-white/10" />
            <p className="hidden sm:block text-[14px] text-slate-400 truncate max-w-[140px] lg:max-w-none">
              Hi, <span className="font-bold text-teal-400">{user.name?.split(' ')[0]}</span>
            </p>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
            {brand.companyLogo ? (
              <img src={brand.companyLogo} alt={brand.companyName || 'Brand'} className="h-10 w-auto max-w-[154px] object-contain" />
            ) : (
              <DashboardLogo width={144} />
            )}
          </div>

          <div className="flex flex-1 items-center justify-end shrink-0 z-10 ml-auto">
            <NotificationCenter />
          </div>
        </header>
        <main id="dashboard-main" className="flex-1 overflow-auto p-4 sm:p-8 relative scrollbar-hide">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/[0.03] blur-[150px] rounded-full -z-10 pointer-events-none" />
          <PageTransition routeKey={pathname}>{children}</PageTransition>
          <BackToTop scrollContainerId="dashboard-main" />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
