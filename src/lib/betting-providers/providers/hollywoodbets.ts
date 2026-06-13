import { assignDemoOdds, demoStats } from '../demo-data';
import type { BettingProviderAdapter, ProviderMeta, RaceCard } from '../types';

async function fetchAffiliateStats(): Promise<{ clicks: number; conversions: number } | null> {
  const key = process.env.HOLLYWOODBETS_MYAFFILIATES_API_KEY;
  const base = process.env.HOLLYWOODBETS_MYAFFILIATES_API_URL;
  if (!key || !base) return null;

  try {
    const res = await fetch(`${base.replace(/\/$/, '')}/reports/summary`, {
      headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { clicks?: number; conversions?: number };
    if (typeof data.clicks !== 'number') return null;
    return { clicks: data.clicks, conversions: data.conversions ?? 0 };
  } catch {
    return null;
  }
}

export const hollywoodbetsAdapter: BettingProviderAdapter = {
  id: 'hollywoodbets',

  async getMeta(): Promise<ProviderMeta> {
    const live = !!process.env.HOLLYWOODBETS_MYAFFILIATES_API_KEY;
    return {
      id: 'hollywoodbets',
      name: 'hollywoodbets',
      displayName: 'Hollywoodbets',
      region: 'South Africa',
      mode: live ? 'live' : 'demo',
      apiType: 'affiliate',
      docsUrl: 'https://affiliates.hollywoodbets.net/faqs/',
      status: 'online',
      lastSync: new Date().toISOString(),
      message: live
        ? 'MyAffiliates / Income Access reporting'
        : 'Demo — Hollywoodbets affiliate data via MyAffiliates (Income Access)',
    };
  },

  async getStats() {
    const live = await fetchAffiliateStats();
    const demo = demoStats('hollywoodbets');
    if (!live) return demo;
    return {
      ...demo,
      clicks24h: live.clicks,
      conversions24h: live.conversions,
      conversionRate: live.clicks ? Math.round((live.conversions / live.clicks) * 10000) / 100 : demo.conversionRate,
    };
  },

  async enrichRunners(races: RaceCard[]) {
    return assignDemoOdds(races, 'hollywoodbets', 5);
  },
};
