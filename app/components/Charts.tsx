"use client";

import { useEffect, useRef, useState } from "react";
import { Line, Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";

type HistoryEntry = {
  id: string;
  timestamp: number;
  pvPower: number;
  soc: number;
  remainingAh: number;
};

type ChartPoint = {
  time: string;
  power: number;
  soc: number;
  remainingAh: number;
};

export default function Charts() {
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
const scrollRef = useRef<HTMLDivElement | null>(null);

  const ZOOM_STEP = 1.25;
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 20;


  const [zoom, setZoom] = useState(1);

  function applyZoom(multiplier: number) {
    setZoom((currentZoom) => {
      const nextZoom = currentZoom * multiplier;

      return Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, nextZoom)
      );
    });
  }

  function jumpToLive() {
    scrollRef.current?.scrollTo({
      left: scrollRef.current.scrollWidth,
      behavior: "smooth"
    });
  }

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      try {
        const response = await fetch("/api/history", {
          cache: "no-store"
        });

        if (!response.ok) return;

        const history: HistoryEntry[] = await response.json();

        const formattedHistory: ChartPoint[] = [...history].reverse().map(
          (entry) => ({
            time: new Date(entry.timestamp).toLocaleTimeString("en-PH", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false
            }),
            power: entry.pvPower,
            soc: entry.soc,
            remainingAh: entry.remainingAh
          })
        );

        if (!cancelled) {
          setChartData(formattedHistory);
        }
      } catch (error) {
        console.error("Could not load solar history", error);
      }
    }

    loadHistory();

    const intervalId = window.setInterval(loadHistory, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="px-4 lg:px-30">
      <div className="flex items-center gap-4 text-[9px] text-slate-500 lg:text-base">
        <span className="flex items-center gap-1">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: "#e0522f" }}
          />
          PV
        </span>
        <span className="flex items-center gap-1">
          <span
            className="inline-block w-2 h-[2px]"
            style={{ background: "#639922" }}
          />
          SOC
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={() => applyZoom(1 / ZOOM_STEP)} className="px-1.5 py-0.5 border border-slate-800 rounded hover:border-slate-600 hover:text-slate-300">−</button>
          <span className="w-10 text-center tabular-nums">{zoom.toFixed(1)}x</span>
          <button onClick={() => applyZoom(ZOOM_STEP)} className="px-1.5 py-0.5 border border-slate-800 rounded hover:border-slate-600 hover:text-slate-300">+</button>
          <button onClick={jumpToLive} className="ml-1 px-2 py-0.5 border border-slate-800 rounded hover:border-slate-600 hover:text-slate-300">Live</button>
        </div>
      </div>
      <div ref={scrollRef} className="overflow-x-auto scrollbar-none">
        <div
          className="h-[120px]"
          style={{
              width: `${zoom * 100}%`,
              minWidth: `${zoom * 100}%`
          }}
        >
          <ResponsiveContainer width="100%" height={120} >
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#e0522f" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#e0522f" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <defs>
                <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#e0522f" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#e0522f" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <YAxis
                yAxisId="soc"
                domain={[0, 100]}
                ticks={[0, 20, 40, 60, 80, 100]}
                hide={true}
              />
              <YAxis
                yAxisId="power"
                domain={[0, "auto"]}
                hide={true}
              />
              <Line 
              type="monotone" 
              dataKey="soc" 
              name="SOC"
              stroke="#639922" 
              strokeWidth={2}
              dot={false}
              yAxisId="soc"
              />
              <Area 
              type="monotone" 
              dataKey="power" 
              name="PV"
              stroke="#e0522f"
              fill="url(#pvGrad)" 
              strokeWidth={2}
              dot={false}
              yAxisId="power"
              baseValue={0}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid #334155",
                  borderRadius: "8px"
                }}
                  labelStyle={{ color: "#94a3b8"
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
