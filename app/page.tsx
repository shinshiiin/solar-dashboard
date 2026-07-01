'use client';

import { useEffect } from 'react';

interface Pack {
  name: string;
  connected: boolean;
  valid: boolean;
  totalVoltage?: number;
  current?: number;
  soc?: number;
  maxCell?: number;
  minCell?: number;
  deltaCell?: number;
  cycles?: number;
  chargeMos?: boolean;
  dischargeMos?: boolean;
  ageMs?: number;
  cells?: number[];
  temps?: number[];
}

const MOCK_DATA: Pack[] = [
  {
    name: "Pack 1", connected: true, valid: true,
    totalVoltage: 52.8, current: 12.4, soc: 87,
    maxCell: 3.312, minCell: 3.298, deltaCell: 0.014,
    cycles: 142, chargeMos: true, dischargeMos: true, ageMs: 1400,
    cells: [3.301,3.305,3.298,3.310,3.312,3.303,3.307,3.299,3.306,3.304,3.308,3.302,3.309,3.300,3.311,3.303],
    temps: [24, 25]
  },
  {
    name: "Pack 2", connected: true, valid: true,
    totalVoltage: 51.9, current: -8.2, soc: 63,
    maxCell: 3.251, minCell: 3.229, deltaCell: 0.022,
    cycles: 98, chargeMos: true, dischargeMos: true, ageMs: 800,
    cells: [3.235,3.229,3.244,3.251,3.238,3.242,3.233,3.249,3.240,3.246,3.231,3.248,3.237,3.243,3.239,3.245],
    temps: [23, 24]
  },
  { name: "Pack 3", connected: false, valid: false, cells: [], temps: [] }
];

