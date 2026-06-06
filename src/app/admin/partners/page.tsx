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
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Search,
  Plus,
  Mail,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  Download,
  Upload,
  Users,
  CheckCircle2,
  XCircle,
  Trash2,
  UserPlus,
  ArrowUpDown,
  Cpu,
  Zap,
  Activity,
  Globe,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminPageBrandBar } from '@/components/layout/AdminPageBrandBar';

interface Partner {
  id: string;
  userId: string;
  name: string;
  email: string;
  referralCode: string;
  status: string;
  createdAt: string;
  clicks: number;
  leads: number;
  customers: number;
  revenue: number;
  earnings: number;
  groupName?: string;
  gender?: string;
  birthDate?: string;
  ethnicity?: string;
  age?: number;
  points?: number;
  level?: number;
}

export default function PartnersPage() {
  const router = useRouter();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [sortField, setSortField] = useState<keyof Partner>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchPartners();
  }, []);

  useEffect(() => {
    filterPartners();
  }, [partners, activeTab, searchQuery, sortField, sortDirection]);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/affiliates');
      const data = await response.json();

      if (data.success) {
        const formattedPartners = data.affiliates.map((aff: any) => ({
          id: aff.id,
          userId: aff.userId,
          name: aff.user.name,
          email: aff.user.email,
          referralCode: aff.referralCode,
          status: aff.user.status,
          createdAt: aff.createdAt,
          clicks: 0,
          leads: aff._count?.referrals || 0,
          customers: aff._count?.referrals || 0,
          revenue: 0,
          earnings: aff.balanceCents || 0,
          groupName: '',
          gender: aff.user.gender,
          birthDate: aff.user.birthDate,
          ethnicity: aff.user.ethnicity,
          age: aff.user.age,
          points: aff.points || 0,
          level: aff.level || 1,
        }));
        setPartners(formattedPartners);
        setCurrencySymbol(data.currencySymbol || '$');
      }
    } catch (error) {
      console.error('Failed to fetch partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPartners = () => {
    let filtered = partners;

    if (activeTab === 'active') {
      filtered = filtered.filter((p: Partner) => p.status === 'ACTIVE');
    } else if (activeTab === 'pending') {
      filtered = filtered.filter((p: Partner) => p.status === 'PENDING');
    } else if (activeTab === 'invited') {
      filtered = filtered.filter((p: Partner) => p.status === 'INVITED');
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (p: Partner) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.referralCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered.sort((a: Partner, b: Partner) => {
      const aValue = (a as any)[sortField];
      const bValue = (b as any)[sortField];
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });

    setFilteredPartners(filtered);
  };

  const handleSort = (field: keyof Partner) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: keyof Partner }) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-30" />;
    return sortDirection === 'asc' ? <ChevronUp className="ml-1 h-3 w-3 text-teal-400" /> : <ChevronDown className="ml-1 h-3 w-3 text-teal-400" />;
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48 bg-white/5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full bg-white/5 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full bg-white/5 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <AdminPageBrandBar
        left={
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-[1px] w-12 bg-teal-500/40" />
              <span className="text-[13px] font-black text-teal-500 uppercase tracking-[0.3em]">
                Partner Directory
              </span>
            </div>
            <h2 className="text-5xl font-black tracking-tighter text-white uppercase italic leading-none">
              Operatives
            </h2>
            <p className="text-slate-500 font-mono text-[15px] uppercase tracking-widest">
              Managing <span className="text-teal-400">{partners.length}</span> active partners
            </p>
          </div>
        }
        right={
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              className="rounded-none border-teal-500/20 bg-teal-500/5 hover:bg-teal-500/10 text-teal-400 font-bold uppercase text-[14px] tracking-widest h-12 px-6 transition-all"
              onClick={() => setShowInviteModal(true)}
            >
              <Mail className="mr-2 h-4 w-4" />
              Dispatch Invite
            </Button>
            <Button
              className="rounded-none bg-orange-600 hover:bg-orange-500 text-white font-black uppercase text-[14px] tracking-widest h-12 px-8 shadow-lg shadow-orange-600/20 transition-all"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Initialize Operative
            </Button>
          </div>
        }
      />

      {/* Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Network', value: partners.length, icon: Globe, className: 'bg-teal-500/5 border-teal-500/20 group-hover:bg-teal-500/10', iconColor: 'text-teal-500' },
          { label: 'Active Signals', value: partners.filter(p => p.status === 'ACTIVE').length, icon: Activity, className: 'bg-emerald-500/5 border-emerald-500/20 group-hover:bg-emerald-500/10', iconColor: 'text-emerald-500' },
          { label: 'Pending Auth', value: partners.filter(p => p.status === 'PENDING').length, icon: Cpu, className: 'bg-orange-500/5 border-orange-500/20 group-hover:bg-orange-500/10', iconColor: 'text-orange-500' },
          { label: 'Total Conversion', value: `${currencySymbol}${(partners.reduce((acc, p) => acc + p.revenue, 0) / 100).toFixed(0)}`, icon: Zap, className: 'bg-amber-500/5 border-amber-500/20 group-hover:bg-amber-500/10', iconColor: 'text-amber-500' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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

      {/* Main Database Interface */}
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
            <TabsList className="bg-transparent h-auto p-0 gap-8">
              {['active', 'pending', 'invited'].map((tab) => (
                <TabsTrigger 
                  key={tab}
                  value={tab} 
                  className="bg-transparent border-none p-0 text-slate-500 data-[state=active]:text-teal-400 font-black uppercase text-[14px] tracking-[0.2em] relative h-10"
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="tab-active" 
                      className="absolute -bottom-6 left-0 right-0 h-[2px] bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.8)]" 
                    />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-600 group-focus-within:text-teal-500 transition-colors" />
                </div>
                <Input
                  placeholder="FILTER DATABASE..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-72 bg-[#020617]/50 border-white/5 focus:border-teal-500/30 text-[15px] font-mono tracking-widest text-white rounded-none h-11"
                />
              </div>
              <Button variant="outline" size="icon" className="h-11 w-11 rounded-none border-white/5 hover:bg-white/5 text-slate-500">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-8 rounded-none border border-white/5 bg-[#020617]/40 backdrop-blur-sm relative">
            {/* Technical Scanline Accent */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />
            
            <Table>
              <TableHeader className="bg-black/20">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="w-12 py-5 pl-6">
                    <Checkbox className="border-white/20 data-[state=checked]:bg-teal-500 rounded-none" />
                  </TableHead>
                  <TableHead className="cursor-pointer text-[13px] font-black uppercase tracking-[0.2em] text-slate-500" onClick={() => handleSort('name')}>
                    <div className="flex items-center">Operative <SortIcon field="name" /></div>
                  </TableHead>
                  <TableHead className="text-[13px] font-black uppercase tracking-[0.2em] text-slate-500">Access.ID</TableHead>
                  <TableHead className="text-[13px] font-black uppercase tracking-[0.2em] text-slate-500">Identity.Stats</TableHead>
                  <TableHead className="cursor-pointer text-[13px] font-black uppercase tracking-[0.2em] text-slate-500 text-center" onClick={() => handleSort('leads')}>
                    <div className="flex items-center justify-center">Leads <SortIcon field="leads" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer text-[13px] font-black uppercase tracking-[0.2em] text-slate-500 text-center" onClick={() => handleSort('customers')}>
                    <div className="flex items-center justify-center">Signals <SortIcon field="customers" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer text-[13px] font-black uppercase tracking-[0.2em] text-slate-500 text-right" onClick={() => handleSort('revenue')}>
                    <div className="flex items-center justify-end">Volume <SortIcon field="revenue" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer text-[13px] font-black uppercase tracking-[0.2em] text-slate-500 text-right" onClick={() => handleSort('points')}>
                    <div className="flex items-center justify-end">Reputation <SortIcon field="points" /></div>
                  </TableHead>
                  <TableHead className="text-[13px] font-black uppercase tracking-[0.2em] text-slate-500 text-right pr-6">Yield</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPartners.length > 0 ? (
                  filteredPartners.map((partner, idx) => (
                    <TableRow 
                      key={partner.id} 
                      className="border-white/5 hover:bg-teal-500/[0.02] group transition-all"
                    >
                      <TableCell className="py-5 pl-6">
                        <Checkbox className="border-white/10 data-[state=checked]:bg-teal-500 rounded-none" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 border border-white/10 rounded-none">
                            <AvatarFallback className="bg-slate-900 text-teal-500 text-[13px] font-black rounded-none">
                              {partner.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <p className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors uppercase tracking-tight italic">
                              {partner.name}
                            </p>
                            <p className="text-[12px] font-mono text-slate-500 uppercase tracking-widest">
                              {partner.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-[13px] font-mono text-orange-500 bg-orange-500/5 px-2 py-1 border border-orange-500/10">
                          {partner.referralCode}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <p className="text-[13px] font-bold text-white uppercase tracking-tighter">
                            {partner.ethnicity || 'N/A'}
                          </p>
                          <p className="text-[12px] font-mono text-teal-500 uppercase tracking-widest">
                            AGE.{partner.age || '??'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-mono text-slate-300 text-[15px] tracking-tighter">
                        {partner.leads.toString().padStart(4, '0')}
                      </TableCell>
                      <TableCell className="text-center font-mono text-slate-300 text-[15px] tracking-tighter">
                        {partner.customers.toString().padStart(4, '0')}
                      </TableCell>
                      <TableCell className="text-right font-black text-white tabular-nums text-sm italic">
                        {currencySymbol}{(partner.revenue / 100).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[15px] font-black text-teal-400 tabular-nums">
                            XP.{partner.points?.toLocaleString()}
                          </span>
                          <span className="text-[8px] font-mono text-slate-600 uppercase border border-white/5 px-1 bg-white/5">LVL.{partner.level}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-black text-emerald-500 tabular-nums text-sm italic pr-6">
                        {currencySymbol}{(partner.earnings / 100).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="py-32 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-30">
                        <Cpu className="w-12 h-12 text-slate-500 animate-pulse" />
                        <p className="text-[13px] font-black uppercase tracking-[0.4em]">No partners yet</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Tabs>
      </div>

      {/* Modals Refactored to Cyber Style */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-xl bg-slate-900 border border-teal-500/20 rounded-none p-0 overflow-hidden text-white shadow-[0_0_80px_rgba(20,184,166,0.1)]">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-teal-500 via-orange-500 to-teal-500" />
          <div className="p-8 space-y-8">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter leading-none">Initialize <span className="text-teal-400">Operative</span></DialogTitle>
              <DialogDescription className="text-slate-500 font-mono text-[13px] uppercase tracking-widest">Create a new partner account in the program.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[12px] font-black uppercase text-teal-500/70 tracking-widest ml-1">Identity.First</Label>
                  <Input className="bg-white/5 border-white/10 rounded-none focus:border-teal-500/40 text-[15px] h-12" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] font-black uppercase text-teal-500/70 tracking-widest ml-1">Identity.Last</Label>
                  <Input className="bg-white/5 border-white/10 rounded-none focus:border-teal-500/40 text-[15px] h-12" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-black uppercase text-teal-500/70 tracking-widest ml-1">Signal.Address</Label>
                <Input className="bg-white/5 border-white/10 rounded-none focus:border-teal-500/40 text-[15px] h-12" placeholder="partner@example.com" />
              </div>
            </div>
            <DialogFooter className="pt-6 border-t border-white/5 flex gap-3">
              <Button variant="ghost" className="text-slate-500 uppercase text-[13px] font-black tracking-widest h-12" onClick={() => setShowCreateModal(false)}>Cancel.Abort</Button>
              <Button className="bg-teal-600 hover:bg-teal-500 text-white font-black uppercase text-[13px] tracking-widest h-12 flex-1 rounded-none shadow-lg shadow-teal-600/20">Commit Initialization</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
