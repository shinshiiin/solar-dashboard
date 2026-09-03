import { AlertTriangle } from "lucide-react";
import type { SrneReading, DataResponse } from "../lib/types";
import { decodeSrneFaults } from "../lib/srne-faults";
import { chargingPowerColor } from "../lib/format";

export default function Details({ srne }: { srne: SrneReading | null }) {
  const chargePowerColor = chargingPowerColor(srne?.chargingPower ?? 0);
  const faults = decodeSrneFaults(srne?.faultBits ?? 0);
  const hasFaults = faults.length > 0;
  return (
    <div className="grid grid-cols-2 py-4 px-4 lg:px-30">
      <div className="grid gap-y-2 gap-x-4 grid-cols-2 border-r border-[#1e1e1d] pr-4">
        <div className="grid col-span-2 w-[40%] border-b border-[#1e1e1d] pb-1">
          <p className="text-[11px] lg:text-base">Input</p>
        </div>

        <div className="flex flex-col text-[#7a7a78] ">
          <p className="w-full text-[8px] lg:text-base">PV Power</p>
          <p className="text-[16px]" style={{ color: chargePowerColor }}>
            {srne?.chargingPower ?? 0}w
          </p>
        </div>

        <div className="flex flex-col text-[#7a7a78]">
          <p className="w-full text-[8px] lg:text-base">PV Voltage</p>
          <p className="text-[16px] text-[#f2f2f0]">
            {srne?.pvVoltage ?? "N/A"}v
          </p>
        </div>

        <div className="flex flex-col text-[#7a7a78] ">
          <p className="w-full text-[8px] lg:text-base">PV Current</p>
          <p className="text-[16px] text-[#f2f2f0]">
            {srne?.pvCurrent ?? "N/A"}A
          </p>
        </div>

        <div className="flex flex-col text-[#7a7a78] ">
          <p className="w-full text-[8px] lg:text-base">Battery Voltage</p>
          <p className="text-left text-[16px] text-[#f2f2f0]">
            {srne?.batteryVoltage ?? "N/A"}v
          </p>
        </div>

        <div className="flex flex-col text-[#7a7a78] ">
          <p className="w-full text-[8px] lg:text-base">Charging Current</p>
          <p className="text-[16px] text-[#f2f2f0]">
            {srne?.chargingCurrent ?? "N/A"}A
          </p>
        </div>

        <div className="flex flex-col text-[#7a7a78] ">
          <p className="w-full text-[8px] lg:text-base">Warnings</p>
          <div className="text-[11px]">
            {hasFaults && <AlertTriangle className="h-4 w-4 text-rose-400" />}
          </div>
        </div>
      </div>

      <div className="grid gap-y-2 gap-x-4 grid-cols-2 pl-4">
        <div className="grid col-span-2 w-[40%] border-b border-[#1e1e1d] pb-1">
          <p className="text-[11px] lg:text-base">Output</p>
        </div>

        <div className="flex flex-col text-[#7a7a78] ">
          <p className="w-full text-[8px] lg:text-base">Discharge Current</p>
          <p className="text-[16px] text-[#f2f2f0]">-</p>
        </div>

        <div className="flex flex-col text-[#7a7a78] ">
          <p className="w-full text-[8px] lg:text-base">AC Watts</p>
          <p className="text-[16px] text-[#f2f2f0]">-</p>
        </div>

        <div className="flex flex-col text-[#7a7a78] ">
          <p className="w-full text-[8px] lg:text-base">AC Current</p>
          <p className="text-[16px] text-[#f2f2f0]">-</p>
        </div>

        <div className="flex flex-col text-[#7a7a78] ">
          <p className="w-full text-[8px] lg:text-base">AC Voltage</p>
          <p className="text-left text-[16px] text-[#f2f2f0]">220v</p>
        </div>

        <div className="flex flex-col text-[#7a7a78] ">
          <p className="w-full text-[8px] lg:text-base">Frequency</p>
          <p className="text-[16px] text-[#f2f2f0]">60hz</p>
        </div>

        <div className="flex flex-col text-[#7a7a78] ">
          <p className="w-full text-[8px] lg:text-base">Warnings</p>
          <p className="text-[16px] text-[#f2f2f0]">-</p>
        </div>
      </div>
    </div>
  );
}
