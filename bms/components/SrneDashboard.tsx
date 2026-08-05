import { Sun, Zap, Thermometer, ChevronDown, BatteryCharging, Lightbulb, AlertTriangle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { SrneReading } from '../lib/types';
import { chargingPowerColor, batTempColor } from '../lib/format';
import { SocRing } from './SocRing';
import { decodeSrneFaults } from '../lib/srne-faults';
import { LogsModalButton } from './LogsModalButton';

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

export function SrneDashboard({ srne }: { srne: SrneReading | null }) {
  const [warningLogs, setWarningLogs] = useState<WarningLogEntry[]>([]);
  const previousWarningsRef = useRef<string[]>([]);
  const soc           = srne?.soc ?? 0;
  const chargePowerColor = chargingPowerColor(srne?.chargingPower ?? 0);
  const batttempcolor = batTempColor(srne?.batteryTemp ?? 0 );
  const faults        = decodeSrneFaults(srne?.faultBits ?? 0);
  const hasFaults     = faults.length > 0;

  const seededRef = useRef(false);

  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    fetch('/api/warnings?count=100')
      .then((res) => res.json())
      .then((data) => {
        if (data.entries) setWarningLogs(data.entries);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const activeWarnings = decodeSrneFaults(srne?.faultBits ?? 0);
    const previousWarnings = previousWarningsRef.current;
    const hasNewWarnings = activeWarnings.some((warning) => !previousWarnings.includes(warning));

    if (activeWarnings.length > 0 && hasNewWarnings) {
      const entry: WarningLogEntry = {
        id: `${Date.now()}-${activeWarnings.join('-')}`,
        timestamp: new Date().toLocaleString(),
        warnings: activeWarnings,
        reading: {
          soc: srne?.soc ?? 0,
          batteryVoltage: srne?.batteryVoltage,
          chargingCurrent: srne?.chargingCurrent,
          pvVoltage: srne?.pvVoltage,
          pvCurrent: srne?.pvCurrent,
          batteryTemp: srne?.batteryTemp,
          controllerTemp: srne?.controllerTemp,
          chargingStateName: srne?.chargingStateName,
          faultBits: srne?.faultBits,
        },
      };

      setWarningLogs((prev) => [entry, ...prev]);
    }

    previousWarningsRef.current = activeWarnings;
  }, [srne?.faultBits, srne?.soc, srne?.batteryVoltage, srne?.chargingCurrent, srne?.pvVoltage, srne?.pvCurrent, srne?.batteryTemp, srne?.controllerTemp, srne?.chargingStateName]);

  return (
    <div className="flex flex-col">

      <div className="grid grid-cols-4 gap-3.5 justify-evenly py-2 border-b border-[#1e1e1d]">
        <SocRing
          soc={srne?.soc ?? 0 } size="sm"
        />

        <div className="flex flex-col col-span-3 py-2">
          <div className="flex justify-between">
            <p className="text-[11px]">MPPT</p>
            <p className="text-[11px] text-[#639922]">{srne?.controllerTemp ?? 0 }°C</p>
          </div>

          <div className="flex justify-between">
            <p className="text-[11px]">Status: <span className="text-[#c47a5f]">{srne?.chargingStateName ?? 'N/A'}</span></p>
            <p className="text-center text-[11px]" style={{ color:batttempcolor }}>{srne?.batteryTemp ?? 0 }°C</p>
          </div>

          <div className="flex justify-between border-b border-[#1e1e1d] pb-1">
            <p className="text-[10px] text-[#7a7a78]"></p>
            <p className="text-[10px] text-[#7a7a78]"><LogsModalButton logs={warningLogs} /></p>
          </div>

          <div className="flex justify-between pt-1">
            <p className="text-[8px] text-[#7a7a78]">Today Gen: {srne?.chargeAhToday ?? 0}Ah</p>
            <p className="text-[8px] text-[#7a7a78]">Power Today: {srne?.powerGenToday ?? 0}W</p>
            <p className="text-[8px] text-[#7a7a78]">Total Gen: {srne?.totalChargeAh ?? 0}Ah</p>
          </div>

          <div className="flex justify-between">
            <p className="text-[8px] text-[#7a7a78]">Min/Max Batt: {srne?.minBattVToday ?? 0}v / {srne?.maxBattVToday ?? 0}v</p>
            <p className="text-[8px] text-[#7a7a78]">Uptime: {srne?.operatingDays ?? 0}d</p>
          </div>

          
        </div>
        
      </div>

      <div className="grid grid-cols-2 py-4 ">
        
        <div className="grid gap-y-2 gap-x-4 grid-cols-2 border-r border-[#1e1e1d] pr-4">

          <div className="grid col-span-2 w-[40%] border-b border-[#1e1e1d] pb-1">
            <p className="text-[11px]">Input</p>
          </div>
          
          <div className="flex flex-col text-[#7a7a78] ">
            <p className="w-full text-[8px]">PV Power</p>
            <p className="text-[16px]" style={{ color:chargePowerColor }}>{srne?.chargingPower ?? 0 }w</p>
          </div>

          <div className="flex flex-col text-[#7a7a78]">
            <p className="w-full text-[8px]">PV Voltage</p>
            <p className="text-[16px] text-[#f2f2f0]">{srne?.pvVoltage ?? 'N/A'}v</p>
          </div>

          <div className="flex flex-col text-[#7a7a78] ">
            <p className="w-full text-[8px]">PV Current</p>
            <p className="text-[16px] text-[#f2f2f0]">{srne?.pvCurrent ?? 'N/A'}A</p>
          </div>

          <div className="flex flex-col text-[#7a7a78] ">
            <p className="w-full text-[8px]">Battery Voltage</p>
            <p className="text-left text-[16px] text-[#f2f2f0]">{srne?.batteryVoltage ?? 'N/A'}v</p>
          </div>

          <div className="flex flex-col text-[#7a7a78] ">
            <p className="w-full text-[8px]">Charging Current</p>
            <p className="text-[16px] text-[#f2f2f0]">{srne?.chargingCurrent ?? 'N/A'}A</p>
          </div>

          <div className="flex flex-col text-[#7a7a78] ">
            <p className="w-full text-[8px]">Warnings</p>
            <p className="text-[16px]">{hasFaults && <AlertTriangle className="h-4 w-4 text-rose-400" />}{hasFaults && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {faults.slice(0, 2).map(f => (
                  <span key={f} className="rounded-full bg-rose-500/15 px-2.5 py-1 font-mono text-[10px] font-semibold text-rose-400">{f}</span>
                ))}
                {faults.length > 2 && (
                  <span className="rounded-full bg-rose-500/10 px-2.5 py-1 font-mono text-[10px] text-rose-500">+{faults.length - 2} more</span>
                )}
              </div>
             )}
            </p>
          </div>

        </div>

        <div className="grid gap-y-2 gap-x-4 grid-cols-2 pl-4">

          <div className="grid col-span-2 w-[40%] border-b border-[#1e1e1d] pb-1">
            <p className="text-[11px]">Output</p>
          </div>
          
          <div className="flex flex-col text-[#7a7a78] ">
            <p className="w-full text-[8px]">Discharge Current</p>
            <p className="text-[16px] text-[#f2f2f0]">-</p>
          </div>

          <div className="flex flex-col text-[#7a7a78] ">
            <p className="w-full text-[8px]">AC Watts</p>
            <p className="text-[16px] text-[#f2f2f0]">-</p>
          </div>

          <div className="flex flex-col text-[#7a7a78] ">
            <p className="w-full text-[8px]">AC Current</p>
            <p className="text-[16px] text-[#f2f2f0]">-</p>
          </div>

          <div className="flex flex-col text-[#7a7a78] ">
            <p className="w-full text-[8px]">AC Voltage</p>
            <p className="text-left text-[16px] text-[#f2f2f0]">220v</p>
          </div>

          <div className="flex flex-col text-[#7a7a78] ">
            <p className="w-full text-[8px]">Frequency</p>
            <p className="text-[16px] text-[#f2f2f0]">60hz</p>
          </div>

          <div className="flex flex-col text-[#7a7a78] ">
            <p className="w-full text-[8px]">Warnings</p>
            <p className="text-[16px] text-[#f2f2f0]">-</p>
          </div>

        </div>

      </div>

    </div>
    
  );
}