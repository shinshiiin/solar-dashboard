export interface Pack {
  name: string;
  connected: boolean;
  valid: boolean;
  totalVoltage?: number;
  current?: number;
  soc?: number;
  remainingAh?: number;
  maxCell?: number;
  minCell?: number;
  deltaCell?: number;
  cycles?: number;
  chargeMos?: boolean;
  dischargeMos?: boolean;
  ageMs?: number;
  cells?: number[];
  temps?: number[];
}

export interface SrneReading {
  valid: boolean;
  ageMs?: number;
  model?: string;
  softwareVersion?: string;
  hardwareVersion?: string;
  serialNumber?: number;
  deviceAddress?: number;
  maxSystemVoltage?: number;
  ratedChargeCurrent?: number;
  ratedDischargeCurrent?: number;

  soc?: number;
  batteryVoltage?: number;
  chargingCurrent?: number;
  controllerTemp?: number;
  batteryTemp?: number;
  loadVoltage?: number;
  loadCurrent?: number;
  loadPower?: number;
  pvVoltage?: number;
  pvCurrent?: number;
  chargingPower?: number;
  loadOn?: boolean;

  minBattVToday?: number;
  maxBattVToday?: number;
  maxChargeCurrToday?: number;
  maxDischargeCurrToday?: number;
  chargeAhToday?: number;
  dischargeAhToday?: number;
  powerGenToday?: number;
  powerConsToday?: number;

  operatingDays?: number;
  overDischarges?: number;
  fullCharges?: number;
  totalChargeAh?: number;
  totalDischargeAh?: number;
  cumPowerGen?: number;
  cumPowerCons?: number;

  streetLightOn?: boolean;
  brightness?: number;
  chargingState?: number;
  chargingStateName?: string;
  faultBits?: number;
}

export interface DataResponse {
  packs: Pack[];
  srne: SrneReading | null;
  ageMs?: number;
}
