import { buildDemoRaces } from './demo-data';
import { betxchangeAdapter } from './providers/betxchange';
import { hollywoodbetsAdapter } from './providers/hollywoodbets';
import { playabetsAdapter } from './providers/playabets';
import { racevoltAdapter } from './providers/racevolt';
import { raventrackAdapter } from './providers/raventrack';
import { tenbetAdapter } from './providers/tenbet';
import type { AggregatedDashboard, BettingProviderAdapter, ProviderId, RaceCard } from './types';

export const ALL_ADAPTERS: BettingProviderAdapter[] = [
  racevoltAdapter,
  tenbetAdapter,
  playabetsAdapter,
  betxchangeAdapter,
  hollywoodbetsAdapter,
  raventrackAdapter,
];

export const ADAPTER_MAP = Object.fromEntries(
  ALL_ADAPTERS.map((a) => [a.id, a])
) as Record<ProviderId, BettingProviderAdapter>;

export async function getAggregatedDashboard(): Promise<AggregatedDashboard> {
  const baseRaces = buildDemoRaces();
  let races: RaceCard[] = baseRaces;

  for (const adapter of ALL_ADAPTERS) {
    if (adapter.id === 'raventrack') continue;
    races = await adapter.enrichRunners(races);
  }

  const [providers, operatorStats] = await Promise.all([
    Promise.all(ALL_ADAPTERS.map((a) => a.getMeta())),
    Promise.all(ALL_ADAPTERS.map((a) => a.getStats())),
  ]);

  const clicks24h = operatorStats.reduce((s, o) => s + o.clicks24h, 0);
  const conversions24h = operatorStats.reduce((s, o) => s + o.conversions24h, 0);
  const commissionZAR = operatorStats.reduce((s, o) => s + o.commissionZAR, 0);

  return {
    updatedAt: new Date().toISOString(),
    providers,
    races: races.slice(0, 9),
    operatorStats,
    totals: {
      clicks24h,
      conversions24h,
      commissionZAR,
      avgConversionRate: clicks24h ? Math.round((conversions24h / clicks24h) * 10000) / 100 : 0,
      liveRaces: races.filter((r) => r.status === 'upcoming').length,
    },
  };
}

export async function getProviderStats(id: ProviderId) {
  const adapter = ADAPTER_MAP[id];
  if (!adapter) throw new Error(`Unknown provider: ${id}`);
  return { meta: await adapter.getMeta(), stats: await adapter.getStats() };
}

export { type AggregatedDashboard, type ProviderId } from './types';
