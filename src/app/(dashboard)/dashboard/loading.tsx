export default function DashboardLoading() {
  return (
    <div className="space-y-5">
      {/* Welcome + alert banner skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2 h-36 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-36 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
      </div>

      {/* Stats cards skeleton */}
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
          ))}
        </div>
        <div className="h-1.5 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-16 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
      </div>

      {/* Charts skeleton */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-40 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-40 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
      </div>

      {/* Status cards skeleton */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}
