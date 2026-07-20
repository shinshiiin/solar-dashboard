import { socColor } from '../lib/format';

interface SocRingProps {
  soc: number;
  label?: string;
  sublabel?: string;
  centerTop?: string;
  centerBottom?: string;
  size?: 'sm' | 'lg';
}

export function SocRing({
  soc, label = 'SOC', sublabel, centerTop, centerBottom, size = 'sm',
}: SocRingProps) {
  const r      = 45;
  const circ   = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(Math.max(soc, 0), 100) / 100);
  const color  = socColor(soc);
  const lg     = size === 'lg';

  return (
    <div className="relative aspect-square w-full">
      <svg className="h-full w-full -rotate-90" viewBox="-5 -5 110 110">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1a2a1a" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={r} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{
            filter: `drop-shadow(0 0 4px ${color}) drop-shadow(0 0 10px ${color}60)`,
            transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 text-center">
        {centerTop && (
          <span className={`leading-none ${lg ? 'text-xs' : 'text-[9px]'} text-slate-400`}>
            {centerTop}
          </span>
        )}
        <span className={`font-bold leading-none ${lg ? 'text-4xl' : 'text-xl'}`} style={{ color }}>
          {soc.toFixed(0)}%
        </span>
        {centerBottom && (
          <span className={`text-rose-400 leading-none ${lg ? 'text-xs' : 'text-[9px]'}`}>
            {centerBottom}
          </span>
        )}
        {sublabel && (
          <span className="text-[7px] text-slate-700 leading-none mt-0.5">{sublabel}</span>
        )}
      </div>
    </div>
  );
}