export default function Dashboard() {
  useEffect(() => {
    function socColor(soc: number) {
      if (soc < 20) return 'var(--danger)';
      if (soc < 50) return 'var(--warn)';
      return 'var(--accent)';
    }

    function render(packs: Pack[]) {
      const grid = document.getElementById('grid');
      if (!grid) return;

      grid.innerHTML = packs.map(p => {
        if (!p.connected) {
          return `<div class="card">
            <div class="card-header"><span class="pack-name"><span class="status-dot offline"></span>${p.name}</span></div>
            <div style="color:var(--danger)">Not connected</div>
          </div>`;
        }
        if (!p.valid) {
          return `<div class="card">
            <div class="card-header"><span class="pack-name"><span class="status-dot online"></span>${p.name}</span></div>
            <div style="color:var(--muted)">Connected, waiting for first reading&hellip;</div>
          </div>`;
        }

        const current = p.current ?? 0;
        const dir = current < 0 ? 'discharging' : 'charging';
        const arrow = current < 0 ? '&darr;' : '&uarr;';
        const ageS = Math.round((p.ageMs ?? 0) / 1000);
        const cells = p.cells ?? [];
        const maxC = Math.max(...cells);
        const minC = Math.min(...cells);

        const cellsHtml = cells.map(v => {
          let cls = 'cell';
          if (v === maxC) cls += ' max';
          if (v === minC) cls += ' min';
          return `<div class="${cls}">${v.toFixed(3)}</div>`;
        }).join('');

        const tempsHtml = (p.temps ?? []).map((t, i) => `T${i+1}: ${t}&deg;C`).join(' &middot; ');

        return `<div class="card">
          <div class="card-header">
            <span class="pack-name"><span class="status-dot online"></span>${p.name}</span>
            <span class="age">${ageS}s ago</span>
          </div>
          <div class="big-stats">
            <div class="stat"><div class="value">${(p.totalVoltage ?? 0).toFixed(2)}V</div><div class="label">Voltage</div></div>
            <div class="stat"><div class="value current ${dir}">${arrow} ${Math.abs(current).toFixed(1)}A</div><div class="label">${dir}</div></div>
            <div class="stat"><div class="value">${(p.soc ?? 0).toFixed(0)}%</div><div class="label">SOC</div></div>
          </div>
          <div class="soc-bar-track"><div class="soc-bar-fill" style="width:${p.soc ?? 0}%; background:${socColor(p.soc ?? 0)}"></div></div>
          <div class="cells-grid">${cellsHtml}</div>
          <div class="footer-row">
            <span>Min/Max: ${(p.minCell ?? 0).toFixed(3)}V / ${(p.maxCell ?? 0).toFixed(3)}V (&Delta;${(p.deltaCell ?? 0).toFixed(3)}V)</span>
            <span>${tempsHtml}</span>
            <span>Cycles: ${p.cycles ?? 0}</span>
            <span class="badge ${p.chargeMos ? 'on':'off'}">CHG ${p.chargeMos ? 'ON':'OFF'}</span>
            <span class="badge ${p.dischargeMos ? 'on':'off'}">DSG ${p.dischargeMos ? 'ON':'OFF'}</span>
          </div>
        </div>`;
      }).join('');
    }

    function poll() {
      fetch('/api/data', { cache: 'no-store' })
        .then(r => {
          if (!r.ok) throw new Error('bad response');
          return r.json();
        })
        .then(result => {
          const banner = document.getElementById('mockBanner');
          if (banner) banner.style.display = 'none';
          render(result.packs);
        })
        .catch(() => {
          const banner = document.getElementById('mockBanner');
          if (banner) banner.style.display = 'block';
          render(MOCK_DATA);
        });
    }

    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        :root {
          --bg: #0f1419; --card: #1a2129; --border: #2a3441;
          --text: #e6edf3; --muted: #8b96a3;
          --accent: #3fb950; --warn: #d29922; --danger: #f85149; --blue: #58a6ff;
        }
        * { box-sizing: border-box; }
        body {
          margin: 0; padding: 24px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: linear-gradient(180deg, #0f1419, #161b22);
          color: var(--text);
        }
        h1 { font-size: 22px; font-weight: 600; margin: 0 0 4px; }
        .subtitle { color: var(--muted); font-size: 13px; margin-bottom: 24px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 18px; }
        .card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 20px; }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .pack-name { font-size: 16px; font-weight: 600; }
        .status-dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; margin-right: 6px; }
        .status-dot.online { background: var(--accent); box-shadow: 0 0 6px var(--accent); }
        .status-dot.offline { background: var(--danger); }
        .age { font-size: 11px; color: var(--muted); }
        .big-stats { display: flex; gap: 20px; margin-bottom: 16px; }
        .stat .value { font-size: 26px; font-weight: 700; }
        .stat .label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .current.charging { color: var(--accent); }
        .current.discharging { color: var(--blue); }
        .soc-bar-track { background: #0d1117; border-radius: 8px; height: 10px; overflow: hidden; margin-top: 6px; }
        .soc-bar-fill { height: 100%; border-radius: 8px; transition: width 0.4s ease; }
        .cells-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(50px, 1fr)); gap: 5px; margin: 14px 0; }
        .cell { background: #0d1117; border-radius: 6px; padding: 5px 4px; text-align: center; font-size: 10px; border: 1px solid var(--border); }
        .cell.max { border-color: var(--accent); color: var(--accent); }
        .cell.min { border-color: var(--danger); color: var(--danger); }
        .footer-row { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border); font-size: 12px; color: var(--muted); }
        .badge { padding: 2px 9px; border-radius: 6px; font-size: 11px; font-weight: 600; }
        .badge.on { background: rgba(63,185,80,0.15); color: var(--accent); }
        .badge.off { background: rgba(248,81,73,0.15); color: var(--danger); }
        .mock-banner { background: rgba(210,153,34,0.15); color: var(--warn); border: 1px solid var(--warn); border-radius: 8px; padding: 8px 14px; font-size: 12px; margin-bottom: 18px; display: none; }
      `}</style>
      <h1>Solar BMS Monitor</h1>
      <div className="subtitle">Live data &middot; refreshes every 2s</div>
      <div className="mock-banner" id="mockBanner">⚠ No device found at /api/data — showing mock data for design preview.</div>
      <div className="grid" id="grid"></div>
    </>
  );
}