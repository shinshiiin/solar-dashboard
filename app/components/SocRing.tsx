import { socColor } from "../lib/format";

interface SocRingProps {
  soc: number;
  remainingAh: number;
}

export function SocRing(props: SocRingProps) {
  const soc = props.soc;
  const remainingAh = props.remainingAh;
  const color = socColor(soc);
  const r = 45;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(Math.max(soc, 0), 100) / 100);
  
  return (
    <div className="relative aspect-square w-full self-center lg:max-w-60">
      <svg
        className="h-full w-full -rotate-90 overflow-visible"
        viewBox="-5 -5 110 110"
      >
        <defs>
          <filter x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="1.5"
              floodColor={color}
              floodOpacity="0.9"
            />
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="4"
              floodColor={color}
              floodOpacity="0.45"
            />
          </filter>
        </defs>

        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#1a2a1a"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col justify-center text-center">
        <div className="text-xs font-bold lg:text-5xl">{soc.toFixed(0)}%</div>
        <p className="text-[7px] lg:text-xs">{remainingAh.toFixed(0)}Ah</p>
      </div>
    </div>
  );
}
