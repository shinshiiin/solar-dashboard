interface CellGridProps {
  cells: number[];
  maxCell: number;
  minCell: number;
  packName: string;
}

export function CellGrid({ cells, maxCell, minCell, packName }: CellGridProps) {
  const values = cells.length ? cells : Array.from<number>({ length: 8 });

  return (
    <div className="mb-4 grid grid-cols-4 gap-2 sm:grid-cols-6">
      {values.map((value, index) => {
        const isMax = value === maxCell && cells.length > 0;
        const isMin = value === minCell && cells.length > 0;
        const cellClass = isMax
          ? 'border-emerald-500 text-emerald-400'
          : isMin
            ? 'border-rose-500 text-rose-400'
            : 'border-slate-700 text-slate-300';

        return (
          <div key={`${packName}-${index}`} className={`rounded-lg border bg-slate-950/80 px-2 py-2 text-center text-[10px] ${cellClass}`}>
            {value.toFixed(3)}
          </div>
        );
      })}
    </div>
  );
}
