import { useState } from 'react';
import {
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  BatteryWarning,
  TrendingUp,
  TrendingDown,
  Zap,
  Thermometer,
  HeartPulse,
  ChevronDown,
} from 'lucide-react';
import { StatusDot } from './StatusDot';
import { CellGrid } from './CellGrid';
import { formatAge } from '../lib/format';
import type { Pack } from '../lib/types';

interface PackCardProps {
  pack: Pack;
}

function averageTemp(temps: number[]): number | null {
  if (!temps.length) return null;
  return temps.reduce((sum, t) => sum + t, 0) / temps.length;
}

// Pack doesn't carry a dedicated health field yet — fall back to a rough
// cycle-based estimate so the card has something to show. Swap this out
// for a real pack.health value as soon as one is available upstream.
function estimateHealth(pack: Pack): number {
  if (typeof (pack as { health?: number }).health === 'number') {
    return (pack as { health: number }).health;
  }
  const cycles = pack.cycles ?? 0;
  return Math.max(0, Math.round(100 - cycles * 0.03));
}

function BatteryIcon({ soc, className }: { soc: number; className?: string }) {
  if (soc <= 15) return <BatteryWarning className={className} />;
  if (soc <= 40) return <BatteryLow className={className} />;
  if (soc <= 75) return <BatteryMedium className={className} />;
  return <BatteryFull className={className} />;
}

export function PackCard({ pack }: PackCardProps) {
  const [expanded, setExpanded] = useState(false);

  const current = pack.current ?? 0;
  const charging = current >= 0;
  const direction = charging ? 'Charging' : 'Discharging';
  const cells = pack.cells ?? [];
  const maxCell = cells.length ? Math.max(...cells) : 0;
  const minCell = cells.length ? Math.min(...cells) : 0;
  const tempsLabel = (pack.temps ?? []).map((temp, index) => `T${index + 1}: ${temp}°C`).join(' · ');
  const avgTemp = averageTemp(pack.temps ?? []);
  const soc = pack.soc ?? 0;
  const health = estimateHealth(pack);

  const accent = charging ? 'text-emerald-400' : 'text-sky-400';
  const accentBg = charging ? 'bg-emerald-500/15' : 'bg-sky-500/15';

  if (!pack.connected) {
    return (
      <article className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-black/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusDot status="offline" />
            <h2 className="text-sm font-semibold text-slate-100">{pack.name}</h2>
          </div>
          <BatteryWarning className="h-4 w-4 text-slate-600" />
        </div>
        <p className="mt-3 text-sm text-rose-400">Not connected</p>
      </article>
    );
  }

  if (!pack.valid) {
    return (
      <article className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-black/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusDot status="online" />
            <h2 className="text-sm font-semibold text-slate-100">{pack.name}</h2>
          </div>
          <BatteryWarning className="h-4 w-4 text-slate-600" />
        </div>
        <p className="mt-3 text-sm text-slate-400">Connected, waiting for first reading…</p>
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
        className="w-full p-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
      >
        {/* Header: name + status dot, battery glyph on the right */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusDot status="online" />
            <h2 className="text-sm font-semibold text-slate-100">{pack.name}</h2>
          </div>
          <BatteryIcon soc={soc} className="h-4 w-4 text-slate-500" />
        </div>

        {/* Big SOC number + trend badge */}
        <div className="mb-1 flex items-end justify-between">
          <div className="text-4xl font-bold leading-none text-slate-50">{soc.toFixed(0)}%</div>
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${accentBg}`}>
            {charging ? (
              <TrendingUp className={`h-4 w-4 ${accent}`} />
            ) : (
              <TrendingDown className={`h-4 w-4 ${accent}`} />
            )}
          </div>
        </div>

        {/* Status line */}
        <div className="mb-4 flex items-center gap-1.5 text-xs text-slate-400">
          <span className="text-slate-500">Status:</span>
          <span className={`font-medium ${accent}`}>{direction}</span>
          <span className="ml-auto text-[11px] text-slate-600">{formatAge(pack.ageMs ?? 0)}</span>
        </div>

        {/* Voltage / Temp / Health */}
        <div className="grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-3">
          <div className="flex flex-col items-center gap-1 text-center">
            <Zap className="h-3.5 w-3.5 text-slate-500" />
            <div className="text-sm font-semibold text-slate-100">{(pack.totalVoltage ?? 0).toFixed(1)}V</div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Voltage</div>
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <Thermometer className="h-3.5 w-3.5 text-slate-500" />
            <div className="text-sm font-semibold text-slate-100">
              {avgTemp !== null ? `${avgTemp.toFixed(0)}°C` : '—'}
            </div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Temp</div>
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <HeartPulse className="h-3.5 w-3.5 text-slate-500" />
            <div className="text-sm font-semibold text-slate-100">{health}%</div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Health</div>
          </div>
        </div>

        <div className="mt-3 flex justify-center">
          <ChevronDown
            className={`h-3.5 w-3.5 text-slate-600 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 border-t border-slate-800 bg-slate-950/40 p-5">
            <div className={`text-lg font-semibold ${accent}`}>
              {charging ? '↑' : '↓'} {Math.abs(current).toFixed(1)}A
              <span className="ml-2 text-[11px] font-normal uppercase tracking-[0.2em] text-slate-500">
                {direction.toLowerCase()}
              </span>
            </div>

            <div>
              <div className="text-sm font-medium text-slate-200">{(pack.remainingAh ?? 0).toFixed(1)} Ah</div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Capacity</div>
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