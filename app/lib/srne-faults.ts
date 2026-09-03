// Bit meanings per the SRNE Modbus protocol doc, section 4.15.
// faultBits is built as (register 0x0121 << 16) | register 0x0122, so bit
// index here lines up directly with the "Bn" labels in the doc.
const FAULT_BIT_LABELS: Record<number, string> = {
  0: 'Battery over-discharge',
  1: 'Battery over-voltage',
  2: 'Battery under-voltage',
  3: 'Load short circuit',
  4: 'Load overpower / over-current',
  5: 'Controller temperature too high',
  6: 'Battery high temp — charging blocked',
  7: 'PV input overpower',
  9: 'PV input side over-voltage',
  11: 'Solar panel working point over-voltage',
  12: 'Solar panel reversely connected',
  23: 'No battery detected',
  24: 'Battery high temp — discharging blocked',
  25: 'Battery low temp — discharging blocked',
  26: 'Overcharge protection — charging stopped',
  27: 'Battery low temp — charging stopped',
  28: 'Battery reversely connected',
  30: 'Induction probe damaged (street light)',
  31: 'Load open-circuit (street light)',
};

export function decodeSrneFaults(faultBits: number): string[] {
  const active: string[] = [];
  for (const [bit, label] of Object.entries(FAULT_BIT_LABELS)) {
    if ((faultBits >>> Number(bit)) & 1) active.push(label);
  }
  return active;
}
