import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

interface SortableThProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  column: string;
  activeColumn: string;
  ascending: boolean;
  onSort: (col: string) => void;
}

export function SortableTh({ column, activeColumn, ascending, onSort, children, className = '', ...rest }: SortableThProps) {
  const active = activeColumn === column;
  return (
    <th
      {...rest}
      onClick={() => onSort(column)}
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-300 transition-colors group ${className}`}
      scope="col"
    >
      <span className="flex items-center gap-1.5">
        {children}
        {active
          ? (ascending ? <ArrowUp size={11} className="text-emerald-400" /> : <ArrowDown size={11} className="text-emerald-400" />)
          : <ArrowUpDown size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        }
      </span>
    </th>
  );
}
