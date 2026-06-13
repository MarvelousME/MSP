import { assignDemoOdds, demoStats } from '../demo-data';
import type { BettingProviderAdapter, ProviderMeta, RaceCard } from '../types';

/** 10bet has no public odds API; affiliate stats via partner portal. */
export const tenbetAdapter: BettingProviderAdapter = {
  id: '10bet',

  async getMeta(): Promise<ProviderMeta> {
    const hasKey = !!process.env.TENBET_AFFILIATE_API_KEY;
    return {
      id: '10bet',
      name: '10bet',
      displayName: '10Bet',
      region: 'ZA / International',
      mode: hasKey ? 'live' : 'demo',
      apiType: 'affiliate',
      docsUrl: 'https://affiliates.10bet.com/',
      status: 'online',
      lastSync: new Date().toISOString(),
      message: hasKey
        ? 'Affiliate reporting connected'
        : 'Demo stats — 10bet exposes affiliate tracking via partners.10betaffiliates.co.za (no public odds API)',
    };
  },

  async getStats() {
    return demoStats('10bet');
  },

  async enrichRunners(races: RaceCard[]) {
    return assignDemoOdds(races, '10bet', 2);
  },
};
