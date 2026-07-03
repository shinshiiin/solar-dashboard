'use client';

import { useEffect, useRef, useState } from 'react';

interface LogEntry {
  receivedAt: number;
  text: string;
}

export function LogsPanel() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch('/api/logs?count=200');
        const data = await res.json();
        if (!cancelled && data.entries) {
          setEntries(data.entries as LogEntry[]);
        }
      } catch (err) {
        console.error('log poll failed', err);
      }
    }

    void poll();
    const interval = window.setInterval(poll, 4000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  async function clearLogs() {
    setIsClearing(true);
    try {
      const res = await fetch('/api/logs', { method: 'DELETE' });
      if (res.ok) {
        setEntries([]);
      } else {
        console.error('Failed to clear logs');
      }
    } catch (err) {
      console.error('clear log request failed', err);
    } finally {
      setIsClearing(false);
    }
  }

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [entries, autoScroll]);

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Device Logs</h2>
          <p className="mt-1 text-sm text-slate-400">Live log output from your BMS device.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex items-center gap-3 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-sky-400 focus:ring-sky-400"
            />
            Auto-scroll
          </label>

          <button
            type="button"
            onClick={clearLogs}
            disabled={isClearing}
            className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isClearing ? 'Clearing…' : 'Clear logs'}
          </button>
        </div>
      </div>

      <div className="min-h-[320px] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-sm leading-6 text-slate-300">
        {entries.length === 0 ? (
          <div className="text-slate-500">Waiting for log data…</div>
        ) : (
          entries.map((entry, index) => {
            const time = new Date(entry.receivedAt).toLocaleTimeString();
            return (
              <div key={index} className="mb-4 last:mb-0">
                <div className="mb-2 text-xs uppercase tracking-[0.18em] text-sky-300">— received {time} —</div>
                <pre className="m-0 whitespace-pre-wrap break-words font-mono text-[13px] text-slate-200">
                  {entry.text}
                </pre>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
    </section>
  );
}
