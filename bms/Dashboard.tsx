'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PackCard } from './components/PackCard';
import { SrneCard } from './components/SrneCard';
import { SocRing } from './components/SocRing';
import { MOCK_DATA, MOCK_SRNE } from './lib/mock-data';
import type { DataResponse, Pack, SrneReading } from './lib/types';

const POLL_MS = 30_000;

export default function Dashboard() {
  const [packs,        setPacks]        = useState<Pack[]>(MOCK_DATA);
  const [srne,         setSrne]         = useState<SrneReading | null>(MOCK_SRNE);
  const [showFallback, setShowFallback] = useState(false);
  const [ageMs,        setAgeMs]        = useState<number | null>(null);
  const [lastPolled,   setLastPolled]   = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/data');
      if (!res.ok) throw new Error('bad response');
      const data: DataResponse = await res.json();
      setPacks(data.packs ?? []);
      setSrne(data.srne   ?? null);
      setAgeMs(data.ageMs ?? null);
      setLastPolled(new Date());
      setShowFallback(false);
    } catch {
      setPacks(MOCK_DATA);
      setSrne(MOCK_SRNE);
      setShowFallback(true);
    }
  }, []);

  useEffect(() => {
    void fetchData();
    timerRef.current = setInterval(() => { void fetchData(); }, POLL_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [fetchData]);

  const isStale  = ageMs !== null && ageMs > 90_000;
  const ageLabel = ageMs === null
    ? 'waiting for device…'
    : isStale
      ? `device last seen ${Math.round(ageMs / 60_000)}m ago`
      : `data ${Math.round(ageMs / 1000)}s old`;

  return (
    <main className="min-h-screen bg-[#060c06] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">

        {/* Header */}
        <header className="flex items-end justify-between">
          <div>
            <h1 className="font-mono text-sm font-semibold tracking-[0.15em] text-slate-100">DASHBOARD</h1>
            <p className={`mt-0.5 font-mono text-[9px] tracking-[0.05em] ${isStale ? 'text-amber-400' : 'text-slate-700'}`}>
              {ageLabel}{lastPolled ? ` · ${lastPolled.toLocaleTimeString()}` : ''}
            </p>
          </div>
          <button
            onClick={() => void fetchData()}
            className="rounded-lg border border-[#1a2a1a] bg-[#0d140d] px-3 py-1.5 font-mono text-[9px] text-slate-600 hover:border-emerald-500/30 hover:text-emerald-400 transition-colors"
          >
            Refresh
          </button>
        </header>

        {/* Fallback */}
        {showFallback && (
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-2.5 font-mono text-[11px] text-amber-400">
            ⚠ No device data — showing mock data
          </div>
        )}

        {/* Pack SOC rings */}
        <section>
          <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.15em] text-slate-700">Battery packs</p>
          <div className="grid grid-cols-3 gap-4">
            {packs.map(pack => (
              <div key={pack.name} className="flex flex-col items-center gap-1.5">
                {pack.connected && pack.valid ? (
                  <SocRing
                    soc={pack.soc ?? 0}
                    sublabel={pack.name}
                    centerTop={(pack.temps?.[0] ?? null) !== null ? `${pack.temps![0]}°C` : undefined}
                    centerBottom={`${(pack.remainingAh ?? 0).toFixed(0)}Ah`}
                  />
                ) : (
                  <div className="aspect-square w-full flex items-center justify-center rounded-full border-2 border-dashed border-[#1a2a1a]">
                    <span className="font-mono text-[10px] text-rose-500 text-center px-2">
                      {pack.connected ? 'No data' : 'Offline'}
                    </span>
                  </div>
                )}
                <span className="font-mono text-[9px] text-slate-700">{pack.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* SRNE */}
        <section>
          <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.15em] text-slate-700">Solar controller</p>
          <SrneCard srne={srne} />
        </section>

        {/* Pack cards */}
        <section>
          <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.15em] text-slate-700">Pack detail</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {packs.map(pack => <PackCard key={pack.name} pack={pack} />)}
          </div>
        </section>

      </div>
    </main>
  );
}
