interface SocBarProps {
  value: number;
  colorClass: string;
}

export function SocBar({ value, colorClass }: SocBarProps) {
  return (
    <div className="mb-4 h-2.5 overflow-hidden rounded-full bg-slate-800">
      <div className={`h-full rounded-full transition-all ${colorClass}`} style={{ width: `${value}%` }} />
    </div>
  );
}
