'use client';

import { useEffect, useRef, useState } from 'react';

interface LogEntry {
  receivedAt: number;
  text: string;
}

export default function LogsPage() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
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

    poll();
    const interval = setInterval(poll, 4000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [entries, autoScroll]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0d1117',
        color: '#c9d1d9',
        fontFamily: 'ui-monospace, "SF Mono", Consolas, monospace',
        padding: '20px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '16px', fontWeight: 600, color: '#e6edf3', margin: 0 }}>
          Device Logs
        </h1>
        <label style={{ fontSize: '12px', color: '#8b96a3', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
          />
          Auto-scroll
        </label>
      </div>

      <div
        style={{
          background: '#161b22',
          border: '1px solid #2a3441',
          borderRadius: '8px',
          padding: '16px',
          fontSize: '12px',
          lineHeight: '1.6',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        {entries.length === 0 && (
          <div style={{ color: '#8b96a3' }}>Waiting for log data&hellip;</div>
        )}
        {entries.map((entry, i) => {
          const time = new Date(entry.receivedAt).toLocaleTimeString();
          // Each entry.text is a batch of lines already separated by \n
          // (escaped as \n before the ESP32 sent it, so this splits cleanly).
          return (
            <div key={i} style={{ marginBottom: '10px' }}>
              <div style={{ color: '#58a6ff', marginBottom: '2px' }}>
                — received {time} —
              </div>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {entry.text}
              </pre>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}