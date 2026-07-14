'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PackCard } from './components/PackCard';
import { SrneCard } from './components/SrneCard';
import { MOCK_DATA, MOCK_SRNE } from './lib/mock-data';
import type { DataResponse, Pack, SrneReading } from './lib/types';
import { decodeSrneFaults } from './lib/srne-faults';

const POLL_INTERVAL_MS = 30_000; // match ESP32 push interval

export default function Dashboard() {
  const [packs, setPacks] = useState<Pack[]>(MOCK_DATA);
  const [srne, setSrne] = useState<SrneReading | null>(MOCK_SRNE);
  const [showFallback, setShowFallback] = useState(false);
  const [ageMs, setAgeMs] = useState<number | null>(null);
  const [lastPolled, setLastPolled] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // No /api/refresh call needed — ESP32 pushes on its own schedule now.
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('bad response');

      const data: DataResponse = await response.json();
      setPacks(data.packs ?? []);
      setSrne(data.srne ?? null);
      setAgeMs(data.ageMs ?? null);
      setLastPolled(new Date());
      setShowFallback(false);
    } catch {
      setPacks(MOCK_DATA);
      setSrne(MOCK_SRNE);
      setShowFallback(true);
    }
  }, []);

  // Poll on mount and every 30s. Cleans up on unmount.
  useEffect(() => {
    void fetchData();
    timerRef.current = setInterval(() => { void fetchData(); }, POLL_INTERVAL_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [fetchData]);

  const ageLabel = ageMs !== null
    ? ageMs > 90_000
      ? `device last seen ${Math.round(ageMs / 60000)}m ago`
      : `device data ${Math.round(ageMs / 1000)}s old`
    : 'waiting for device…';

  const ageColor = ageMs !== null && ageMs > 90_000 ? 'text-[#d29922]' : 'text-[#8b96a3]';

  const faults = srne?.faultBits ? decodeSrneFaults(srne.faultBits) : [];
  const hasFaults = faults.length > 0;
  return (
    <main className="min-h-screen bg-[#0f1419] px-4 py-8 text-[#e6edf3] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-mono text-lg font-semibold tracking-[0.1em] text-[#e6edf3]">
              DASHBOARD
            </h1>
            <p className={`mt-1 font-mono text-[11px] tracking-[0.05em] ${ageColor}`}>
              {ageLabel}
              {lastPolled ? ` · checked ${lastPolled.toLocaleTimeString()}` : ''}
            </p>
          </div>
        </header>

        {showFallback ? (
          <div className="rounded-xl border border-[#d29922]/40 bg-[#d29922]/10 px-4 py-3 font-mono text-xs text-[#d29922]">
            ⚠ no device found at /api/data — showing mock data for design preview
          </div>
        ) : null}

        <section className="flex flex-row gap-6 ">
          
          <div className="flex grow flex-col gap-2 bg-[#101826] rounded-3xl p-4 border border-white/5">

            <div className="flex justify-between border-b border-[#1D293D] pb-2">

              {/* SRNE MPPT Info */}
              <div>
                  <h3 className="text-sm font-semibold">
                      SRNE MPPT
                  </h3>
                  <p className="text-xs">
                      Status:  
                      <span className="text-green-400 mt-1 ml-1">
                        {srne?.chargingStateName ?? '—'}
                      </span>
                  </p>
              </div>

              {/* SRNE Faults */}
              <div className="flex items-center gap-2">
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
              </div>
              
              {/* SRNE Temperature */}
              <div className="flex items-center gap-2">
                  <span className="text-xl font-semibold">
                      {srne?.controllerTemp ?? '—'}°C
                  </span>
              </div>

            </div>

            {/* Circled Percentage */}
            <div className="flex mx-20">  

              {/* Circled Percentage + Pack rings */}
              <div className="flex gap-4 mt-4 px-4">

                {/* SRNE SOC — centre/larger */}
                <div className="flex-[2] aspect-square relative max-w-[200px] mx-auto">
                  <svg className="w-full h-full -rotate-90" viewBox="-10 -10 120 120">
                    <circle cx="50" cy="50" r={45} fill="none" stroke="#1e2e1e" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r={45}
                      fill="none"
                      stroke={(() => { const s = srne?.soc ?? 0; return s > 50 ? '#4ade80' : s > 20 ? '#d29922' : '#f85149'; })()}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 45}
                      strokeDashoffset={2 * Math.PI * 45 * (1 - (srne?.soc ?? 0) / 100)}
                      style={{ transition: 'stroke-dashoffset 0.6s ease', filter: 'drop-shadow(0 0 6px #4ade80)' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                    <span className="text-[clamp(8px,1.8vw,13px)] text-gray-300">{srne?.batteryTemp ?? '—'}°C</span>
                    <span className="text-[clamp(20px,4vw,40px)] font-bold text-green-400 leading-none">
                      {(srne?.soc ?? 0).toFixed(0)}%
                    </span>
                    <span className="text-[clamp(8px,1.5vw,12px)] ">
                      {srne?.chargingCurrent?.toFixed(1) ?? '—'}A
                    </span>
                  </div>
                </div>

              </div>
            </div> 
            
            {/* Blocks */}
            <div className="flex mt-4">  
              
              {/* <div className="flex-1 aspect-square relative">

              </div>
              <div className="flex-1 aspect-square relative">

              </div>
              <div className="flex-1 aspect-square relative">

              </div> */}
              
              
            </div>

          </div>
        </section>
        <section className="flex flex-col gap-4 xl:grid-cols-2 2xl:grid-cols-3">
          {packs.map((pack) => (
            <PackCard key={pack.name} pack={pack} />
          ))}
        </section>

      </div>
    </main>
  );
}