export default function DashboardLoading() {
  return (
    <div className="space-y-5">
      {/* Welcome + alert banner skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2 h-36 animate-pulse rounded-2xl bg-surface-raised" />
        <div className="h-36 animate-pulse rounded-2xl bg-surface-raised" />
      </div>

      {/* Stats cards skeleton */}
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-surface-raised" />
          ))}
        </div>
        <div className="h-1.5 animate-pulse rounded-full bg-surface-raised" />
        <div className="h-16 animate-pulse rounded-2xl bg-surface-raised" />
      </div>

      {/* Charts skeleton */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-40 animate-pulse rounded-2xl bg-surface-raised" />
        <div className="h-40 animate-pulse rounded-2xl bg-surface-raised" />
      </div>

      {/* Status cards skeleton */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-surface-raised" />
        ))}
      </div>
    </div>
  );
}
