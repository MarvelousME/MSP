'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Search,
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Building2,
  Mail,
  Phone,
  IndianRupee,
  Eye,
  Activity,
  Target,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AdminPageBrandBar } from '@/components/layout/AdminPageBrandBar';

interface Referral {
  id: string;
  leadEmail: string;
  leadName: string;
  leadPhone: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  estimatedValue: number;
  company: string;
  affiliate: {
    id: string;
    name: string;
    email: string;
    referralCode: string;
    partnerGroup: string;
    commissionRate: number;
  };
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'PENDING.AUTH', color: 'orange' },
  APPROVED: { label: 'ACTIVE', color: 'emerald' },
  REJECTED: { label: 'FAILED', color: 'red' },
};

export default function CustomersPage() {
  const router = useRouter();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const res = await fetch('/api/admin/referrals');
      const data = await res.json();
      if (data.success) {
        setReferrals(data.referrals);
      }
    } catch (error) {
      console.error('Failed to fetch referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (referralIds: string[], action: 'approve' | 'reject') => {
    setActionLoading(referralIds[0]);
    try {
      const res = await fetch('/api/admin/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralIds, action }),
      });
      const data = await res.json();
      if (data.success) {
        fetchReferrals();
      }
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = referrals.filter((r) => {
    const matchesSearch =
      r.leadName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.leadEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.company?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: referrals.length,
    pending: referrals.filter((r) => r.status === 'PENDING').length,
    approved: referrals.filter((r) => r.status === 'APPROVED').length,
    value: referrals.reduce((acc, r) => acc + (r.status === 'APPROVED' ? r.estimatedValue : 0), 0),
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-64 bg-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 bg-white/5 rounded-none" />
          ))}
        </div>
        <Skeleton className="h-[500px] bg-white/5 rounded-none" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <AdminPageBrandBar
        left={
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-[1px] w-12 bg-orange-500/40" />
              <span className="text-[13px] font-black text-orange-500 uppercase tracking-[0.3em]">
                Conversion.Stream
              </span>
            </div>
            <h2 className="text-5xl font-black tracking-tighter text-white uppercase italic leading-none">
              Customers
            </h2>
            <p className="text-slate-500 font-mono text-[15px] uppercase tracking-widest">
              Tracking <span className="text-orange-400">{stats.total}</span> total incoming signals
            </p>
          </div>
        }
        right={
          <Button
            variant="outline"
            className="rounded-none border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 font-bold uppercase text-[14px] tracking-widest h-12 px-6"
          >
            Export Lead.Data
          </Button>
        }
      />

      {/* High-Vis Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Inbound', value: stats.total, icon: Activity, className: 'bg-teal-500/5 border-teal-500/20 group-hover:bg-teal-500/10', iconColor: 'text-teal-500' },
          { label: 'Awaiting Auth', value: stats.pending, icon: Clock, className: 'bg-orange-500/5 border-orange-500/20 group-hover:bg-orange-500/10', iconColor: 'text-orange-500' },
          { label: 'Converted', value: stats.approved, icon: UserCheck, className: 'bg-emerald-500/5 border-emerald-500/20 group-hover:bg-emerald-500/10', iconColor: 'text-emerald-500' },
          { label: 'Yield Projection', value: `R${(stats.value / 1).toLocaleString()}`, icon: Zap, className: 'bg-amber-500/5 border-amber-500/20 group-hover:bg-amber-500/10', iconColor: 'text-amber-500' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="cyber-card p-6 group"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[13px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-black text-white tabular-nums tracking-tighter">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-none transition-colors ${stat.className}`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Database Interface */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
          <div className="flex items-center gap-6">
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Lead Registry</h3>
            <div className="h-4 w-[1px] bg-white/10" />
            <div className="flex gap-4">
              {['all', 'PENDING', 'APPROVED', 'REJECTED'].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`text-[13px] font-black uppercase tracking-widest transition-colors ${statusFilter === f ? 'text-orange-500' : 'text-slate-600 hover:text-slate-400'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-600 group-focus-within:text-orange-500 transition-colors" />
              <Input
                placeholder="SEARCH DATABASE..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-72 bg-[#020617]/50 border-white/5 focus:border-orange-500/30 text-[15px] font-mono tracking-widest text-white rounded-none h-11"
              />
            </div>
          </div>
        </div>

        <div className="rounded-none border border-white/5 bg-[#020617]/40 backdrop-blur-sm relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
          
          <Table>
            <TableHeader className="bg-black/20">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-[13px] font-black uppercase tracking-[0.2em] text-slate-500 py-5 pl-8">Inbound.Lead</TableHead>
                <TableHead className="text-[13px] font-black uppercase tracking-[0.2em] text-slate-500">Origin.Unit</TableHead>
                <TableHead className="text-[13px] font-black uppercase tracking-[0.2em] text-slate-500">Source.Partner</TableHead>
                <TableHead className="text-[13px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Est.Yield</TableHead>
                <TableHead className="text-[13px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Status</TableHead>
                <TableHead className="text-[13px] font-black uppercase tracking-[0.2em] text-slate-500 text-right pr-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((referral) => (
                  <TableRow key={referral.id} className="border-white/5 hover:bg-orange-500/[0.02] group transition-all">
                    <TableCell className="py-5 pl-8">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border border-white/10 rounded-none">
                          <AvatarFallback className="bg-slate-900 text-orange-500 text-[13px] font-black rounded-none">
                            {referral.leadName?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors uppercase tracking-tight italic">
                            {referral.leadName}
                          </p>
                          <p className="text-[12px] font-mono text-slate-500 uppercase tracking-widest">
                            {referral.leadEmail}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3 w-3 text-slate-600" />
                        <span className="text-[13px] font-black text-slate-400 uppercase tracking-wider">{referral.company || 'DIRECT'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-slate-300 uppercase tracking-tight">{referral.affiliate.name}</span>
                        <span className="text-[8px] font-mono text-orange-500/60 uppercase tracking-widest">CODE.{referral.affiliate.referralCode}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 font-black text-white italic text-sm tabular-nums">
                        R{referral.estimatedValue.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge status={referral.status} />
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <div className="flex justify-end gap-2">
                        {referral.status === 'PENDING' ? (
                          <>
                            <Button
                              size="sm"
                              className="h-8 rounded-none bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[12px] tracking-widest px-4"
                              onClick={() => handleAction([referral.id], 'approve')}
                              disabled={actionLoading === referral.id}
                            >
                              Authorize
                            </Button>
                            <button
                              className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                              onClick={() => handleAction([referral.id], 'reject')}
                              disabled={actionLoading === referral.id}
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            className="h-8 rounded-none text-slate-500 hover:text-white hover:bg-white/5 font-black uppercase text-[12px] tracking-widest px-4"
                            onClick={() => router.push(`/admin/customers/${referral.id}`)}
                          >
                            View details
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <Target className="w-12 h-12 text-slate-500 animate-pulse" />
                      <p className="text-[13px] font-black uppercase tracking-[0.4em]">Signal Spectrum Clear</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; dotClassName: string; label: string }> = {
    APPROVED: { 
      className: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500', 
      dotClassName: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
      label: 'ACTIVE' 
    },
    PENDING: { 
      className: 'bg-orange-500/10 border-orange-500/20 text-orange-500', 
      dotClassName: 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]',
      label: 'PENDING.AUTH' 
    },
    REJECTED: { 
      className: 'bg-red-500/10 border-red-500/20 text-red-500', 
      dotClassName: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]',
      label: 'FAILED' 
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
