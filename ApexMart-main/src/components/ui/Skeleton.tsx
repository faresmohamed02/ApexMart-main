interface SkeletonProps { className?: string; }

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse bg-gray-800 rounded-lg ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6">
      <div className="flex justify-between mb-4">
        <Skeleton className="w-11 h-11 rounded-xl" />
        <Skeleton className="w-16 h-6 rounded-lg" />
      </div>
      <Skeleton className="w-32 h-7 mb-2" />
      <Skeleton className="w-24 h-4" />
    </div>
  );
}

export function SkeletonRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className="h-4 w-full max-w-[160px]" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonChart() {
  return (
    <div className="glass-card p-6">
      <Skeleton className="w-48 h-5 mb-1" />
      <Skeleton className="w-32 h-4 mb-6" />
      <Skeleton className="w-full h-[260px] rounded-xl" />
    </div>
  );
}
