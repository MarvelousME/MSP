'use client';

import React from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Wallet,
  Mail,
  Settings,
  Sliders,
  BarChart3,
  LogOut,
  ChevronsUpDown,
  KeyRound,
  Activity,
  Ticket,
  FolderOpen,
  Layers,
  Loader2,
  Trophy,
  FileText,
  Cpu,
  UsersRound,
} from 'lucide-react';
import { FlameBackground } from '@/components/animations/FlameBackground';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';
import { PageTransition } from '@/components/layout/PageTransition';
import { BackToTop } from '@/components/layout/BackToTop';
import { NotificationCenter } from '@/components/layout/NotificationCenter';

const mainNavItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Partners', url: '/admin/partners', icon: Users },
  { title: 'Customers', url: '/admin/customers', icon: UserCheck },
  { title: 'Payouts', url: '/admin/payouts', icon: Wallet },
  { title: 'Invoices', url: '/admin/invoices', icon: FileText },
  { title: 'Emails', url: '/admin/emails', icon: Mail },
  { title: 'Leaderboard', url: '/admin/leaderboard', icon: Trophy },
];

const marketingNavItems = [
  { title: 'Coupons', url: '/admin/coupons', icon: Ticket },
  { title: 'Resources', url: '/admin/resources', icon: FolderOpen },
  { title: 'Programs', url: '/admin/programs', icon: Layers, badge: 'NEW' },
];

const configNavItems = [
  { title: 'Program Settings', url: '/admin/program-settings', icon: Sliders },
  { title: 'Team Members', url: '/admin/team', icon: UsersRound },
  { title: 'Settings', url: '/admin/settings', icon: Settings },
  { title: 'Reports', url: '/admin/reports', icon: BarChart3 },
  { title: 'API Keys', url: '/admin/api-keys', icon: KeyRound },
  { title: 'API Analytics', url: '/admin/api-analytics', icon: Activity },
];

