'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Star, TrendingUp, Loader2, Sparkles, Cpu, Zap, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { AdminPageBrandBar } from '@/components/layout/AdminPageBrandBar';

interface LeaderboardEntry {
  id: string;
  rank: number;
  points: number;
  affiliate: {
    id: string;
    referralCode: string;
    level: number;
    user: {
      name: string;
      email: string;
      profilePicture?: string;
      gender: string;
    };
    badges: {
      badge: {
        name: string;
        icon: string;
      };
    }[];
  };
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const tableRef = useRef<HTMLTableSectionElement>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (!loading && entries.length > 0 && tableRef.current) {
      const rows = tableRef.current.querySelectorAll('tr');
      gsap.fromTo(
        rows,
        { opacity: 0, x: -10, filter: 'blur(10px)' },
        {
          opacity: 1,
          x: 0,
          filter: 'blur(0px)',
          stagger: 0.05,
          duration: 0.8,
          ease: 'expo.out',
        }
      );
    }
  }, [loading, entries]);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/admin/leaderboard');
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', glow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]' };
      case 2: return { color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20', glow: 'shadow-[0_0_20px_rgba(20,184,166,0.3)]' };
      case 3: return { color: 'text-slate-300', bg: 'bg-slate-500/10', border: 'border-slate-500/20', glow: 'shadow-[0_0_20px_rgba(100,116,139,0.3)]' };
      default: return { color: 'text-slate-500', bg: 'bg-transparent', border: 'border-transparent', glow: '' };
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
          <div className="w-[500px] h-[500px] border border-teal-500/20 rounded-full animate-ping" />
        </div>
        <div className="relative text-center">
          <Loader2 className="h-16 w-16 animate-spin text-teal-500 mx-auto" />
          <p className="mt-6 text-[13px] font-black text-teal-400 uppercase tracking-[0.4em]">Decrypting Rank Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <AdminPageBrandBar
        left={
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-[1px] w-12 bg-teal-500/40" />
              <span className="text-[13px] font-black text-teal-500 uppercase tracking-[0.3em]">
                Network.Superiority
              </span>
            </div>
            <h2 className="text-5xl font-black tracking-tighter text-white uppercase italic leading-none">
              Leaderboard
            </h2>
            <p className="text-slate-500 font-mono text-[15px] uppercase tracking-widest">
              Synchronizing <span className="text-teal-400">Top-Tier</span> Operatives
            </p>
          </div>
        }
        right={
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-none">
            <div className="flex flex-col items-end">
              <span className="text-[12px] font-black text-slate-500 uppercase tracking-widest">
                Total XP in Network
              </span>
              <span className="text-xl font-black text-white tabular-nums tracking-tighter">
                {entries.reduce((acc, e) => acc + e.points, 0).toLocaleString()} XP
              </span>
            </div>
            <div className="h-10 w-[1px] bg-white/10 mx-2" />
            <div className="p-2 bg-teal-500/10 border border-teal-500/20">
              <Activity className="w-5 h-5 text-teal-500" />
            </div>
          </div>
        }
      />

      {/* Podium Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-5xl mx-auto pt-10">
        {/* 2nd Place */}
        {entries[1] && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="order-2 md:order-1"
          >
            <div className="relative group flex flex-col items-center">
              <div className="mb-6 relative">
                <Avatar className="h-24 w-24 border-2 border-teal-500/40 rounded-none group-hover:scale-105 transition-transform">
                  <AvatarImage src={entries[1].affiliate.user.profilePicture} />
                  <AvatarFallback className="bg-slate-900 text-teal-500 font-black">2ND</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-slate-900 border border-teal-500/40 text-teal-400 font-black px-2 py-0.5 text-[13px] tracking-widest">
                  RANK.02
                </div>
              </div>
              <div className="w-full h-32 bg-teal-500/5 border border-teal-500/20 relative overflow-hidden flex flex-col items-center justify-center p-6">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-teal-500/20" />
                <p className="text-[15px] font-black text-white uppercase tracking-widest mb-1">{entries[1].affiliate.user.name}</p>
                <p className="text-2xl font-black text-teal-400 tabular-nums italic">XP.{entries[1].points.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 1st Place */}
        {entries[0] && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="order-1 md:order-2"
          >
            <div className="relative group flex flex-col items-center">
              <div className="mb-8 relative">
                <div className="absolute -inset-8 bg-orange-500/10 blur-[40px] rounded-full animate-pulse" />
                <Avatar className="h-32 w-32 border-4 border-orange-500/60 rounded-none relative z-10 group-hover:scale-105 transition-transform shadow-[0_0_30px_rgba(249,115,22,0.2)]">
                  <AvatarImage src={entries[0].affiliate.user.profilePicture} />
                  <AvatarFallback className="bg-slate-900 text-orange-500 font-black text-xl">1ST</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-4 -right-4 bg-orange-500 text-black font-black px-4 py-1 text-[15px] tracking-[0.2em] z-20 shadow-xl">
                  ELITE.01
                </div>
                <Trophy className="absolute -top-6 left-1/2 -translate-x-1/2 w-10 h-10 text-orange-500 z-20 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
              </div>
              <div className="w-full h-48 bg-orange-500/10 border border-orange-500/30 relative overflow-hidden flex flex-col items-center justify-center p-8">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-orange-500" />
                <div className="absolute inset-0 bg-[url('/images/cyber-grid.png')] opacity-10 pointer-events-none" />
                <p className="text-lg font-black text-white uppercase tracking-widest mb-1 italic">{entries[0].affiliate.user.name}</p>
                <p className="text-4xl font-black text-orange-500 tabular-nums italic drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]">XP.{entries[0].points.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 3rd Place */}
        {entries[2] && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="order-3 md:order-3"
          >
            <div className="relative group flex flex-col items-center">
              <div className="mb-6 relative">
                <Avatar className="h-24 w-24 border-2 border-slate-500/40 rounded-none group-hover:scale-105 transition-transform">
                  <AvatarImage src={entries[2].affiliate.user.profilePicture} />
                  <AvatarFallback className="bg-slate-900 text-slate-500 font-black">3RD</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-slate-900 border border-slate-500/40 text-slate-400 font-black px-2 py-0.5 text-[13px] tracking-widest">
                  RANK.03
                </div>
              </div>
              <div className="w-full h-24 bg-slate-500/5 border border-slate-500/20 relative overflow-hidden flex flex-col items-center justify-center p-4">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-slate-500/20" />
                <p className="text-[13px] font-black text-white uppercase tracking-widest mb-1">{entries[2].affiliate.user.name}</p>
                <p className="text-xl font-black text-slate-300 tabular-nums italic">XP.{entries[2].points.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Full Registry Table */}
      <div className="rounded-none border border-white/5 bg-[#020617]/40 backdrop-blur-sm relative mt-20">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />
        
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cpu className="w-4 h-4 text-teal-500" />
            <h3 className="text-[15px] font-black text-white uppercase tracking-[0.3em]">Operative.Rankings</h3>
          </div>
          <div className="text-[13px] font-mono text-slate-600 uppercase tracking-widest flex items-center gap-4">
            <span className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-teal-500" /> Network Stream Active</span>
            <span className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-orange-500" /> Top performer detected</span>
          </div>
        </div>

        <Table>
          <TableHeader className="bg-black/20">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="w-24 text-[13px] font-black uppercase tracking-[0.2em] text-slate-500 py-5 pl-8">Index</TableHead>
              <TableHead className="text-[13px] font-black uppercase tracking-[0.2em] text-slate-500">Operative</TableHead>
              <TableHead className="text-[13px] font-black uppercase tracking-[0.2em] text-slate-500">Tier Level</TableHead>
              <TableHead className="text-[13px] font-black uppercase tracking-[0.2em] text-slate-500">Achievements</TableHead>
              <TableHead className="text-[13px] font-black uppercase tracking-[0.2em] text-slate-500 text-right pr-8">XP.Yield</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody ref={tableRef}>
            {entries.map((entry) => {
              const style = getRankStyle(entry.rank);
              return (
                <TableRow key={entry.id} className="border-white/5 hover:bg-white/[0.02] group transition-all">
                  <TableCell className="py-5 pl-8">
                    <div className="flex items-center gap-4">
                      <span className={`text-xl font-black italic tabular-nums ${style.color}`}>{entry.rank.toString().padStart(2, '0')}</span>
                      {entry.rank <= 3 && <div className={`h-2 w-2 rounded-full ${style.color.replace('text-', 'bg-')} animate-pulse`} />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 border border-white/10 rounded-none group-hover:border-teal-500/40 transition-colors">
                        <AvatarImage src={entry.affiliate.user.profilePicture} />
                        <AvatarFallback className="bg-slate-900 text-slate-500 text-[13px] font-black">{entry.affiliate.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-bold text-white uppercase tracking-tight italic group-hover:text-teal-400 transition-colors">{entry.affiliate.user.name}</p>
                        <p className="text-[12px] font-mono text-slate-500 uppercase tracking-widest">{entry.affiliate.referralCode}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-12 bg-white/5 border border-white/10 flex items-center justify-center">
                        <span className="text-[13px] font-black text-slate-300 uppercase italic">LVL.{entry.affiliate.level}</span>
                      </div>
                      <div className="w-20 h-1 bg-white/5 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(entry.affiliate.level / 10) * 100}%` }}
                          className="h-full bg-teal-500/40"
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {entry.affiliate.badges.slice(0, 3).map((b, i) => (
                        <div key={i} className="h-8 w-8 bg-black/40 border border-white/5 flex items-center justify-center group-hover:border-teal-500/20 transition-colors" title={b.badge.name}>
                          <Zap className="w-4 h-4 text-teal-600 group-hover:text-teal-400" />
                        </div>
                      ))}
                      {entry.affiliate.badges.length > 3 && (
                        <div className="h-8 w-8 bg-white/5 border border-white/10 flex items-center justify-center text-[12px] font-black text-slate-500">
                          +{entry.affiliate.badges.length - 3}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-black text-white tabular-nums italic group-hover:text-teal-400 transition-colors">
                        {entry.points.toLocaleString()}
                      </span>
                      <span className="text-[12px] font-mono text-slate-600 uppercase tracking-widest">XP Yield</span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
