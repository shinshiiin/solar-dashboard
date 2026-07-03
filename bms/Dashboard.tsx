'use client';

import { useEffect, useState } from 'react';
import { PackCard } from './components/PackCard';
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
    <main className="min-h-screen bg-[#0f1419] px-4 py-8 text-[#e6edf3] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header>
          <h1 className="font-mono text-lg font-semibold tracking-[0.1em] text-[#e6edf3]">
            DASHBOARD
          </h1>
          <p className="mt-1 font-mono text-[11px] tracking-[0.05em] text-[#8b96a3]">
            live data &middot; refreshes every 2s &middot; tap a card for detail
          </p>
        </header>

        {showFallback ? (
          <div className="rounded-xl border border-[#d29922]/40 bg-[#d29922]/10 px-4 py-3 font-mono text-xs text-[#d29922]">
            ⚠ no device found at /api/data — showing mock data for design preview
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-2 2xl:grid-cols-3">
          {packs.map((pack) => (
            <PackCard key={pack.name} pack={pack} />
          ))}
        </section>
      </div>
    </main>
  );
}