'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

interface LogEntry {
  receivedAt: number;
  text: string;
}

// Colors pulled from the same instrument-panel palette as the dashboard/sidebar.
const C = {
  bg: '#0a0e13',
  chrome: '#0f1419',
  border: '#2a3441',
  text: '#c9d1d9',
  dim: '#5b6673',
  accent: '#3fb950',
  blue: '#58a6ff',
  warn: '#d29922',
};

function renderLine(line: string, key: number) {
  // Highlight `[Pack N]` tags, and trailing numeric readings (V / A / %).
  const packMatch = line.match(/^(\S+)\|\s*(\[Pack \d+\])?(.*)$/);
  if (!packMatch) {
    return (
      <div key={key} style={{ color: C.text }}>
        {line}
      </div>
    );
  }
  const [, ts, pack, rest] = packMatch;
  return (
    <div key={key} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
      <span style={{ color: C.dim }}>{ts}</span>
      <span style={{ color: C.dim }}> | </span>
      {pack && <span style={{ color: C.blue, fontWeight: 600 }}>{pack}</span>}
      <span style={{ color: C.text }}>{rest}</span>
    </div>
  );
}

export default function LogsPage() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [lastReceived, setLastReceived] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const consoleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch('/api/logs?count=200');
        const data = await res.json();
        if (!cancelled && data.entries) {
          setEntries(data.entries as LogEntry[]);
          if (data.entries.length > 0) {
            setLastReceived(Date.now());
          }
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
      bottomRef.current.scrollIntoView({ block: 'end' });
    }
  }, [entries, autoScroll]);

  // If the user scrolls up manually, drop out of auto-scroll; snap back
  // to the bottom automatically re-engages it.
  function handleScroll() {
    const el = consoleRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
    setAutoScroll(atBottom);
  }

  const isLive = lastReceived !== null && Date.now() - lastReceived < 15000;

  const lineCount = useMemo(
    () => entries.reduce((sum, e) => sum + e.text.split('\\n').length, 0),
    [entries]
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: C.bg,
        fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          border: `1px solid ${C.border}`,
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
        }}
      >
        {/* Terminal titlebar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            background: C.chrome,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f85149' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#d29922' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3fb950' }} />
            </div>
            <span style={{ fontSize: '12px', color: C.dim, letterSpacing: '0.03em' }}>
              ~/daly-bms/serial
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: C.dim }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: isLive ? C.accent : C.dim,
                  boxShadow: isLive ? `0 0 6px ${C.accent}` : 'none',
                }}
                className={isLive ? 'motion-safe:animate-pulse' : undefined}
              />
              {isLive ? 'LIVE' : 'IDLE'}
            </div>

            <label
              style={{
                fontSize: '11px',
                color: C.dim,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
              />
              auto-scroll
            </label>
          </div>
        </div>

        {/* Console body — fixed viewport, internal scroll only */}
        <div
          ref={consoleRef}
          onScroll={handleScroll}
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: '14px 16px',
            fontSize: '12px',
            lineHeight: '1.65',
          }}
        >
          {entries.length === 0 && (
            <div style={{ color: C.dim }}>
              <span style={{ color: C.accent }}>$</span> waiting for device connection&hellip;
            </div>
          )}

          {entries.map((entry, i) => {
            const time = new Date(entry.receivedAt).toLocaleTimeString();
            const lines = entry.text.split('\\n').filter(Boolean);
            return (
              <div key={i} style={{ marginBottom: '8px' }}>
                <div style={{ color: C.warn, fontSize: '10px', marginBottom: '2px', opacity: 0.8 }}>
                  ── batch received {time} ──
                </div>
                {lines.map((line, j) => renderLine(line, j))}
              </div>
            );
          })}

          {autoScroll && entries.length > 0 && (
            <span
              style={{
                display: 'inline-block',
                width: '7px',
                height: '14px',
                background: C.accent,
              }}
              className="motion-safe:animate-pulse"
            />
          )}
          <div ref={bottomRef} />
        </div>

        {/* Status bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '6px 14px',
            background: C.chrome,
            borderTop: `1px solid ${C.border}`,
            fontSize: '10px',
            color: C.dim,
            letterSpacing: '0.04em',
          }}
        >
          <span>{lineCount} lines &middot; {entries.length} batches</span>
          <span>polling every 4s</span>
        </div>
      </div>
    </div>
  );
}