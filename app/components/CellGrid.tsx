interface CellGridProps {
  cells: number[];
  maxCell: number;
  minCell: number;
  packName: string;
}

export function CellGrid({ cells, maxCell, minCell, packName }: CellGridProps) {
  if (!cells.length) {
    return <p className="text-[11px] text-slate-600">No cell data.</p>;
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
              isMax
                ? "border-[#6FAF3A]/50 bg-[#6FAF3A]/10 text-[#6FAF3A]"
                : isMin
                  ? "border-[#e0522f]/50 bg-[#e0522f]/10 text-[#e0522f]"
                  : "border-[#1e2a1e] text-slate-400"
            }`}
          >
            <div className="text-[9px] font-semibold leading-none">
              {v.toFixed(3)}
            </div>
            <div className="mt-0.5 text-[7px] text-slate-700">C{i + 1}</div>
          </div>
        );
      })}
    </div>
  );
}
