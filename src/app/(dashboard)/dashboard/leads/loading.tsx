export default function LeadsLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-32 animate-pulse rounded bg-surface-raised" />
      <div className="flex flex-wrap gap-3">
        <div className="h-9 w-56 animate-pulse rounded bg-surface-raised" />
        <div className="h-9 w-40 animate-pulse rounded bg-surface-raised" />
        <div className="h-9 w-44 animate-pulse rounded bg-surface-raised" />
        <div className="h-9 w-36 animate-pulse rounded bg-surface-raised" />
        <div className="h-9 w-36 animate-pulse rounded bg-surface-raised" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-raised" />
        ))}
      </div>
    </div>
  );
}
