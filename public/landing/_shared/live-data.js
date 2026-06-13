/**
 * MSP Live Betting Data — wires landing pages to /api/betting/* endpoints.
 * Set window.MSP_API_BASE before loading if the API runs on a different host.
 */
(function () {
  'use strict';

  const PROVIDER_LABELS = {
    racevolt: 'RaceVolt',
    '10bet': '10Bet',
    playabets: 'Playa Bets',
    betxchange: 'BetXchange',
    hollywoodbets: 'Hollywoodbets',
    raventrack: 'RavenTrack',
  };

  function resolveApiBase() {
    if (window.MSP_API_BASE) return window.MSP_API_BASE.replace(/\/$/, '');
    const { protocol, hostname, port, origin } = window.location;
    if (protocol === 'file:') return 'http://localhost:3000';
    if (port === '5500' || port === '8080') return 'http://localhost:3000';
    if (hostname === 'localhost' || hostname === '127.0.0.1') return origin;
    return origin;
  }

  function fmtNum(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
    return new Intl.NumberFormat('en-ZA').format(n);
  }

  function fmtZAR(n) {
    return 'R' + fmtNum(n);
  }

  function fmtTime(iso) {
    try {
      return new Date(iso).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  }

  async function fetchDashboard() {
    const base = resolveApiBase();
    const res = await fetch(base + '/api/betting/dashboard', { credentials: 'omit' });
    if (!res.ok) throw new Error('Dashboard API ' + res.status);
    return res.json();
  }

  function renderBanner(container, data) {
    const liveCount = data.providers.filter(function (p) { return p.mode === 'live'; }).length;
    container.innerHTML =
      '<span class="pulse" aria-hidden="true"></span>' +
      '<span><strong>Live operator feed</strong> — ' + data.totals.liveRaces + ' upcoming races · ' +
      fmtNum(data.totals.clicks24h) + ' clicks (24h) · ' + fmtZAR(data.totals.commissionZAR) + ' commission</span>' +
      '<span class="' + (liveCount ? 'status-live' : 'status-demo') + '">' +
      (liveCount ? liveCount + ' live API' : 'Demo data') + ' · updated ' + fmtTime(data.updatedAt) + '</span>';
  }

  function renderOperators(container, stats) {
    container.innerHTML = stats
      .map(function (op) {
        var label = PROVIDER_LABELS[op.provider] || op.provider;
        return (
          '<article class="live-operator-card">' +
          '<header><h4>' + label + '</h4><span class="mode-badge demo">demo</span></header>' +
          '<dl>' +
          '<dt>Clicks 24h</dt><dd>' + fmtNum(op.clicks24h) + '</dd>' +
          '<dt>Conversions</dt><dd>' + fmtNum(op.conversions24h) + '</dd>' +
          '<dt>CR</dt><dd>' + op.conversionRate + '%</dd>' +
          '<dt>Commission</dt><dd>' + fmtZAR(op.commissionZAR) + '</dd>' +
          '</dl>' +
          '<p class="trend-up">+' + op.trendPct + '% vs prior period</p>' +
          '</article>'
        );
      })
      .join('');

    container.querySelectorAll('.live-operator-card').forEach(function (card, i) {
      var meta = stats[i];
      var providerMeta = window.__mspProviders && window.__mspProviders[i];
      if (providerMeta) {
        var badge = card.querySelector('.mode-badge');
        badge.textContent = providerMeta.mode;
        badge.className = 'mode-badge ' + providerMeta.mode;
      }
    });
  }

  function bestOdds(runner) {
    var odds = runner.odds || {};
    var vals = Object.values(odds).filter(function (v) { return typeof v === 'number'; });
    if (!vals.length) return '—';
    return Math.min.apply(null, vals).toFixed(2);
  }

  function renderRaces(container, races) {
    if (!races.length) {
      container.innerHTML = '<p class="live-data-error">No upcoming races in feed.</p>';
      return;
    }
    container.innerHTML = races
      .slice(0, 4)
      .map(function (race) {
        var rows = race.runners
          .slice(0, 5)
          .map(function (r) {
            return (
              '<tr><td>' + r.number + '</td><td>' + r.name + '</td><td>' + r.jockey + '</td>' +
              '<td class="odds-cell">' + bestOdds(r) + '</td></tr>'
            );
          })
          .join('');
        return (
          '<article class="live-race-card">' +
          '<h3>' + race.venue + ' · Race ' + race.raceNumber + '</h3>' +
          '<p class="race-meta">' + race.distance + ' · ' + race.going + ' · Off ' + fmtTime(race.startTime) + '</p>' +
          '<table class="live-runners"><thead><tr><th>#</th><th>Horse</th><th>Jockey</th><th>Best</th></tr></thead><tbody>' +
          rows + '</tbody></table></article>'
        );
      })
      .join('');
  }

  function patchDashboardKpis(data) {
    var t = data.totals;
    document.querySelectorAll('[data-live-kpi="clicks"] strong, .dash-kpis article:first-child strong, .kpis article:first-child strong').forEach(function (el) {
      el.textContent = fmtNum(t.clicks24h);
    });
    document.querySelectorAll('[data-live-kpi="conversions"] strong, .dash-kpis article:nth-child(2) strong, .kpis article:nth-child(2) strong').forEach(function (el) {
      el.textContent = fmtNum(t.conversions24h);
    });
    document.querySelectorAll('[data-live-kpi="cr"] strong, .dash-kpis article:nth-child(3) strong, .kpis article:nth-child(3) strong').forEach(function (el) {
      el.textContent = t.avgConversionRate + '%';
    });
    document.querySelectorAll('[data-live-kpi="commission"] strong, .dash-kpis article:nth-child(4) strong, .kpis article:nth-child(4) strong').forEach(function (el) {
      el.textContent = fmtZAR(t.commissionZAR);
    });
    document.querySelectorAll('.counter[data-count="12458"], .counter[data-count="1250"]').forEach(function (c) {
      c.dataset.count = String(Math.round(t.conversions24h / 100));
      c.textContent = fmtNum(Math.round(t.conversions24h / 100));
    });
    document.querySelectorAll('.counter[data-count="34700000"], .counter[data-count="980000"]').forEach(function (c) {
      c.dataset.count = String(t.clicks24h);
      c.textContent = fmtNum(t.clicks24h);
    });
    document.querySelectorAll('.counter[data-count="8420000"], .counter[data-count="4200000"]').forEach(function (c) {
      c.dataset.count = String(t.commissionZAR);
      c.textContent = fmtNum(t.commissionZAR);
    });
    document.querySelectorAll('.counter[data-count="583"], .counter[data-count="18"]').forEach(function (c) {
      var v = Math.round(t.avgConversionRate * 100);
      c.dataset.count = String(v);
      c.textContent = (v / 100).toFixed(2);
    });
  }

  function patchTopOperators(data) {
    var sorted = data.operatorStats.slice().sort(function (a, b) { return b.commissionZAR - a.commissionZAR; });
    var lists = document.querySelectorAll('.dash-bottom article:last-child p, .bottom article:last-child p');
    sorted.slice(0, 3).forEach(function (op, i) {
      var label = PROVIDER_LABELS[op.provider] || op.provider;
      if (lists[i]) {
        lists[i].innerHTML = label + ' <span>' + fmtZAR(op.commissionZAR) + '</span>';
      }
    });
  }

  async function init() {
    var banner = document.getElementById('live-data-banner');
    var operators = document.getElementById('live-operators');
    var races = document.getElementById('live-races');

    try {
      var data = await fetchDashboard();
      window.__mspProviders = data.providers;
      if (banner) renderBanner(banner, data);
      if (operators) renderOperators(operators, data.operatorStats);
      if (races) renderRaces(races, data.races);
      patchDashboardKpis(data);
      patchTopOperators(data);
    } catch (err) {
      var msg = err instanceof Error ? err.message : 'Failed to load live data';
      if (banner) banner.innerHTML = '<span class="live-data-error">Live feed unavailable — start Next.js (<code>npm run dev</code>) at ' + resolveApiBase() + '. ' + msg + '</span>';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  setInterval(init, 60000);
})();
