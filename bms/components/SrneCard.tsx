import { useState } from 'react';
import {
  Sun,
  Zap,
  Thermometer,
  ChevronDown,
  BatteryCharging,
  Lightbulb,
  AlertTriangle,
} from 'lucide-react';
import { StatusDot } from './StatusDot';
import { formatAge } from '../lib/format';
import { decodeSrneFaults } from '../lib/srne-faults';
import type { SrneReading } from '../lib/types';

interface SrneCardProps {
  srne: SrneReading | null;
}

export function SrneCard({ srne }: SrneCardProps) {
  const [expanded, setExpanded] = useState(false);

  if (!srne) {
    return (
      <article className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-black/20">
        <div className="flex items-center gap-2">
          <StatusDot status="offline" />
          <h2 className="text-sm font-semibold text-slate-100">SRNE Controller</h2>
        </div>
        <p className="mt-3 text-sm text-rose-400">Not connected</p>
      </article>
    );
  }

  if (!srne.valid) {
    return (
      <article className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-black/20">
        <div className="flex items-center gap-2">
          <StatusDot status="online" />
          <h2 className="text-sm font-semibold text-slate-100">SRNE Controller</h2>
        </div>
        <p className="mt-3 text-sm text-slate-400">Connected, waiting for first reading…</p>
      </article>
    );
  }

  const chargingPower = srne.chargingPower ?? 0;
  const isCharging = chargingPower > 0;
  const faults = decodeSrneFaults(srne.faultBits ?? 0);
  const hasFaults = faults.length > 0;

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-slate-900/80 shadow-xl shadow-black/20 transition-colors ${
        hasFaults ? 'border-rose-500/40' : expanded ? 'border-amber-500/40' : 'border-slate-800'
      }`}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="w-full p-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500"
      >
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusDot status="online" />
            <h2 className="text-sm font-semibold text-slate-100">{srne.model || 'SRNE Controller'}</h2>
          </div>
          <div className="flex items-center gap-2">
            {hasFaults ? <AlertTriangle className="h-4 w-4 text-rose-400" /> : null}
            <Sun className={`h-4 w-4 ${isCharging ? 'text-amber-400' : 'text-slate-500'}`} />
          </div>
        </div>

        {/* Big stats: PV power, battery voltage, load power */}
        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center gap-1 rounded-lg bg-slate-950/60 py-3 text-center">
            <span className="text-2xl font-bold leading-none text-slate-50">
              {chargingPower.toFixed(0)}
              <span className="text-sm font-medium text-slate-400">W</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.15em] text-slate-500">PV Charging</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg bg-slate-950/60 py-3 text-center">
            <span className="text-2xl font-bold leading-none text-slate-50">
              {(srne.batteryVoltage ?? 0).toFixed(1)}
              <span className="text-sm font-medium text-slate-400">V</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Battery</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg bg-slate-950/60 py-3 text-center">
            <span className="text-2xl font-bold leading-none text-slate-50">
              {(srne.loadPower ?? 0).toFixed(0)}
              <span className="text-sm font-medium text-slate-400">W</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Load</span>
          </div>
        </div>

        {/* Status line */}
        <div className="mb-4 flex items-center gap-1.5 text-xs text-slate-400">
          <span className="text-slate-500">Status:</span>
          <span className="font-medium text-amber-400">{srne.chargingStateName ?? '—'}</span>
          <span className="ml-auto text-[11px] text-slate-600">{formatAge(srne.ageMs ?? 0)}</span>
        </div>

        {/* SOC / temp / PV voltage */}
        <div className="grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-3">
          <div className="flex flex-col items-center gap-1 text-center">
            <BatteryCharging className="h-3.5 w-3.5 text-slate-500" />
            <div className="text-sm font-semibold text-slate-100">{(srne.soc ?? 0).toFixed(0)}%</div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">SOC</div>
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <Thermometer className="h-3.5 w-3.5 text-slate-500" />
            <div className="text-sm font-semibold text-slate-100">{srne.controllerTemp ?? '—'}°C</div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Ctrl Temp</div>
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <Zap className="h-3.5 w-3.5 text-slate-500" />
            <div className="text-sm font-semibold text-slate-100">{(srne.pvVoltage ?? 0).toFixed(1)}V</div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">PV Voltage</div>
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
            {hasFaults ? (
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase tracking-[0.15em] text-rose-400">Active faults / warnings</div>
                <div className="flex flex-wrap gap-1.5">
                  {faults.map((f) => (
                    <span
                      key={f}
                      className="rounded-full bg-rose-500/15 px-2.5 py-1 text-[11px] font-semibold text-rose-400"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-400 sm:grid-cols-3">
              <div>
                <div className="text-slate-200">{(srne.chargingCurrent ?? 0).toFixed(2)}A</div>
                <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Charge Current</div>
              </div>
              <div>
                <div className="text-slate-200">{(srne.pvCurrent ?? 0).toFixed(2)}A</div>
                <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">PV Current</div>
              </div>
              <div>
                <div className="text-slate-200">{(srne.loadVoltage ?? 0).toFixed(1)}V / {(srne.loadCurrent ?? 0).toFixed(2)}A</div>
                <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Load V/A</div>
              </div>
              <div>
                <div className="text-slate-200">{srne.batteryTemp ?? '—'}°C</div>
                <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Battery Temp</div>
              </div>
              <div>
                <div className="text-slate-200">
                  {(srne.minBattVToday ?? 0).toFixed(1)}V – {(srne.maxBattVToday ?? 0).toFixed(1)}V
                </div>
                <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Batt. Range Today</div>
              </div>
              <div>
                <div className="text-slate-200">+{srne.chargeAhToday ?? 0} / -{srne.dischargeAhToday ?? 0} Ah</div>
                <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Ah Today</div>
              </div>
              <div>
                <div className="text-slate-200">{srne.powerGenToday ?? 0}W gen / {srne.powerConsToday ?? 0}W used</div>
                <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Power Today</div>
              </div>
              <div>
                <div className="text-slate-200">
                  {(srne.totalChargeAh ?? 0).toLocaleString()} / {(srne.totalDischargeAh ?? 0).toLocaleString()} Ah
                </div>
                <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Lifetime Ah +/-</div>
              </div>
              <div>
                <div className="text-slate-200">
                  {srne.operatingDays ?? 0}d · {srne.fullCharges ?? 0} full · {srne.overDischarges ?? 0} over-disch.
                </div>
                <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">History</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  srne.loadOn ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                }`}
              >
                <Lightbulb className="h-3 w-3" />
                LOAD {srne.loadOn ? 'ON' : 'OFF'}
                {srne.streetLightOn ? ` · ${srne.brightness ?? 0}%` : ''}
              </span>
              <span className="text-[11px] text-slate-500">
                SW {srne.softwareVersion ?? '—'} · HW {srne.hardwareVersion ?? '—'}
              </span>
              {srne.deviceAddress !== undefined ? (
                <span className="text-[11px] text-slate-500">Addr {srne.deviceAddress}</span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
