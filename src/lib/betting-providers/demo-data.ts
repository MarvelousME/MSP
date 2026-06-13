import type { ProviderId, RaceCard, OperatorStats } from './types';

/** Deterministic pseudo-random from seed (stable within same hour). */
function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hourSeed(): number {
  const d = new Date();
  return d.getFullYear() * 1000000 + (d.getMonth() + 1) * 10000 + d.getDate() * 100 + d.getHours();
}

const SA_VENUES = [
  { venue: 'Turffontein', country: 'ZA', going: 'Good' },
  { venue: 'Greyville', country: 'ZA', going: 'Good to Firm' },
  { venue: 'Kenilworth', country: 'ZA', going: 'Yielding' },
  { venue: 'Fairview', country: 'ZA', going: 'Soft' },
];

const RUNNER_NAMES = [
  ['Golden Streak', 'Midnight Prince', 'Velvet Dawn', 'Storm Chaser', 'Royal Venture'],
  ['Desert Wind', 'Blue Horizon', 'Silver Arrow', 'Firefly', 'Northern Light', 'Echo Bay'],
  ['Thunder Road', 'Wild Spirit', 'Ocean Drive', 'Crystal Run', 'Bold Intent'],
];

const JOCKEYS = ['C. Zackey', 'M. V\'Renaud', 'K. Matsunyane', 'G. Lerena', 'R. Munger', 'S. Khumalo'];
const TRAINERS = ['M. de Kock', 'S. Crawford', 'J. Snaith', 'W. Browne', 'A. Mayet', 'R. Kramer'];

export function buildDemoRaces(): RaceCard[] {
  const rand = seeded(hourSeed());
  const now = Date.now();

  return SA_VENUES.flatMap((v, vi) => {
    const runners = RUNNER_NAMES[vi % RUNNER_NAMES.length];
    return [1, 2, 3].map((raceNum) => {
      const startMs = now + (vi * 3 + raceNum) * 45 * 60 * 1000;
      return {
        id: `za-${v.venue.toLowerCase()}-r${raceNum}`,
        venue: v.venue,
        country: v.country,
        raceNumber: raceNum,
        startTime: new Date(startMs).toISOString(),
        distance: `${1000 + Math.floor(rand() * 800)}m`,
        going: v.going,
        status: 'upcoming' as const,
        runners: runners.map((name, i) => ({
          number: i + 1,
          name,
          jockey: JOCKEYS[Math.floor(rand() * JOCKEYS.length)],
          trainer: TRAINERS[Math.floor(rand() * TRAINERS.length)],
          form: `${Math.floor(rand() * 3) + 1}-${Math.floor(rand() * 5) + 1}-${Math.floor(rand() * 4) + 1}`,
          odds: {},
        })),
      };
    });
  });
}

export function assignDemoOdds(
  races: RaceCard[],
  provider: ProviderId,
  bias = 0
): RaceCard[] {
  const rand = seeded(hourSeed() + provider.length * 97 + bias);

  return races.map((race) => ({
    ...race,
    runners: race.runners.map((r, i) => {
      const base = 2.5 + i * 1.8 + rand() * 4;
      return {
        ...r,
        odds: {
          ...r.odds,
          [provider]: Math.round(base * 100) / 100,
        },
      };
    }),
  }));
}

const PROVIDER_BASE: Record<ProviderId, Omit<OperatorStats, 'provider'>> = {
  racevolt: { clicks24h: 8420, conversions24h: 412, conversionRate: 4.89, commissionZAR: 186400, activeCampaigns: 12, trendPct: 14.2 },
  '10bet': { clicks24h: 12450, conversions24h: 698, conversionRate: 5.61, commissionZAR: 312800, activeCampaigns: 18, trendPct: 18.7 },
  playabets: { clicks24h: 9870, conversions24h: 521, conversionRate: 5.28, commissionZAR: 245600, activeCampaigns: 15, trendPct: 11.3 },
  betxchange: { clicks24h: 6540, conversions24h: 389, conversionRate: 5.95, commissionZAR: 198200, activeCampaigns: 9, trendPct: 22.6 },
  hollywoodbets: { clicks24h: 15200, conversions24h: 891, conversionRate: 5.86, commissionZAR: 428500, activeCampaigns: 22, trendPct: 16.4 },
  raventrack: { clicks24h: 22100, conversions24h: 1240, conversionRate: 5.61, commissionZAR: 642700, activeCampaigns: 34, trendPct: 19.8 },
};

export function demoStats(provider: ProviderId): OperatorStats {
  const rand = seeded(hourSeed() + provider.charCodeAt(0));
  const base = PROVIDER_BASE[provider];
  const jitter = 0.92 + rand() * 0.16;
  return {
    provider,
    clicks24h: Math.round(base.clicks24h * jitter),
    conversions24h: Math.round(base.conversions24h * jitter),
    conversionRate: Math.round(base.conversionRate * (0.96 + rand() * 0.08) * 100) / 100,
    commissionZAR: Math.round(base.commissionZAR * jitter),
    activeCampaigns: base.activeCampaigns,
    trendPct: Math.round(base.trendPct * (0.9 + rand() * 0.2) * 10) / 10,
  };
}
