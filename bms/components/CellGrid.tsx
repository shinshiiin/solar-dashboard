interface CellGridProps {
  cells: number[];
  maxCell: number;
  minCell: number;
  packName: string;
}

export function CellGrid({ cells, maxCell, minCell, packName }: CellGridProps) {
  if (!cells.length) {
    return <p className="font-mono text-[11px] text-slate-600">No cell data.</p>;
  }
  return (
    <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
      {cells.map((v, i) => {
        const isMax = v === maxCell;
        const isMin = v === minCell;
        return (
          <div
            key={`${packName}-${i}`}
            className={`rounded-lg border px-1 py-2 text-center transition-colors ${
              isMax ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
              : isMin ? 'border-rose-500/50 bg-rose-500/10 text-rose-400'
              : 'border-[#1e2a1e] bg-[#0a110a] text-slate-400'
            }`}
          >
            <div className="font-mono text-[9px] font-semibold leading-none">{v.toFixed(3)}</div>
            <div className="mt-0.5 font-mono text-[7px] text-slate-700">C{i + 1}</div>
          </div>
        );
      })}
    </div>
  );
}
