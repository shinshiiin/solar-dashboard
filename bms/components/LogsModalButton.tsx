"use client";

import { useState } from "react";

type WarningLogEntry = {
  id: string;
  timestamp: string;
  warnings: string[];
  reading: {
    soc?: number;
    batteryVoltage?: number;
    chargingCurrent?: number;
    pvVoltage?: number;
    pvCurrent?: number;
    batteryTemp?: number;
    controllerTemp?: number;
    chargingStateName?: string;
    faultBits?: number;
  };
};

export function LogsModalButton({ logs }: { logs: WarningLogEntry[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="underline">
        Logs
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-[680px] rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-800">SRNE warning logs</h2>
              <button onClick={() => setOpen(false)} className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700">
                Close
              </button>
            </div>

            {logs.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">No warning events have been logged yet.</p>
            ) : (
              <ul className="mt-4 max-h-[60vh] space-y-3 overflow-auto pr-2">
                {logs.map((entry) => (
                  <li key={entry.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-rose-600">{entry.warnings.join(", ")}</p>
                      <p className="text-xs text-slate-500">{entry.timestamp}</p>
                    </div>

                    <div className="mt-2 grid gap-1 text-xs text-slate-600 sm:grid-cols-2">
                      <span>SOC: {entry.reading.soc ?? "N/A"}%</span>
                      <span>Battery voltage: {entry.reading.batteryVoltage ?? "N/A"}V</span>
                      <span>Charging current: {entry.reading.chargingCurrent ?? "N/A"}A</span>
                      <span>PV voltage: {entry.reading.pvVoltage ?? "N/A"}V</span>
                      <span>PV current: {entry.reading.pvCurrent ?? "N/A"}A</span>
                      <span>Battery temp: {entry.reading.batteryTemp ?? "N/A"}°C</span>
                      <span>Controller temp: {entry.reading.controllerTemp ?? "N/A"}°C</span>
                      <span>Status: {entry.reading.chargingStateName ?? "N/A"}</span>
                      <span className="sm:col-span-2">Fault bits: {entry.reading.faultBits ?? "N/A"}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default LogsModalButton;