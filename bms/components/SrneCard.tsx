'use client';

import { useState, useEffect, useRef } from 'react';
import { Sun, Zap, Thermometer, ChevronDown, BatteryCharging, Lightbulb, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { StatusDot } from './StatusDot';
import { SocRing } from './SocRing';
import { formatAge } from '../lib/format';
import { decodeSrneFaults } from '../lib/srne-faults';
import type { SrneReading } from '../lib/types';

interface HistoryPoint { time: string; pvW: number; loadW: number; soc: number; }
const MAX_HISTORY = 40;

const TT = {
  contentStyle: { background: '#060c06', border: '1px solid #1a2a1a', borderRadius: 8, fontSize: 11 },
  labelStyle:   { color: '#4b5563' },
  itemStyle:    { color: '#e2e8f0' },
};

export function SrneCard({ srne }: { srne: SrneReading | null }) {
  const [expanded, setExpanded] = useState(false);
  const [history,  setHistory]  = useState<HistoryPoint[]>([]);
  const lastTs = useRef<number>(0);

  useEffect(() => {
    if (!srne?.valid) return;
    const now = Date.now();
    if (now - lastTs.current < 10_000) return;
    lastTs.current = now;
    setHistory(prev => {
      const pt: HistoryPoint = {
        time:  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        pvW:   srne.chargingPower ?? 0,
        loadW: srne.loadPower     ?? 0,
        soc:   srne.soc           ?? 0,
      };
      const next = [...prev, pt];
      return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
    });
  }, [srne]);

  if (!srne) return (
    <article className="rounded-2xl border border-[#2a1a1a] bg-[#0f0a0a] p-4">
      <div className="flex items-center gap-2"><StatusDot status="offline" /><h2 className="text-sm font-semibold text-slate-300">SRNE Controller</h2></div>
      <p className="mt-3 font-mono text-xs text-rose-400">Not connected</p>
    </article>
  );

  if (!srne.valid) return (
    <article className="rounded-2xl border border-[#1a2a1a] bg-[#0a0f0a] p-4">
      <div className="flex items-center gap-2"><StatusDot status="online" /><h2 className="text-sm font-semibold text-slate-300">SRNE Controller</h2></div>
      <p className="mt-3 font-mono text-xs text-slate-600">Waiting for first reading…</p>
    </article>
  );

  const chargingPower = srne.chargingPower ?? 0;
  const faults        = decodeSrneFaults(srne.faultBits ?? 0);
  const hasFaults     = faults.length > 0;
  const soc           = srne.soc ?? 0;

  return (
    <article className={`overflow-hidden rounded-2xl border bg-[#0a0f0a] transition-colors ${hasFaults ? 'border-rose-500/30' : expanded ? 'border-amber-500/20' : 'border-[#1a2a1a]'}`}>
      <button type="button" onClick={() => setExpanded(v => !v)} aria-expanded={expanded} className="w-full p-4 text-left">

        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusDot status={hasFaults ? 'warning' : 'online'} />
            <h2 className="text-sm font-semibold text-slate-100">{srne.model ?? 'SRNE Controller'}</h2>
          </div>
          <div className="flex items-center gap-2">
            {hasFaults && <AlertTriangle className="h-4 w-4 text-rose-400" />}
            <Sun className={`h-4 w-4 ${chargingPower > 0 ? 'text-amber-400' : 'text-slate-700'}`} />
          </div>
        </div>

        {/* Ring + stats */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-28 shrink-0">
            <SocRing
              soc={soc} size="lg"
              centerTop={srne.batteryTemp !== undefined ? `${srne.batteryTemp}°C` : undefined}
              centerBottom={srne.chargingCurrent !== undefined ? `${srne.chargingCurrent.toFixed(1)}Ah` : undefined}
            />
          </div>
          <div className="flex flex-1 flex-col gap-3">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-slate-700">Status:</span>
              <span className="font-mono text-[10px] font-semibold text-amber-400">{srne.chargingStateName ?? '—'}</span>
              <span className="ml-auto font-mono text-[10px] text-slate-700">{formatAge(srne.ageMs ?? 0)}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: `${chargingPower.toFixed(0)}W`,               lbl: 'PV',   color: 'text-amber-400'  },
                { val: `${(srne.batteryVoltage ?? 0).toFixed(1)}V`,  lbl: 'Batt', color: 'text-slate-100'  },
                { val: `${(srne.loadPower ?? 0).toFixed(0)}W`,       lbl: 'Load', color: 'text-indigo-400' },
              ].map(({ val, lbl, color }) => (
                <div key={lbl} className="rounded-xl border border-[#1a2a1a] bg-[#0d140d] px-2 py-2.5 text-center">
                  <div className={`font-mono text-base font-bold leading-none ${color}`}>{val}</div>
                  <div className="mt-1 text-[8px] uppercase tracking-[0.1em] text-slate-700">{lbl}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { Icon: Thermometer, val: `${srne.controllerTemp ?? '—'}°C`,          lbl: 'Ctrl Temp'  },
                { Icon: Zap,         val: `${(srne.pvVoltage ?? 0).toFixed(1)}V`,     lbl: 'PV Voltage' },
              ].map(({ Icon, val, lbl }) => (
                <div key={lbl} className="flex items-center gap-2">
                  <Icon className="h-3 w-3 text-slate-700 shrink-0" />
                  <div>
                    <div className="font-mono text-[11px] font-semibold text-slate-200">{val}</div>
                    <div className="text-[8px] uppercase tracking-[0.1em] text-slate-700">{lbl}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fault preview */}
        {hasFaults && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {faults.slice(0, 2).map(f => (
              <span key={f} className="rounded-full bg-rose-500/15 px-2.5 py-1 font-mono text-[10px] font-semibold text-rose-400">{f}</span>
            ))}
            {faults.length > 2 && (
              <span className="rounded-full bg-rose-500/10 px-2.5 py-1 font-mono text-[10px] text-rose-500">+{faults.length - 2} more</span>
            )}
          </div>
        )}

        <div className="flex justify-center">
          <ChevronDown className={`h-3.5 w-3.5 text-slate-700 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Expanded */}
      <div className="grid transition-[grid-template-rows] duration-300 ease-in-out" style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}>
        <div className="overflow-hidden">
          <div className="space-y-5 border-t border-[#1a2a1a] bg-[#060c06] p-4">

            {/* All faults */}
            {hasFaults && (
              <div>
                <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.15em] text-rose-400">Active faults</p>
                <div className="flex flex-wrap gap-1.5">
                  {faults.map(f => (
                    <span key={f} className="rounded-full bg-rose-500/15 px-2.5 py-1 font-mono text-[10px] font-semibold text-rose-400">{f}</span>
                  ))}
                </div>
              </div>
            )}

            {/* ── CHARTS ── */}
            {history.length >= 2 ? (
              <div className="space-y-4">
                {/* PV vs Load — smooth with dots */}
                <div>
                  <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.15em] text-slate-700">
                    Power history · {history.length} readings
                  </p>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={history} margin={{ top: 10, right: 4, left: -28, bottom: 0 }}>
                      <defs>
                        <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor="#818cf8" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="#818cf8" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor="#f472b6" stopOpacity={0.45} />
                          <stop offset="100%" stopColor="#f472b6" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" tick={{ fill: '#374151', fontSize: 9, fontFamily: 'ui-monospace' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                      <YAxis tick={{ fill: '#374151', fontSize: 9 }} tickLine={false} axisLine={false} />
                      <Tooltip {...TT} />
                      <Area type="monotone" dataKey="pvW"   name="PV (W)"   stroke="#818cf8" strokeWidth={2} fill="url(#pvGrad)"
                        dot={{ r: 3, fill: '#818cf8', stroke: '#1e1b4b', strokeWidth: 1.5 }}
                        activeDot={{ r: 5, fill: '#818cf8', stroke: '#0a0f0a', strokeWidth: 2 }} />
                      <Area type="monotone" dataKey="loadW" name="Load (W)" stroke="#f472b6" strokeWidth={2} fill="url(#loadGrad)"
                        dot={{ r: 3, fill: '#f472b6', stroke: '#4a044e', strokeWidth: 1.5 }}
                        activeDot={{ r: 5, fill: '#f472b6', stroke: '#0a0f0a', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* SOC */}   
                <div>
                  <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.15em] text-slate-700">SOC %</p>
                  <ResponsiveContainer width="100%" height={100}>
                    <AreaChart data={history} margin={{ top: 10, right: 4, left: -28, bottom: 0 }}>
                      <defs>
                        <linearGradient id="socGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor="#4ade80" stopOpacity={0.45} />
                          <stop offset="100%" stopColor="#4ade80" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" hide />
                      <YAxis domain={[0, 100]} tick={{ fill: '#374151', fontSize: 9 }} tickLine={false} axisLine={false} />
                      <Tooltip {...TT} formatter={(v) => [`${Number(v).toFixed(0)}%`, 'SOC']} />
                      <Area type="monotone" dataKey="soc" name="SOC" stroke="#4ade80" strokeWidth={2} fill="url(#socGrad)"
                        dot={{ r: 3, fill: '#4ade80', stroke: '#052e16', strokeWidth: 1.5 }}
                        activeDot={{ r: 5, fill: '#4ade80', stroke: '#0a0f0a', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <p className="font-mono text-[11px] text-slate-700">
                Chart appears after 2+ readings · accumulates every 30s
              </p>
            )}

            {/* Detail stats */}
            <div>
              <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.15em] text-slate-700">Details</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
                {[
                  { lbl: 'Charge Current',   val: `${(srne.chargingCurrent ?? 0).toFixed(2)}A`                                                            },
                  { lbl: 'PV Current',        val: `${(srne.pvCurrent ?? 0).toFixed(2)}A`                                                                  },
                  { lbl: 'Load V / A',        val: `${(srne.loadVoltage ?? 0).toFixed(1)}V / ${(srne.loadCurrent ?? 0).toFixed(2)}A`                       },
                  { lbl: 'Battery Temp',      val: `${srne.batteryTemp ?? '—'}°C`                                                                           },
                  { lbl: 'Batt Range Today',  val: `${(srne.minBattVToday ?? 0).toFixed(1)}–${(srne.maxBattVToday ?? 0).toFixed(1)}V`                      },
                  { lbl: 'Ah Today +/−',      val: `+${srne.chargeAhToday ?? 0} / −${srne.dischargeAhToday ?? 0}`                                          },
                  { lbl: 'Power Today',       val: `${srne.powerGenToday ?? 0}W gen / ${srne.powerConsToday ?? 0}W used`                                   },
                  { lbl: 'Lifetime Ah +/−',   val: `${(srne.totalChargeAh ?? 0).toLocaleString()} / ${(srne.totalDischargeAh ?? 0).toLocaleString()}`      },
                  { lbl: 'History',           val: `${srne.operatingDays ?? 0}d · ${srne.fullCharges ?? 0} full · ${srne.overDischarges ?? 0} over-disch.` },
                ].map(({ lbl, val }) => (
                  <div key={lbl}>
                    <div className="font-mono text-[11px] font-semibold text-slate-200">{val}</div>
                    <div className="text-[9px] uppercase tracking-[0.1em] text-slate-700">{lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Load + firmware */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold ${srne.loadOn ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                <Lightbulb className="h-3 w-3" />
                LOAD {srne.loadOn ? 'ON' : 'OFF'}
                {srne.streetLightOn ? ` · ${srne.brightness ?? 0}%` : ''}
              </span>
              <BatteryCharging className="h-3.5 w-3.5 text-slate-700" />
              <span className="font-mono text-[10px] text-slate-700">
                SW {srne.softwareVersion ?? '—'} · HW {srne.hardwareVersion ?? '—'}
              </span>
              {srne.deviceAddress !== undefined && (
                <span className="font-mono text-[10px] text-slate-700">Addr {srne.deviceAddress}</span>
              )}
            </div>

          </div>
        </div>
      </div>
    </article>
  );
}
