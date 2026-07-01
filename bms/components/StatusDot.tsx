interface StatusDotProps {
  status: 'online' | 'offline';
}

export function StatusDot({ status }: StatusDotProps) {
  const colorClass = status === 'online' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-rose-500';

  return <span className={`h-2.5 w-2.5 rounded-full ${colorClass}`} />;
}
