// components/Charts.tsx
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AreaChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { SrneReading } from '../lib/types';

export interface HistoryPoint {
  time: string;
  pvW: number;
  soc: number;
}

interface RawPoint extends HistoryPoint {
  ts: number;
}

const SAMPLE_INTERVAL_MS = 1_000;       // true 1s live sampling
const LIVE_WINDOW_MS = 15 * 60 * 1000;  // last 15 min kept at full 1s resolution
const AGGREGATE_BUCKET_MS = 15_000;     // older data collapses to 15s averages
const POINTS_PER_DAY_CAP = 6_500;       // hard ceiling on the aggregated side

const BASE_PX_PER_POINT = 1.5;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 8;
const ZOOM_STEP = 1.5;
const FOLLOW_EDGE_THRESHOLD_PX = 48;

const TT = {
  contentStyle: { background: '#060c06', border: '1px solid #1a2a1a', borderRadius: 8, fontSize: 11 },
  labelStyle:   { color: '#4b5563' },
  itemStyle:    { color: '#e2e8f0' },
};

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function Charts({
  srne,
  initialHistory,
}: {
  srne: SrneReading | null;
  initialHistory?: HistoryPoint[];
}) {
  // Older-than-15-min data, pre-aggregated into 15s buckets.
  const [dayHistory, setDayHistory] = useState<HistoryPoint[]>(initialHistory ?? []);
  // Last 15 min, raw 1s samples — this is what makes the live edge actually live.
  const [liveHistory, setLiveHistory] = useState<RawPoint[]>([]);

  const [zoom, setZoom] = useState(1);

  const lastTs = useRef<number>(0);
  const lastDayKey = useRef<string>(dayKey(new Date()));
  const pendingBucketRef = useRef<{ start: number; sumPv: number; sumSoc: number; count: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldFollowRef = useRef(true); // start pinned to the live edge
  const zoomAnchorRef = useRef<{ fraction: number; clientOffset: number } | null>(null);

  useEffect(() => {
    if (!srne?.valid) return;
    const now = Date.now();
    if (now - lastTs.current < SAMPLE_INTERVAL_MS) return;
    lastTs.current = now;

    const nowDate = new Date();
    const todayKey = dayKey(nowDate);
    if (todayKey !== lastDayKey.current) {
      lastDayKey.current = todayKey;
      pendingBucketRef.current = null;
      setDayHistory([]);
      setLiveHistory([]);
    }

    const raw: RawPoint = {
      ts: now,
      time: fmtTime(now),
      pvW: srne.chargingPower ?? 0,
      soc: srne.soc ?? 0,
    };

    setLiveHistory(prev => {
      const next = [...prev, raw];
      const cutoff = now - LIVE_WINDOW_MS;

      // Age out anything older than the live window, folding it into
      // the running 15s-bucket average for the day-level history.
      let i = 0;
      const agedOut: RawPoint[] = [];
      while (i < next.length && next[i].ts < cutoff) {
        agedOut.push(next[i]);
        i++;
      }
      if (i > 0) {
        const finished: HistoryPoint[] = [];
        for (const p of agedOut) {
          const bucketStart = Math.floor(p.ts / AGGREGATE_BUCKET_MS) * AGGREGATE_BUCKET_MS;
          const pending = pendingBucketRef.current;
          if (!pending || pending.start !== bucketStart) {
            if (pending) {
              finished.push({
                time: fmtTime(pending.start),
                pvW: pending.sumPv / pending.count,
                soc: pending.sumSoc / pending.count,
              });
            }
            pendingBucketRef.current = { start: bucketStart, sumPv: p.pvW, sumSoc: p.soc, count: 1 };
          } else {
            pending.sumPv += p.pvW;
            pending.sumSoc += p.soc;
            pending.count += 1;
          }
        }
        if (finished.length) {
          setDayHistory(dh => {
            const merged = [...dh, ...finished];
            return merged.length > POINTS_PER_DAY_CAP ? merged.slice(-POINTS_PER_DAY_CAP) : merged;
          });
        }
      }

      return next.slice(i);
    });
  }, [srne]);

  const combined = useMemo(() => [...dayHistory, ...liveHistory], [dayHistory, liveHistory]);

  // Track whether the user is currently near the live (right) edge.
  // Only auto-follow new points if they were already there.
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromRightEdge = el.scrollWidth - (el.scrollLeft + el.clientWidth);
    shouldFollowRef.current = distanceFromRightEdge < FOLLOW_EDGE_THRESHOLD_PX;
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el && shouldFollowRef.current) {
      el.scrollLeft = el.scrollWidth;
    }
  }, [combined.length]);

  // Keep the point under the cursor stationary when zooming via ctrl/cmd+wheel.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !zoomAnchorRef.current) return;
    const { fraction, clientOffset } = zoomAnchorRef.current;
    el.scrollLeft = fraction * el.scrollWidth - clientOffset;
    zoomAnchorRef.current = null;
  }, [zoom]);

  const applyZoom = (factor: number, clientX?: number) => {
    const el = scrollRef.current;
    if (el) {
      const anchorClientX = clientX ?? el.getBoundingClientRect().left + el.clientWidth / 2;
      const contentX = el.scrollLeft + (anchorClientX - el.getBoundingClientRect().left);
      zoomAnchorRef.current = {
        fraction: el.scrollWidth > 0 ? contentX / el.scrollWidth : 0,
        clientOffset: anchorClientX - el.getBoundingClientRect().left,
      };
    }
    setZoom(z => clamp(z * factor, MIN_ZOOM, MAX_ZOOM));
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!(e.ctrlKey || e.metaKey)) return; // let normal trackpad/scroll pass through untouched
    e.preventDefault();
    applyZoom(e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP, e.clientX);
  };

  const jumpToLive = () => {
    shouldFollowRef.current = true;
    setZoom(1);
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollLeft = el.scrollWidth;
    });
  };

  if (combined.length < 2) {
    return (
      <p className="font-mono text-[11px] text-slate-700">
        Chart appears after 2+ readings · live at 1s · resets daily
      </p>
    );
  }

  const chartWidth = Math.max(combined.length * BASE_PX_PER_POINT * zoom, 320);

  return (
    <div className="">
      <div className="flex items-center gap-4 font-mono text-[9px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#e0522f' }} />
          PV
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-[2px]" style={{ background: '#639922' }} />
          SOC
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={() => applyZoom(1 / ZOOM_STEP)} className="px-1.5 py-0.5 border border-slate-800 rounded hover:border-slate-600 hover:text-slate-300">−</button>
          <span className="w-10 text-center tabular-nums">{zoom.toFixed(1)}x</span>
          <button onClick={() => applyZoom(ZOOM_STEP)} className="px-1.5 py-0.5 border border-slate-800 rounded hover:border-slate-600 hover:text-slate-300">+</button>
          <button onClick={jumpToLive} className="ml-1 px-2 py-0.5 border border-slate-800 rounded hover:border-slate-600 hover:text-slate-300">Live</button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onWheel={handleWheel}
        className="overflow-x-auto no-scrollbar"
      >
        <div style={{ width: chartWidth, minWidth: '100%' }}>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={combined} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#e0522f" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#e0522f" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <XAxis dataKey="time" hide />
              {/* left axis: watts */}
              <YAxis yAxisId="power" hide />
              {/* right axis: battery % */}
              <YAxis yAxisId="soc" orientation="right" domain={[0, 100]} hide />

              <Tooltip
                {...TT}
                formatter={(value, name) => {
                  const num = Number(value);
                  return name === 'SOC' ? [`${num.toFixed(0)}%`, name] : [`${num.toFixed(0)}W`, name];
                }}
              />

              <Area
                yAxisId="power"
                type="monotone"
                dataKey="pvW"
                name="PV"
                stroke="#e0522f"
                strokeWidth={2}
                fill="url(#pvGrad)"
                dot={false}
                isAnimationActive={false}
                activeDot={{ r: 4, fill: '#e0522f', stroke: '#0a0f0a', strokeWidth: 2 }}
              />

              <Line
                yAxisId="soc"
                type="monotone"
                dataKey="soc"
                name="SOC"
                stroke="#639922"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                activeDot={{ r: 4, fill: '#639922', stroke: '#0a0f0a', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}