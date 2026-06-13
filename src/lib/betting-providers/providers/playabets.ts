import { assignDemoOdds, demoStats } from '../demo-data';
import type { BettingProviderAdapter, ProviderMeta, RaceCard } from '../types';

/** Playa Bets uses iSolutions iSBets — no public third-party odds feed. */
export const playabetsAdapter: BettingProviderAdapter = {
  id: 'playabets',

  async getMeta(): Promise<ProviderMeta> {
    return {
      id: 'playabets',
      name: 'playabets',
      displayName: 'Playa Bets',
      region: 'South Africa',
      mode: 'demo',
      apiType: 'odds',
      docsUrl: 'https://www.playabets.co.za/',
      status: 'online',
      lastSync: new Date().toISOString(),
      message: 'Demo odds — Playa Bets runs on proprietary iSolutions platform (no public API)',
    };
  },

  async getStats() {
    return demoStats('playabets');
  },

  async enrichRunners(races: RaceCard[]) {
    return assignDemoOdds(races, 'playabets', 3);
  },
};
