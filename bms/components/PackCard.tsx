import { StatusDot } from './StatusDot';
import { CellGrid } from './CellGrid';
import { SocBar } from './SocBar';
import { formatAge, getSocColorClass } from '../lib/format';
import type { Pack } from '../lib/types';

interface PackCardProps {
  pack: Pack;
}

export function PackCard({ pack }: PackCardProps) {
  const current = pack.current ?? 0;
  const direction = current < 0 ? 'discharging' : 'charging';
  const arrow = current < 0 ? '↓' : '↑';
  const cells = pack.cells ?? [];
  const maxCell = cells.length ? Math.max(...cells) : 0;
  const minCell = cells.length ? Math.min(...cells) : 0;
  const tempsLabel = (pack.temps ?? []).map((temp, index) => `T${index + 1}: ${temp}°C`).join(' · ');

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
    <article className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <StatusDot status="online" />
          <h2 className="text-lg font-semibold text-slate-100">{pack.name}</h2>
        </div>
        <span className="text-xs text-slate-500">{formatAge(pack.ageMs ?? 0)}</span>
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <div>
          <div className="text-2xl font-semibold text-slate-100">{(pack.totalVoltage ?? 0).toFixed(2)}V</div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Voltage</div>
        </div>
        <div>
          <div className={`text-2xl font-semibold ${direction === 'charging' ? 'text-emerald-400' : 'text-sky-400'}`}>
            {arrow} {Math.abs(current).toFixed(1)}A
          </div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{direction}</div>
        </div>
        <div>
          <div className="text-2xl font-semibold text-slate-100">{(pack.soc ?? 0).toFixed(0)}%</div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">SOC</div>
        </div>
      </div>

      <SocBar value={pack.soc ?? 0} colorClass={getSocColorClass(pack.soc ?? 0)} />
      <CellGrid cells={cells} maxCell={maxCell} minCell={minCell} packName={pack.name} />

      <div className="space-y-2 border-t border-slate-800 pt-4 text-sm text-slate-400">
        <div className="flex flex-wrap items-center gap-2">
          <span>Min/Max: {(pack.minCell ?? 0).toFixed(3)}V / {(pack.maxCell ?? 0).toFixed(3)}V (Δ{(pack.deltaCell ?? 0).toFixed(3)}V)</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span>{tempsLabel || 'No temperature data'}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span>{(pack.remainingAh ?? 0).toFixed(1)} Ah</span>
          <span>Cycles: {pack.cycles ?? 0}</span>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${pack.chargeMos ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
            CHG {pack.chargeMos ? 'ON' : 'OFF'}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${pack.dischargeMos ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
            DSG {pack.dischargeMos ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>
    </article>
  );
}
