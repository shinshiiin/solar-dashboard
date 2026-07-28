'use client';

import { useState } from 'react';
import {
  TrendingUp, TrendingDown, Zap, Thermometer, HeartPulse, ChevronDown,
  BatteryFull, BatteryMedium, BatteryLow, BatteryWarning,
} from 'lucide-react';
import { StatusDot } from './StatusDot';
import { CellGrid } from './CellGrid';
import { SocRing } from './SocRing';
import { formatAge, socTextClass } from '../lib/format';
import type { Pack } from '../lib/types';

function BatteryIcon({ soc }: { soc: number }) {
  const cls = 'h-4 w-4 text-slate-600';
  if (soc <= 15) return <BatteryWarning className={cls} />;
  if (soc <= 40) return <BatteryLow className={cls} />;
  if (soc <= 75) return <BatteryMedium className={cls} />;
  return <BatteryFull className={cls} />;
}

function estimateHealth(pack: Pack): number {
  const h = (pack as unknown as { health?: number }).health;
  if (typeof h === 'number') return h;
  return Math.max(0, Math.round(100 - (pack.cycles ?? 0) * 0.03));
}

export function PackCard({ pack }: { pack: Pack }) {
  const [expanded, setExpanded] = useState(false);

  if (!pack.connected) return (
    <article className="rounded-2xl border border-[#2a1a1a] bg-[#0f0a0a] p-4">
      <div className="flex items-center gap-2">
        <StatusDot status="offline" />
        <h2 className="text-xs font-semibold text-slate-300">{pack.name}</h2>
      </div>
      <p className="mt-3  text-xs text-rose-400">Not connected</p>
    </article>
  );

  if (!pack.valid) return (
    <article className="rounded-2xl border border-[#1a2a1a] bg-[#0a0f0a] p-4">
      <div className="flex items-center gap-2">
        <StatusDot status="online" />
        <h2 className="text-xs font-semibold text-slate-300">{pack.name}</h2>
      </div>
      <p className="mt-3  text-xs text-slate-600">Waiting for first reading…</p>
    </article>
  );

  const current  = pack.current ?? 0;
  const charging = current >= 0;
  const soc      = pack.soc ?? 0;
  const cells    = pack.cells ?? [];
  const maxCell  = cells.length ? Math.max(...cells) : 0;
  const minCell  = cells.length ? Math.min(...cells) : 0;
  const avgTemp  = (pack.temps ?? []).length
    ? pack.temps!.reduce((s, t) => s + t, 0) / pack.temps!.length
    : null;
  const health     = estimateHealth(pack);
  const tempsLabel = (pack.temps ?? []).map((t, i) => `T${i + 1}: ${t}°C`).join(' · ');

  const accentText   = charging ? 'text-[#639922]' : 'text-[#60A5FA]';
  const borderColor  = expanded
    ? (charging ? 'border-emerald-500/25' : 'border-sky-500/25')
    : 'border-[#1a2a1a]';

  return (
    <article className={`overflow-hidden rounded-2xl border transition-colors border-[#1e1e1d]`}>
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
        className="w-full p-2 text-left"
      >
        {/* Name row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <StatusDot status="online" />
            <h2 className="text-xs text-white font-semibold">{pack.name}</h2>
          </div>
          <div className="text-[11px] text-[#f2f2f0]">{ soc ?? 0 }%</div>
          <div className={`flex w-fit items-center gap-1.5 rounded-lg px-2.5 py-1.5`}>
            <span className={` text-[11px] font-semibold ${accentText}`}>
              {charging ? '↑' : '↓'} {Math.abs(current).toFixed(1)}A
            </span>
          </div>
          <div className="text-[11px]">{ pack.totalVoltage ?? 0 }v / {avgTemp ?? 0 }°C</div>
          <div className={`text-xs ${socTextClass(health)}`}>{health}%</div>
        </div>
      </button>

      {/* Expanded */}
      <div className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}>
        <div className="overflow-hidden">
          <div className="space-y-2 border-t border-[#1a2a1a] bg-[#060c06] p-2">
            <div>
              <p className="mb-2 text-[9px] uppercase tracking-[0.15em] text-slate-700">Cell voltages</p>
              <CellGrid cells={cells} maxCell={maxCell} minCell={minCell} packName={pack.name} />
            </div>
            <div className=" text-[11px] text-slate-600">
              Min <span className="text-rose-400">{(pack.minCell ?? 0).toFixed(3)}V</span>
              {' · '}Max <span className="text-emerald-400">{(pack.maxCell ?? 0).toFixed(3)}V</span>
              {' · '}Δ <span className="text-slate-300">{(pack.deltaCell ?? 0).toFixed(3)}V</span>
            </div>
            {tempsLabel && <p className=" text-[11px] text-slate-600">{tempsLabel}</p>}
            <div className="flex gap-4  text-[11px] text-slate-600">
              <span>Remaining: <span className="text-slate-300">{(pack.remainingAh ?? 0).toFixed(1)} Ah</span></span>
              <span>Cycles: <span className="text-slate-300">{pack.cycles ?? 0}</span></span>
            </div>
            <div className="flex gap-2">
              {[{ label: 'CHG', on: pack.chargeMos }, { label: 'DSG', on: pack.dischargeMos }].map(({ label, on }) => (
                <span key={label} className={`rounded-full px-2.5 py-1  text-[10px] font-semibold ${on ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                  {label} {on ? 'ON' : 'OFF'}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
