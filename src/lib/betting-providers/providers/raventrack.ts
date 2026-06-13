import { demoStats } from '../demo-data';
import type { BettingProviderAdapter, ProviderMeta, RaceCard } from '../types';

async function fetchRavenTrackStats(): Promise<{ clicks: number; registrations: number } | null> {
  const key = process.env.RAVENTRACK_API_KEY;
  const base = process.env.RAVENTRACK_API_URL ?? 'https://network-api.raventrack.com';
  if (!key) return null;

  try {
    const res = await fetch(`${base.replace(/\/$/, '')}/api/v1/reports/summary`, {
      headers: {
        'X-API-Key': key,
        Accept: 'application/json',
      },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { clicks?: number; registrations?: number };
    if (typeof data.clicks !== 'number') return null;
    return { clicks: data.clicks, registrations: data.registrations ?? 0 };
  } catch {
    return null;
  }
}

/** RavenTrack — affiliate network tracking (network-apidocs.raventrack.com). */
export const raventrackAdapter: BettingProviderAdapter = {
  id: 'raventrack',

  async getMeta(): Promise<ProviderMeta> {
    const live = !!process.env.RAVENTRACK_API_KEY;
    return {
      id: 'raventrack',
      name: 'raventrack',
      displayName: 'RavenTrack',
      region: 'Global iGaming',
      mode: live ? 'live' : 'demo',
      apiType: 'affiliate',
      docsUrl: 'https://network-apidocs.raventrack.com/',
      status: 'online',
      lastSync: new Date().toISOString(),
      message: live
        ? 'Two-way affiliate API connected'
        : 'Demo — RavenTrack affiliate reporting API (set RAVENTRACK_API_KEY)',
    };
  },

  async getStats() {
    const live = await fetchRavenTrackStats();
    const demo = demoStats('raventrack');
    if (!live) return demo;
    return {
      ...demo,
      clicks24h: live.clicks,
      conversions24h: live.registrations,
      conversionRate: live.clicks ? Math.round((live.registrations / live.clicks) * 10000) / 100 : demo.conversionRate,
    };
  },

  async enrichRunners(races: RaceCard[]) {
    return races;
  },
};
