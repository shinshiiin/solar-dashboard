'use client';

import { useEffect, useState } from 'react';
import { PackCard } from './components/PackCard';
import { LogsPanel } from './components/LogsPanel';
import { MOCK_DATA } from './lib/mock-data';
import type { DataResponse, Pack } from './lib/types';

export default function Dashboard() {
  const [packs, setPacks] = useState<Pack[]>(MOCK_DATA);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    async function poll() {
      try {
        const response = await fetch('/api/data', { cache: 'no-store' });
        if (!response.ok) throw new Error('bad response');

        const data: DataResponse = await response.json();
        setPacks(data.packs ?? []);
        setShowFallback(false);
      } catch {
        setPacks(MOCK_DATA);
        setShowFallback(true);
      }
    }

    void poll();
    const interval = window.setInterval(() => {
      void poll();
    }, 2000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_35%),linear-gradient(180deg,_#020617,_#0f172a)] px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">Solar BMS Monitor</h1>
          <p className="mt-1 text-sm text-slate-400">Live data · refreshes every 2 seconds</p>
        </header>

        {showFallback ? (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            ⚠ No device found at /api/data — showing mock data for design preview.
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="grid gap-6 xl:grid-cols-2 2xl:grid-cols-3">
            {packs.map((pack) => (
              <PackCard key={pack.name} pack={pack} />
            ))}
          </section>

          <LogsPanel />
        </div>
      </div>
    </main>
  );
}
