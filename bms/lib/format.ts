export function formatAge(ageMs: number): string {
  const s = Math.round(ageMs / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  return `${Math.round(s / 3600)}h ago`;
}

export function socColor(soc: number): string {
  if (soc > 50) return '#4ade80';
  if (soc > 20) return '#fbbf24';
  return '#f87171';
}

export function socTextClass(soc: number): string {
  if (soc > 50) return 'text-emerald-400';
  if (soc > 20) return 'text-amber-400';
  return 'text-rose-400';
}
