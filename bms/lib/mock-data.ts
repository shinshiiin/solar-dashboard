import type { Pack, SrneReading } from './types';
import type { HistoryPoint } from '../components/Charts';

export const MOCK_SRNE: SrneReading = {
  valid: true,
  ageMs: 1200,
  model: 'MPPT',
  softwareVersion: 'V03.02.01',
  hardwareVersion: 'V01.02.03',
  serialNumber: 251659519,
  deviceAddress: 1,
  maxSystemVoltage: 24,
  ratedChargeCurrent: 30,
  ratedDischargeCurrent: 30,

  soc: 20,
  batteryVoltage: 55.2,
  chargingCurrent: 70.2,
  controllerTemp: 50,
  batteryTemp: 25,
  loadVoltage: 25.3,
  loadCurrent: 2.0,
  loadPower: 51,
  pvVoltage: 199.6,
  pvCurrent: 50.8,
  chargingPower: 4400,
  loadOn: true,

  minBattVToday: 23.9,
  maxBattVToday: 26.1,
  maxChargeCurrToday: 5.4,
  maxDischargeCurrToday: 2.6,
  chargeAhToday: 38,
  dischargeAhToday: 22,
  powerGenToday: 990,
  powerConsToday: 483,

  operatingDays: 8,
  overDischarges: 1,
  fullCharges: 6,
  totalChargeAh: 66051,
  totalDischargeAh: 264,
  cumPowerGen: 2000,
  cumPowerCons: 1000,

  streetLightOn: true,
  brightness: 100,
  chargingState: 2,
  chargingStateName: 'Charging',
  faultBits: 0,
};

export const MOCK_DATA: Pack[] = [
  {
    name: 'Top Batt',
    connected: true,
    valid: true,
    totalVoltage: 52.8,
    current: 12.4,
    soc: 87,
    remainingAh: 87.0,
    maxCell: 3.312,
    minCell: 3.298,
    deltaCell: 0.014,
    cycles: 142,
    chargeMos: true,
    dischargeMos: true,
    ageMs: 1400,
    cells: [3.301, 3.305, 3.298, 3.31, 3.312, 3.303, 3.307, 3.299, 3.306, 3.304, 3.308, 3.302, 3.309, 3.3, 3.311, 3.303],
    temps: [24, 25],
  },
  {
    name: 'Middle Batt',
    connected: true,
    valid: true,
    totalVoltage: 51.9,
    current: -8.2,
    soc: 63,
    remainingAh: 197.8,
    maxCell: 3.251,
    minCell: 3.229,
    deltaCell: 0.022,
    cycles: 98,
    chargeMos: true,
    dischargeMos: true,
    ageMs: 800,
    cells: [3.235, 3.229, 3.244, 3.251, 3.238, 3.242, 3.233, 3.249, 3.24, 3.246, 3.231, 3.248, 3.237, 3.243, 3.239, 3.245],
    temps: [23, 24],
  },
  { name: 'Bottom Batt', connected: false, valid: false, cells: [], temps: [] },
];


function genMockHistory(points = 144): HistoryPoint[] {
  const out: HistoryPoint[] = [];
  const startHour = 6; // 6am
  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1); // 0 → 1 across the day
    const hourOfDay = startHour + progress * 14; // 6am–8pm
    const pvCurve = Math.max(0, Math.sin(((hourOfDay - startHour) / 14) * Math.PI));

    const h = Math.floor(hourOfDay);
    const m = Math.floor((hourOfDay % 1) * 60);
    const label = new Date(0, 0, 0, h, m).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    out.push({
      time: label,
      pvW: Math.round(pvCurve * 4200 + Math.random() * 150),
      soc: Math.min(100, Math.round(15 + progress * 60 + Math.random() * 2)),
    });
  }
  return out;
}

export const MOCK_HISTORY: HistoryPoint[] = genMockHistory(60);