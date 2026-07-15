interface StatusDotProps {
  status: 'online' | 'offline' | 'warning';
}

export function StatusDot({ status }: StatusDotProps) {
  if (status === 'online') return (
    <span className="relative flex h-2 w-2 shrink-0">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
    </span>
  );
  if (status === 'warning') return (
    <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.7)]" />
  );
  return <span className="h-2 w-2 shrink-0 rounded-full bg-rose-500" />;
}
