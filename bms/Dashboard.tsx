'use client';

import { useState } from 'react';
import { PackCard } from './components/PackCard';
import { SrneCard } from './components/SrneCard';
import { MOCK_DATA, MOCK_SRNE } from './lib/mock-data';
import type { DataResponse, Pack, SrneReading } from './lib/types';

export default function Dashboard() {
  const [packs, setPacks] = useState<Pack[]>(MOCK_DATA);
  const [srne, setSrne] = useState<SrneReading | null>(MOCK_SRNE);
  const [showFallback, setShowFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchData() {
    setIsLoading(true);

    try {
      const response = await fetch('/api/data', { cache: 'no-store' });
      if (!response.ok) throw new Error('bad response');

      const data: DataResponse = await response.json();
      setPacks(data.packs ?? []);
      setSrne(data.srne ?? null);
      setShowFallback(false);
    } catch {
      setPacks(MOCK_DATA);
      setSrne(MOCK_SRNE);
      setShowFallback(true);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0f1419] px-4 py-8 text-[#e6edf3] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-mono text-lg font-semibold tracking-[0.1em] text-[#e6edf3]">
              DASHBOARD
            </h1>
            <p className="mt-1 font-mono text-[11px] tracking-[0.05em] text-[#8b96a3]">
              live data &middot; fetch on demand &middot; tap a card for detail
            </p>
          </div>

          <button
            type="button"
            onClick={() => void fetchData()}
            disabled={isLoading}
            className="rounded-lg border border-[#2f81f7]/60 bg-[#1f4f8a] px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[#e6edf3] transition hover:bg-[#255c9d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Getting Data...' : 'Get Data'}
          </button>
        </header>

        {showFallback ? (
          <div className="rounded-xl border border-[#d29922]/40 bg-[#d29922]/10 px-4 py-3 font-mono text-xs text-[#d29922]">
            ⚠ no device found at /api/data — showing mock data for design preview
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-2 2xl:grid-cols-3">
          <SrneCard srne={srne} />
        </section>

        <section className="grid grid-cols-3 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
          {packs.map((pack) => (
            <PackCard key={pack.name} pack={pack} />
          ))}
        </section>
      </div>
    </main>
  );
}