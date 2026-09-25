import { ReactNode } from 'react';

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-800 rounded-lg ${className}`}></div>
  );
}

export function SkeletonCard({ children }: { children?: ReactNode }) {
  return (
    <div className="bg-base-panel border border-slate-700 rounded-lg p-6 w-full">
      {children || (
        <>
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
          <Skeleton className="h-2 w-full mt-6" />
        </>
      )}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-base-panel border border-slate-700 rounded-lg overflow-hidden w-full">
      <div className="px-6 py-4 border-b border-slate-700 flex justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="divide-y divide-slate-700/50">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-6 py-4 flex gap-4">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-5 w-1/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-base-panel border border-slate-700 rounded-lg p-6 w-full h-80 flex flex-col">
      <Skeleton className="h-6 w-48 mb-6" />
      <div className="flex-1 flex items-end gap-2">
        {Array.from({ length: 24 }).map((_, i) => (
          <Skeleton key={i} className="flex-1 rounded-t-sm" style={{ height: `${20 + Math.random() * 80}%` }} />
        ))}
      </div>
    </div>
  );
}
