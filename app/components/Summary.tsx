import { AlertTriangle } from "lucide-react";
import type { SrneReading, DataResponse } from "../lib/types";
import { decodeSrneFaults } from "../lib/srne-faults";
import { SocRing } from "./SocRing";
import { batTempColor } from "../lib/format";

export default function Summary({
  srne,
  systemSoc,
  totalRemainingAh,
}: {
  srne: SrneReading | null;
  systemSoc: number | null;
  totalRemainingAh: number | null;
}) {
  const batttempcolor = batTempColor(srne?.batteryTemp ?? 0);
  const faults = decodeSrneFaults(srne?.faultBits ?? 0);
  const hasFaults = faults.length > 0;
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 lg:px-30">
      <div className="flex w-full flex-col">
        <div className="grid grid-cols-4 gap-2 justify-evenly py-2 border-b border-[#1e1e1d]">
          <SocRing soc={systemSoc ?? 0} remainingAh={totalRemainingAh ?? 0} />

          <div className="flex flex-col col-span-3 py-2">
            <div className="flex justify-between">
              <p className="text-[11px] lg:text-base">
                Status:{" "}
                <span className="text-[#c47a5f]">
                  {srne?.chargingStateName ?? "N/A"}
                </span>
              </p>
              <p className="text-[11px] text-[#639922] lg:text-base">
                {srne?.controllerTemp ?? 0}°C
              </p>
            </div>

            <div className="flex justify-between">
              <div className="flex gap-1 items-center text-[10px] lg:text-base">
                {hasFaults && (
                  <AlertTriangle className="h-3 w-3 text-rose-400 items-center animate-blink" />
                )}
                {hasFaults && (
                  <div className="flex flex-wrap gap-1.5">
                    {faults.slice(0, 2).map((f) => (
                      <span
                        key={f}
                        className="text-[8px] font-semibold text-rose-400 lg:text-base"
                      >
                        {f}
                      </span>
                    ))}
                    {faults.length > 2 && (
                      <span className="text-[8px] text-rose-500 lg:text-base">
                        +{faults.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>
              <p
                className="text-center text-[11px] lg:text-base"
                style={{ color: batttempcolor }}
              >
                {srne?.batteryTemp ?? 0}°C
              </p>
            </div>

            <div className="flex justify-between border-b border-[#1e1e1d] pb-1">
              <p className="text-[10px] text-[#7a7a78]"></p>
            </div>

            <div className="flex justify-between pt-1">
              <p className="text-[8px] text-[#7a7a78] lg:text-base">
                Today Gen: {srne?.chargeAhToday ?? 0}Ah
              </p>
              <p className="text-[8px] text-[#7a7a78] lg:text-base">
                Power Today: {srne?.powerGenToday ?? 0}W
              </p>
              <p className="text-[8px] text-[#7a7a78] lg:text-base">
                Total Gen: {srne?.totalChargeAh ?? 0}Ah
              </p>
            </div>

            <div className="flex justify-between">
              <p className="text-[8px] text-[#7a7a78] lg:text-base">
                Min/Max Batt: {srne?.minBattVToday ?? 0}v /{" "}
                {srne?.maxBattVToday ?? 0}v
              </p>
              <p className="text-[8px] text-[#7a7a78] lg:text-base">
                Uptime: {srne?.operatingDays ?? 0}d
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
