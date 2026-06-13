import { assignDemoOdds, buildDemoRaces, demoStats } from '../demo-data';
import type { BettingProviderAdapter, ProviderMeta, RaceCard } from '../types';

const DOCS = 'https://www.theracingapi.com/';

async function fetchLiveRaces(): Promise<RaceCard[] | null> {
  const key = process.env.THE_RACING_API_KEY ?? process.env.RACEVOLT_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch('https://api.theracingapi.com/v1/racecards/basic?day=today&region_codes=gb,ire,za', {
      headers: { 'X-API-Key': key },
      next: { revalidate: 180 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      racecards?: Array<{
        race_id: string;
        course: string;
        region: string;
        race_number: number;
        off_time: string;
        distance: string;
        going: string;
        runners?: Array<{ number: number; horse: string; jockey?: string; trainer?: string; form?: string; sp_decimal?: number }>;
      }>;
    };

    const cards = data.racecards?.slice(0, 6) ?? [];
    if (!cards.length) return null;

    return cards.map((r) => ({
      id: r.race_id,
      venue: r.course,
      country: r.region?.toUpperCase() ?? 'GB',
      raceNumber: r.race_number,
      startTime: r.off_time,
      distance: r.distance,
      going: r.going ?? '—',
      status: 'upcoming' as const,
      runners: (r.runners ?? []).slice(0, 8).map((run) => ({
        number: run.number,
        name: run.horse,
        jockey: run.jockey ?? '—',
        trainer: run.trainer ?? '—',
        form: run.form ?? '—',
        odds: run.sp_decimal ? { racevolt: run.sp_decimal } : {},
      })),
    }));
  } catch {
    return null;
  }
}

export const racevoltAdapter: BettingProviderAdapter = {
  id: 'racevolt',

  async getMeta(): Promise<ProviderMeta> {
    const live = !!(process.env.THE_RACING_API_KEY ?? process.env.RACEVOLT_API_KEY);
    return {
      id: 'racevolt',
      name: 'racevolt',
      displayName: 'RaceVolt',
      region: 'Global / SA',
      mode: live ? 'live' : 'demo',
      apiType: 'racing',
      docsUrl: DOCS,
      status: 'online',
      lastSync: new Date().toISOString(),
      message: live
        ? 'Live racecards via The Racing API'
        : 'Demo mode — set THE_RACING_API_KEY or RACEVOLT_API_KEY for live UK/IRE/SA cards',
    };
  },

  async getStats() {
    return demoStats('racevolt');
  },

  async enrichRunners(races: RaceCard[]) {
    const live = await fetchLiveRaces();
    if (live?.length) return assignDemoOdds(live, 'racevolt', 1);
    return assignDemoOdds(races.length ? races : buildDemoRaces(), 'racevolt', 1);
  },
};
