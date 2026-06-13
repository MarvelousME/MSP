export type ProviderId =
  | 'racevolt'
  | '10bet'
  | 'playabets'
  | 'betxchange'
  | 'hollywoodbets'
  | 'raventrack';

export type ProviderMode = 'live' | 'demo';

export interface ProviderMeta {
  id: ProviderId;
  name: string;
  displayName: string;
  region: string;
  mode: ProviderMode;
  apiType: 'odds' | 'affiliate' | 'racing' | 'exchange';
  docsUrl: string;
  status: 'online' | 'degraded' | 'offline';
  lastSync: string;
  message?: string;
}

export interface RaceRunner {
  number: number;
  name: string;
  jockey: string;
  trainer: string;
  form: string;
  odds: Partial<Record<ProviderId, number>>;
}

export interface RaceCard {
  id: string;
  venue: string;
  country: string;
  raceNumber: number;
  startTime: string;
  distance: string;
  going: string;
  runners: RaceRunner[];
  status: 'upcoming' | 'off' | 'result';
}

export interface OperatorStats {
  provider: ProviderId;
  clicks24h: number;
  conversions24h: number;
  conversionRate: number;
  commissionZAR: number;
  activeCampaigns: number;
  trendPct: number;
}

export interface OddsSnapshot {
  raceId: string;
  runnerNumber: number;
  provider: ProviderId;
  decimal: number;
  updatedAt: string;
}

export interface AggregatedDashboard {
  updatedAt: string;
  providers: ProviderMeta[];
  races: RaceCard[];
  operatorStats: OperatorStats[];
  totals: {
    clicks24h: number;
    conversions24h: number;
    commissionZAR: number;
    avgConversionRate: number;
    liveRaces: number;
  };
}

export interface BettingProviderAdapter {
  id: ProviderId;
  getMeta(): Promise<ProviderMeta>;
  getStats(): Promise<OperatorStats>;
  enrichRunners(races: RaceCard[]): Promise<RaceCard[]>;
}
