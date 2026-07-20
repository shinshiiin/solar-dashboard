import type { SrneReading } from '../lib/types';
import { SocRing } from './SocRing';



export function SrneDashboard({ srne }: { srne: SrneReading | null }) {
  const soc           = srne?.soc ?? 0;

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="flex flex-col gap-3 justify-evenly border rounded-2xl p-2">
        
        <div className="flex flex-col">
          <div className="flex justify-between">
            <p className="text-[14px] font-bold">MPPT</p>
            <p className="text-[14px] text-green-500">{srne?.controllerTemp ?? 'N/A'}°C</p>
          </div>

          <div className="flex justify-between">
            <p className="text-[10px] font-bold">Status: <span className="text-amber-300">{srne?.chargingStateName ?? 'N/A'}</span></p>
          </div>
        </div>
        
        
        <div className="grid gap-1 grid-cols-2">
          <p className="col-span-2 text-center">{srne?.chargingPower ?? 'N/A'}w</p>
          <p className="text-center">{srne?.pvVoltage ?? 'N/A'}v</p>
          <p className="text-center">{srne?.pvCurrent ?? 'N/A'}A</p>
          <p className="text-center">{srne?.batteryVoltage ?? 'N/A'}v</p>
          <p className="text-center">{srne?.chargingCurrent ?? 'N/A'}A</p>
        </div>
      </div>

      <div className="">
        <SocRing
          soc={srne?.soc ?? 'N/A'} size="lg"
          // centerTop={srne?.batteryTemp !== undefined ? `${srne.batteryTemp}°C` : undefined}
          // centerBottom={srne?.chargingCurrent !== undefined ? `${srne?.chargingCurrent.toFixed(1)}Ah` : undefined}
        />
      </div>

      {/* <div className="border rounded-2xl">
        <p>Reading: {srne?.soc ?? 'N/A'}</p>
      </div> */}
    </div>
    
  );
}