import { useState } from 'react';
import { StatusDot } from './StatusDot';
import { CellGrid } from './CellGrid';
import { SocBar } from './SocBar';
import { formatAge, getSocColorClass } from '../lib/format';
import type { Pack } from '../lib/types';

interface PackCardProps {
  pack: Pack;
}

function averageTemp(temps: number[]): number | null {
  if (!temps.length) return null;
  return temps.reduce((sum, t) => sum + t, 0) / temps.length;
}

export function PackCard({ pack }: PackCardProps) {
  const [expanded, setExpanded] = useState(false);

  const current = pack.current ?? 0;
  const direction = current < 0 ? 'discharging' : 'charging';
  const arrow = current < 0 ? '↓' : '↑';
  const cells = pack.cells ?? [];
  const maxCell = cells.length ? Math.max(...cells) : 0;
  const minCell = cells.length ? Math.min(...cells) : 0;
  const tempsLabel = (pack.temps ?? []).map((temp, index) => `T${index + 1}: ${temp}°C`).join(' · ');
  const avgTemp = averageTemp(pack.temps ?? []);

  if (!pack.connected) {
    return (
      <article className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusDot status="offline" />
            <h2 className="text-lg font-semibold text-slate-100">{pack.name}</h2>
          </div>
        </div>
        <p className="text-sm text-rose-400">Not connected</p>
      </article>
    );
  }

  if (!pack.valid) {
    return (
      <article className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusDot status="online" />
            <h2 className="text-lg font-semibold text-slate-100">{pack.name}</h2>
          </div>
        </div>
        <p className="text-sm text-slate-400">Connected, waiting for first reading…</p>
      </article>
    );
  }

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-slate-900/80 shadow-xl shadow-black/20 transition-colors ${
        expanded ? 'border-emerald-500/40' : 'border-slate-800'
      }`}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="w-full p-6 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <StatusDot status="online" />
            <h2 className="text-lg font-semibold text-slate-100">{pack.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">{formatAge(pack.ageMs ?? 0)}</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`text-slate-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        <div className="mb-5 grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-2xl font-semibold text-slate-100">{(pack.totalVoltage ?? 0).toFixed(2)}V</div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Voltage</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-slate-100">{(pack.soc ?? 0).toFixed(0)}%</div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">SOC</div>
          </div>
        </div>

        <SocBar value={pack.soc ?? 0} colorClass={getSocColorClass(pack.soc ?? 0)} />

        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-800 pt-4">
          <div>
            <div className="text-sm font-medium text-slate-200">{(pack.remainingAh ?? 0).toFixed(1)} Ah</div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Capacity</div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-200">
              {avgTemp !== null ? `${avgTemp.toFixed(0)}°C` : '—'}
            </div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Temp</div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-200">{pack.cycles ?? 0}</div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Cycles</div>
          </div>
        </div>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 border-t border-slate-800 bg-slate-950/40 p-6">
            <div className="flex items-center justify-between">
              <div
                className={`text-xl font-semibold ${direction === 'charging' ? 'text-emerald-400' : 'text-sky-400'}`}
              >
                {arrow} {Math.abs(current).toFixed(1)}A
                <span className="ml-2 text-[11px] font-normal uppercase tracking-[0.2em] text-slate-500">
                  {direction}
                </span>
              </div>
            </div>

            <CellGrid cells={cells} maxCell={maxCell} minCell={minCell} packName={pack.name} />

            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex flex-wrap items-center gap-2">
                <span>
                  Min/Max: {(pack.minCell ?? 0).toFixed(3)}V / {(pack.maxCell ?? 0).toFixed(3)}V (Δ
                  {(pack.deltaCell ?? 0).toFixed(3)}V)
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span>{tempsLabel || 'No temperature data'}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${pack.chargeMos ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}
                >
                  CHG {pack.chargeMos ? 'ON' : 'OFF'}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${pack.dischargeMos ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}
                >
                  DSG {pack.dischargeMos ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}