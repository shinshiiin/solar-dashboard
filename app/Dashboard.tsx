"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Summary from "./components/Summary";
import Details from "./components/Details";
import Charts from "./components/Charts";
import PackCard from "./components/PackCard";
import type { SrneReading, DataResponse } from "./lib/types";

const POLL_MS = 1_000;

export default function Dashboard() {
  const [packs, setPacks] = useState<DataResponse["packs"]>([]);
  const [srne, setSrne] = useState<SrneReading | null>(null);
  const [systemSoc, setSystemSoc] = useState<number | null>(null);
  const [totalRemainingAh, setTotalRemainingAh] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/data", { cache: "no-store" });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data: DataResponse = await res.json();

      setPacks(data.packs ?? []);
      setSrne(data.srne ?? null);
      setSystemSoc(data.systemSoc ?? null);
      setTotalRemainingAh(data.totalRemainingAh ?? null);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();

    timerRef.current = setInterval(fetchData, POLL_MS);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [fetchData]);
  return (
    <main className="flex flex-col">
      <section>
        <Summary
          srne={srne}
          systemSoc={systemSoc}
          totalRemainingAh={totalRemainingAh}
        />
      </section>

      <section>
        <Details srne={srne} />
      </section>

      <section>
        <Charts />
      </section>

      {/* <div className="pt-2 px-6 grid grid-cols-[minmax(50px,1fr)_45px_56px_47px_35px_38px] items-center [&>*+*]:flex [&>*+*]:items-center [&>*+*]:justify-center [&>*+*]:self-stretch [&>*+*]:border-l [&>*+*]:border-white/10 [&>*+*]:px-1">
        <span className="text-[10px] pl-5">Name</span>
        <span className="text-[10px]">SOC</span>
        <span className="text-[10px]">Current</span>
        <span className="text-[10px]">Voltage</span>
        <span className="text-[10px]">Temp</span>
        <span className="text-[10px]">Health</span>
      </div> */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 px-4 py-2 lg:px-30">
        
        {packs.map((pack) => (
          <PackCard key={pack.name} pack={pack} />
        ))}
      </section>
    </main>
  );
}
