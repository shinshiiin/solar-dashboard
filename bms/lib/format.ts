export function getSocColorClass(soc: number) {
  if (soc < 20) return 'bg-rose-500';
  if (soc < 50) return 'bg-amber-500';
  return 'bg-emerald-500';
}

export function formatAge(ageMs: number) {
  return `${Math.round(ageMs / 1000)}s ago`;
}
