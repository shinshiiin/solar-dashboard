// components/Charts.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { SrneReading } from '../lib/types';

export interface HistoryPoint {
  time: string;
  pvW: number;
  loadW: number;
  soc: number;
}

const MAX_HISTORY = 144;
const SAMPLE_INTERVAL_MS = 10_000;

const TT = {
  contentStyle: { background: '#060c06', border: '1px solid #1a2a1a', borderRadius: 8, fontSize: 11 },
  labelStyle:   { color: '#4b5563' },
  itemStyle:    { color: '#e2e8f0' },
};

export function Charts({
  srne,
  initialHistory,
}: {
  srne: SrneReading | null;
  initialHistory?: HistoryPoint[];
}) {
  const [history, setHistory] = useState<HistoryPoint[]>(initialHistory ?? []);
  const lastTs = useRef<number>(0);

  useEffect(() => {
    if (!srne?.valid) return;
    const now = Date.now();
    if (now - lastTs.current < SAMPLE_INTERVAL_MS) return;
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

  if (history.length < 2) {
    return (
      <p className="font-mono text-[11px] text-slate-700">
        Chart appears after 2+ readings · accumulates every 30s
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* PV vs Load */}
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
  );
}