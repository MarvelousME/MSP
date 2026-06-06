'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AdminPageBrandBar } from '@/components/layout/AdminPageBrandBar';
import {
  TrendingUp,
  Users,
  UserCheck,
  Wallet,
  Clock,
  Activity,
  Target,
  ArrowRight,
  ArrowUpRight,
  IndianRupee,
  CreditCard,
  BarChart3,
  Eye,
  Cpu,
  Zap,
  Globe,
} from 'lucide-react';

interface DashboardStats {
  totalRevenue: number;
  totalEstimatedRevenue: number;
  totalEstimatedCommission: number;
  totalClicks: number;
  totalLeads: number;
  totalReferredCustomers: number;
  totalAffiliates: number;
  pendingReferrals: number;
}

interface TopAffiliate {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  totalRevenue: number;
  totalReferrals: number;
}

interface RecentCustomer {
  id: string;
  leadName: string;
  leadEmail: string;
  affiliateName: string;
  amountPaid: number;
  status: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topAffiliates, setTopAffiliates] = useState<TopAffiliate[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<RecentCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, analyticsRes, referralsRes] = await Promise.all([
        fetch('/api/admin/dashboard', { credentials: 'include' }),
        fetch('/api/admin/analytics?days=30', { credentials: 'include' }),
        fetch('/api/admin/referrals', { credentials: 'include' }),
      ]);

      const [statsData, analyticsData, referralsData] = await Promise.all([
        statsRes.json(),
        analyticsRes.json(),
        referralsRes.json(),
      ]);

      if (statsData.success) {
        setStats({
          totalRevenue: statsData.stats.totalRevenue || 0,
          totalEstimatedRevenue: statsData.stats.totalEstimatedRevenue || 0,
          totalEstimatedCommission: statsData.stats.totalEstimatedCommission || 0,
          totalClicks: 0,
          totalLeads: statsData.stats.totalReferrals || 0,
          totalReferredCustomers: statsData.stats.approvedReferrals || 0,
          totalAffiliates: statsData.stats.totalAffiliates || 0,
          pendingReferrals: statsData.stats.pendingReferrals || 0,
        });
      }

      if (analyticsData.success && analyticsData.analytics.topAffiliates) {
        setTopAffiliates(analyticsData.analytics.topAffiliates.slice(0, 5));
      }

      if (referralsData.success) {
        const recent = referralsData.referrals.slice(0, 10).map((ref: any) => ({
          id: ref.id,
          leadName: ref.leadName,
          leadEmail: ref.leadEmail,
          affiliateName: ref.affiliate.name,
          amountPaid: 0,
          status: ref.status,
          createdAt: ref.createdAt,
        }));
        setRecentCustomers(recent);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const statCards = [
    {
      title: 'Estimated Revenue',
      value: `R${stats ? (stats.totalEstimatedRevenue / 1).toLocaleString() : '0'}`,
      icon: IndianRupee,
      description: 'Projected Portfolio Value',
      trend: '+12.4%',
      trendUp: true,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
    {
      title: 'Confirmed Yield',
      value: `R${stats ? (stats.totalRevenue / 1).toLocaleString() : '0'}`,
      icon: TrendingUp,
      description: 'Approved Conversions',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Commission.Sync',
      value: `R${stats ? (stats.totalEstimatedCommission / 1).toLocaleString() : '0'}`,
      icon: Wallet,
      description: 'Total Owed to Network',
      color: 'text-teal-400',
      bg: 'bg-teal-500/10',
    },
    {
      title: 'Active Partners',
      value: stats?.totalAffiliates || 0,
      icon: Globe,
      description: 'Total Network Capacity',
      trend: '+2.1%',
      trendUp: true,
      color: 'text-white',
      bg: 'bg-white/10',
    },
  ];

  const conversionRate = stats && stats.totalLeads > 0
    ? ((stats.totalReferredCustomers / stats.totalLeads) * 100).toFixed(1)
    : '0.0';

  const quickActions = [
    {
      title: 'Manage.Partners',
      description: 'Network Operations',
      icon: Users,
      href: '/admin/partners',
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
    {
      title: 'Signal.Stream',
      description: 'Lead Verification',
      icon: Activity,
      href: '/admin/customers',
      color: 'text-teal-400',
      bg: 'bg-teal-500/10',
    },
    {
      title: 'Payout.Engine',
      description: 'Asset Distribution',
      icon: CreditCard,
      href: '/admin/payouts',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Global.Reports',
      description: 'System Analytics',
      icon: BarChart3,
      href: '/admin/reports',
      color: 'text-white',
      bg: 'bg-white/10',
    },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-12 pb-20">
        {/* Page Header — brand centered inline with Control Panel */}
        <AdminPageBrandBar
          left={
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-[1px] w-12 bg-teal-500/40" />
                <span className="text-[13px] font-black text-teal-500 uppercase tracking-[0.3em]">
                  Command.Center
                </span>
              </div>
              <h2 className="text-5xl font-black tracking-tighter text-white uppercase italic leading-none">
                Control <span className="text-teal-500">Panel</span>
              </h2>
              <p className="text-slate-500 font-mono text-[15px] uppercase tracking-widest">
                Engine status: <span className="text-emerald-400 animate-pulse">OPTIMIZED</span>
              </p>
            </div>
          }
          right={
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-none">
              <div className="flex flex-col items-end">
                <span className="text-[12px] font-black text-slate-500 uppercase tracking-widest">
                  System Time
                </span>
                <span className="text-xl font-black text-white tabular-nums tracking-tighter uppercase italic">
                  {new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
              <div className="h-10 w-[1px] bg-white/10 mx-2" />
              <div className="p-2 bg-orange-500/10 border border-orange-500/20">
                <Cpu className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          }
        />

        {/* High-Vis Stat Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="cyber-card p-6 group relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-2 opacity-5">
                  <stat.icon className="h-20 w-20" />
                </div>
                
                <div className="flex items-center justify-between mb-6">
                  <p className="text-[13px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.title}</p>
                  <div className={`p-2.5 rounded-none ${stat.bg} border border-white/5 group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                
                <div className="flex flex-col gap-1 relative z-10">
                  <span className="text-3xl font-black tracking-tight text-white tabular-nums italic">{stat.value}</span>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[12px] font-mono text-slate-600 uppercase tracking-widest">{stat.description}</span>
                    {stat.trend && (
                      <div className="flex items-center gap-1 text-[12px] font-black text-emerald-400 bg-emerald-500/5 px-2 py-0.5 border border-emerald-500/10">
                        <ArrowUpRight className="h-3 w-3" />
                        {stat.trend}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Real-time Monitor Row */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="cyber-card p-8">
            <div className="flex items-center gap-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-none bg-orange-500/5 border border-orange-500/20">
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-black text-slate-500 uppercase tracking-widest">Pending Verification</p>
                <p className="text-4xl font-black text-white tabular-nums tracking-tighter italic">{stats?.pendingReferrals || 0}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 border border-white/10 hover:bg-orange-500/10 text-slate-500 hover:text-orange-500 rounded-none transition-all"
                onClick={() => router.push('/admin/customers')}
              >
                <Eye className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-6 pt-6 border-t border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[13px] font-black text-slate-600 uppercase">Queue.Priority</span>
                <span className="text-[13px] font-black text-orange-500 uppercase">CRITICAL</span>
              </div>
              <div className="h-1 w-full bg-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-2/3 bg-orange-500/40 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="cyber-card p-8">
            <div className="flex items-center gap-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-none bg-teal-500/5 border border-teal-500/20">
                <Activity className="h-6 w-6 text-teal-500" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-black text-slate-500 uppercase tracking-widest">Total Output</p>
                <p className="text-4xl font-black text-white tabular-nums tracking-tighter italic">{stats?.totalLeads || 0}</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[12px] font-black text-slate-600 uppercase">System Sync</span>
                <span className="text-[13px] font-black text-teal-400">100% ONLINE</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-1 w-3 bg-teal-500/40 rounded-none" />
                ))}
              </div>
            </div>
          </div>

          <div className="cyber-card p-8 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-5">
              <Target className="w-24 h-24 text-emerald-500" />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-none bg-emerald-500/5 border border-emerald-500/20">
                <Target className="h-6 w-6 text-emerald-500" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-black text-slate-500 uppercase tracking-widest">Conversion Efficiency</p>
                <p className="text-4xl font-black text-white tabular-nums tracking-tighter italic">{conversionRate}%</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[13px] font-black text-slate-600 uppercase italic">Signal Lock</span>
                <span className="text-[13px] font-black text-emerald-400 tabular-nums">{conversionRate}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-none relative overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${conversionRate}%` }}
                  className="absolute top-0 left-0 h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(action.href)}
              className="group cursor-pointer bg-[#020617]/60 border border-white/5 p-5 hover:border-teal-500/30 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-transparent to-white/[0.02] -z-10" />
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-none ${action.bg} border border-white/5 transition-all group-hover:bg-opacity-20`}>
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-black text-white uppercase tracking-widest leading-none mb-1 italic">{action.title}</p>
                  <p className="text-[12px] text-slate-500 font-mono uppercase tracking-tighter">{action.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-600 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-teal-400" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* High-Density Data Row */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Top Partners */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] italic">Elite.Operatives</h3>
              </div>
              <button 
                className="text-[13px] font-black uppercase text-slate-500 hover:text-orange-500 transition-colors tracking-widest"
                onClick={() => router.push('/admin/partners')}
              >
                Access Full Registry
              </button>
            </div>
            
            <div className="space-y-3">
              {topAffiliates.length > 0 ? (
                topAffiliates.map((affiliate: any, index: number) => (
                  <div
                    key={affiliate.id}
                    onClick={() => router.push(`/admin/partners/${affiliate.id}`)}
                    className="flex items-center gap-4 p-4 bg-[#020617]/40 border border-white/5 hover:border-orange-500/20 transition-all cursor-pointer group"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-black/60 border border-white/5 text-[13px] font-black text-slate-600 group-hover:text-orange-500 group-hover:border-orange-500/30 transition-all italic">
                      #{index + 1}
                    </div>
                    <Avatar className="h-10 w-10 border border-white/10 rounded-none group-hover:scale-105 transition-transform">
                      <AvatarFallback className="bg-slate-900 text-slate-400 text-[13px] font-black">
                        {affiliate.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-200 group-hover:text-white uppercase italic">{affiliate.name}</p>
                      <p className="text-[12px] text-orange-500/60 font-mono tracking-tighter uppercase">ID.{affiliate.referralCode}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-white tabular-nums italic">R{(affiliate.totalRevenue / 1).toLocaleString()}</p>
                      <p className="text-[12px] text-slate-600 font-black uppercase tracking-tighter">{affiliate.totalReferrals} UNITS</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center opacity-20">
                  <Globe className="w-10 h-10 mx-auto mb-4" />
                  <p className="text-[13px] font-black uppercase tracking-widest">No partners online</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Customers */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] italic">Signal.Feed</h3>
              </div>
              <button 
                className="text-[13px] font-black uppercase text-slate-500 hover:text-teal-400 transition-colors tracking-widest"
                onClick={() => router.push('/admin/customers')}
              >
                Full Archive
              </button>
            </div>

            <div className="space-y-3">
              {recentCustomers.length > 0 ? (
                recentCustomers.slice(0, 5).map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center gap-4 p-4 bg-[#020617]/40 border border-white/5 hover:border-teal-500/20 transition-all group"
                  >
                    <div className="text-[12px] font-black text-slate-600 w-12 shrink-0 text-center uppercase tracking-tighter leading-none border-r border-white/5 pr-4">
                      {new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short' })}
                      <br />
                      <span className="text-sm text-slate-300 tabular-nums">{new Date(customer.createdAt).getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-200 truncate group-hover:text-teal-400 transition-colors uppercase italic">{customer.leadEmail}</p>
                      <p className="text-[12px] text-slate-600 font-mono uppercase tracking-widest italic">Partner: {customer.affiliateName}</p>
                    </div>
                    <StatusBadge status={customer.status} />
                  </div>
                ))
              ) : (
                <div className="py-20 text-center opacity-20">
                  <Activity className="w-10 h-10 mx-auto mb-4" />
                  <p className="text-[13px] font-black uppercase tracking-widest">Signal Stream Silent</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; dotClassName: string; label: string }> = {
    APPROVED: { 
      className: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500', 
      dotClassName: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
      label: 'SYNCED' 
    },
    PENDING: { 
      className: 'bg-orange-500/10 border-orange-500/20 text-orange-500', 
      dotClassName: 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]',
      label: 'QUEUED' 
    },
    REJECTED: { 
      className: 'bg-red-500/10 border-red-500/20 text-red-500', 
      dotClassName: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]',
      label: 'VOID' 
    },
  };
  const { className, dotClassName, label } = config[status as keyof typeof config] || { 
    className: 'bg-slate-500/10 border-white/10 text-slate-500', 
    dotClassName: 'bg-slate-500',
    label: status 
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 border ${className}`}>
      <div className={`h-1.5 w-1.5 rounded-full ${dotClassName}`} />
      <span className="text-[12px] font-black uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <Skeleton className="h-16 w-64 bg-white/5" />
        <Skeleton className="h-16 w-48 bg-white/5" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 bg-white/5 rounded-none" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 bg-white/5 rounded-none" />
        ))}
      </div>
    </div>
  );
}
