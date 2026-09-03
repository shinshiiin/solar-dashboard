export function socColor(soc: number): string {
  if (soc > 50) return '#639922';
  if (soc > 20) return '#d1a041';
  return '#c47a5f';
}

export function socTextClass(soc: number): string {
  if (soc > 50) return 'text-[#639922]';
  if (soc > 20) return 'text-amber-400';
  return 'text-rose-400';
}

export function chargingPowerColor(chargingPower: number): string {
  if (chargingPower > 2000) return '#639922';
  if (chargingPower > 500) return '#d1a041';
  return '#ee8884';
}

export function chargingPowerTextClass(chargingPower: number): string {
  if (chargingPower > 2000) return 'text-emerald-400';
  if (chargingPower > 500) return 'text-amber-400';
  return 'text-rose-400';
}

export function batTempColor(batteryTemp: number): string {
  if (batteryTemp > 35) return '#ee8884'; 
  if (batteryTemp > 30) return '#d1a041'; 
  return '#639922';                       
}

