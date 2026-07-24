import type { SrneReading } from '../lib/types';
import { chargingPowerColor, batTempColor } from '../lib/format';
import { SocRing } from './SocRing';



export function SrneDashboard({ srne }: { srne: SrneReading | null }) {
  const soc           = srne?.soc ?? 0;
  const chargePowerColor = chargingPowerColor(srne?.chargingPower ?? 0);
  const batttempcolor = batTempColor(srne?.batteryTemp ?? 0 );

  return (
    <div className="grid grid-cols-3">

      <div className="flex flex-col gap-1 justify-evenly border rounded-2xl p-2">
        
        <div className="flex flex-col">
          <div className="flex justify-between">
            <p className="text-[10px] font-bold">MPPT</p>
            <p className="text-[10px] text-green-500">{srne?.controllerTemp ?? 0 }°C</p>
          </div>

          <div className="flex justify-between">
            <p className="text-[8px] font-bold">Status: <span className="text-amber-300">{srne?.chargingStateName ?? 'N/A'}</span></p>
          </div>
        </div>
        
        
        <div className="grid gap-0 grid-cols-2">
          
          <div className="flex col-span-2 border-b text-gray-400 text-[8px]">
            <p className=" w-full">Solar</p>
            <p className="text-center text-[8px]" style={{ color:chargePowerColor }}>{srne?.chargingPower ?? 0 }w</p>
          </div>
          <p className="text-left text-[12px]">{srne?.pvVoltage ?? 'N/A'}v</p>
          <p className="text-right text-[12px]">{srne?.pvCurrent ?? 'N/A'}A</p>
          
          <div className="flex col-span-2 border-b text-gray-400 text-[8px]">
            <p className=" w-full">Battery</p>
            <p className="text-center text-[8px]" style={{ color:batttempcolor }}>{srne?.batteryTemp ?? 0 }°C</p>
          </div>
          <p className="text-left text-[12px]">{srne?.batteryVoltage ?? 'N/A'}v</p>
          <p className="text-right text-[12px]">{srne?.chargingCurrent ?? 'N/A'}A</p>
        </div>
      </div>

      <div className="">
        <SocRing
          soc={srne?.soc ?? 0 } size="lg"
          // centerTop={srne?.batteryTemp !== undefined ? `${srne.batteryTemp}°C` : undefined}
          // centerBottom={srne?.chargingCurrent !== undefined ? `${srne?.chargingCurrent.toFixed(1)}Ah` : undefined}
        />
      </div>

      <div className="flex flex-col gap-1 border rounded-2xl p-2">
        
        <div className="flex justify-between item-">
          <p className="text-[10px] font-bold">Load</p>
        </div>
        
        
        <div className="grid gap-0 grid-cols-2">
          
          <div className="flex col-span-2 border-b text-gray-400 text-[8px]">
            <p className=" w-full">Battery</p>
          </div>
          <p className="text-left text-[12px]">{srne?.batteryVoltage ?? 'N/A'}v</p>
          <p className="text-right text-[12px]">{srne?.pvCurrent ?? 'N/A'}A</p>
          
          <div className="flex col-span-2 border-b text-gray-400 text-[8px]">
            <p className=" w-full">AC</p>
          </div>
          <p className="text-left text-[12px]">N/A</p>
          <p className="text-right text-[12px]">N/A</p>
        </div>
      </div>

    </div>
    
  );
}