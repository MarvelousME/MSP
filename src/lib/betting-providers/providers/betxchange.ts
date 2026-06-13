import { assignDemoOdds, demoStats } from '../demo-data';
import type { BettingProviderAdapter, ProviderMeta, RaceCard } from '../types';

/** BetXchange exchange-style markets — internal API not publicly documented. */
export const betxchangeAdapter: BettingProviderAdapter = {
  id: 'betxchange',

  async getMeta(): Promise<ProviderMeta> {
    return {
      id: 'betxchange',
      name: 'betxchange',
      displayName: 'BetXchange',
      region: 'South Africa',
      mode: 'demo',
      apiType: 'exchange',
      docsUrl: 'https://betxchange.com/page/fixtures',
      status: 'online',
      lastSync: new Date().toISOString(),
      message: 'Demo exchange odds — retail fixtures published; no public developer API',
    };
  },

  async getStats() {
    return demoStats('betxchange');
  },

  async enrichRunners(races: RaceCard[]) {
    return assignDemoOdds(races, 'betxchange', 4);
  },
};