function AdminSidebar() {
  const pathname = usePathname();
  const { navigate, closeIfMobile } = useDashboardNav();
  const { user, logout } = useAuth();

  const isActive = (url: string) => {
    if (url === '/admin') return pathname === '/admin';
    return pathname.startsWith(url);
  };

  return (
    <Sidebar variant="inset" className="border-r border-white/5 bg-[#020617]/80 backdrop-blur-2xl">
      <SidebarHeader className="border-b border-white/5">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="px-4 py-5">
              <p className="text-[13px] font-black uppercase tracking-[0.25em] text-teal-500/70">MSP Admin</p>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="scrollbar-hide py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 text-[13px] font-black uppercase tracking-[0.2em] text-teal-500/50">Core.Interface</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-3">
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={isActive(item.url)}
                    onClick={() => navigate(item.url)}
                    tooltip={item.title}
                    className={`relative group transition-all duration-300 h-11 rounded-md border border-transparent ${isActive(item.url) ? 'bg-teal-500/10 border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.1)]' : 'hover:bg-white/5'}`}
                  >
                    <div className="relative flex items-center gap-3 w-full">
                      <AnimatedIcon icon={item.icon} className={isActive(item.url) ? 'text-teal-400' : 'text-slate-500 group-hover:text-teal-400'} />
                      <span className={`text-sm tracking-tight ${isActive(item.url) ? 'font-bold text-teal-400' : 'text-slate-400 group-hover:text-slate-200'}`}>{item.title}</span>
                      {isActive(item.url) && (
                        <motion.div
                          layoutId="active-indicator"
                          className="absolute -left-3 w-1 h-5 bg-teal-500 rounded-r-full"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="px-6 text-[13px] font-black uppercase tracking-[0.2em] text-slate-600">Marketing.Sync</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-3">
              {marketingNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={isActive(item.url)}
                    onClick={() => navigate(item.url)}
                    tooltip={item.title}
                    className={`h-11 rounded-md transition-all ${isActive(item.url) ? 'bg-orange-500/10 border border-orange-500/20' : 'hover:bg-white/5'}`}
                  >
                    <AnimatedIcon icon={item.icon} className={isActive(item.url) ? 'text-orange-500' : 'text-slate-500 group-hover:text-orange-400'} />
                    <span className={`text-sm ${isActive(item.url) ? 'font-bold text-orange-500' : 'text-slate-400 group-hover:text-slate-200'}`}>{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto rounded-none bg-orange-500 text-[12px] font-black px-1.5 py-0.5 text-black">
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
          <SidebarGroupLabel className="px-6 text-[13px] font-black uppercase tracking-[0.2em] text-slate-600">System.Config</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-3">
              {configNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={isActive(item.url)}
                    onClick={() => navigate(item.url)}
                    tooltip={item.title}
                    className={`h-11 rounded-md transition-all ${isActive(item.url) ? 'bg-slate-800 border border-white/10' : 'hover:bg-white/5'}`}
                  >
                    <AnimatedIcon icon={item.icon} className={isActive(item.url) ? 'text-slate-200' : 'text-slate-500 group-hover:text-slate-300'} />
                    <span className={`text-sm ${isActive(item.url) ? 'font-bold text-slate-100' : 'text-slate-500 group-hover:text-slate-300'}`}>{item.title}</span>
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
                  className="data-[state=open]:bg-white/5 transition-all rounded-lg border border-transparent hover:border-white/10"
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12 rounded-lg border border-white/20">
                      <AvatarImage src={user?.profilePicture} alt={user?.name} />
                      <AvatarFallback className="rounded-lg bg-teal-600 text-white text-lg font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-teal-500 border-2 border-slate-900 rounded-full" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight ml-3">
                    <span className="truncate font-bold text-slate-200 uppercase text-[14px] tracking-wider">{user?.name}</span>
                    <span className="truncate text-[13px] font-mono text-slate-500 uppercase">{user?.role || 'Operative'}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto h-4 w-4 text-slate-500" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-none bg-slate-900 border-teal-500/20 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
                side="top"
                align="end"
                sideOffset={8}
              >
                <DropdownMenuItem onClick={() => navigate('/admin/settings')} className="focus:bg-teal-500/10 focus:text-teal-400 cursor-pointer py-3 uppercase text-[13px] font-bold tracking-widest">
                  <AnimatedIcon icon={Cpu} className="mr-2 text-teal-400" size={19} />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem onClick={() => { closeIfMobile(); logout(); }} className="text-red-400 focus:bg-red-500/10 cursor-pointer py-3 uppercase text-[13px] font-bold tracking-widest">
                  <AnimatedIcon icon={LogOut} className="mr-2 text-red-400" size={19} />
                  Sign out
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#020617] relative">
        <FlameBackground />
        <div className="text-center relative">
          <div className="absolute -inset-20 bg-teal-500/10 blur-[100px] rounded-full animate-pulse" />
          <div className="relative">
            <Loader2 className="h-14 w-14 animate-spin text-teal-500 mx-auto" />
            <p className="mt-6 text-[13px] font-black text-teal-400 uppercase tracking-[0.3em]">Calibrating Interface...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex h-screen items-center justify-center bg-[#020617] relative p-6">
        <FlameBackground />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8 max-w-sm p-10 bg-slate-900/80 backdrop-blur-xl border border-red-500/20 rounded-none relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500/50" />
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-none bg-red-500/5 border border-red-500/20">
            <LogOut className="h-10 w-10 text-red-500" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Access <br/> Restricted</h1>
            <p className="text-[15px] text-slate-400 uppercase tracking-widest leading-relaxed">Administrator access is required to open this area.</p>
          </div>
          <Button asChild className="w-full bg-red-500 hover:bg-red-600 transition-all font-black uppercase tracking-widest h-14 rounded-none">
            <a href="/login">Re-Authenticate</a>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="bg-transparent overflow-hidden flex flex-col relative">
        <FlameBackground />
        
        <header className="relative flex h-14 sm:h-16 shrink-0 items-center justify-between gap-2 border-b border-white/5 bg-[#020617]/40 backdrop-blur-md px-4 sm:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <SidebarTrigger className="-ml-1 text-slate-500 hover:text-teal-400 transition-colors" />
            <Separator orientation="vertical" className="mx-1 sm:mx-2 h-5 bg-white/10 hidden sm:block" />
            <div className="hidden lg:flex items-center gap-2 min-w-0">
              <div className="h-2 w-2 shrink-0 rounded-full bg-teal-500 animate-pulse shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
              <p className="text-[13px] font-black text-slate-300 uppercase tracking-[0.15em] truncate">
                <span className="text-teal-400">ADMIN</span>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 sm:gap-6 min-w-0">
            <div className="hidden md:flex flex-col items-end">
              <p className="text-[13px] font-mono text-slate-500 uppercase tracking-widest">Last sync</p>
              <p className="text-[15px] font-bold text-slate-300 uppercase italic">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
              </p>
            </div>
            <NotificationCenter />
          </div>
        </header>

        <main id="dashboard-main" className="flex-1 overflow-auto p-4 sm:p-8 relative scrollbar-hide">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-500/[0.03] blur-[150px] rounded-full -z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-500/[0.02] blur-[120px] rounded-full -z-10 pointer-events-none" />

          <PageTransition routeKey={pathname}>{children}</PageTransition>
          <BackToTop scrollContainerId="dashboard-main" />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
