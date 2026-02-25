export default function LeadsLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-32 animate-pulse rounded bg-zinc-100" />
      <div className="flex gap-3">
        <div className="h-9 w-56 animate-pulse rounded bg-zinc-100" />
        <div className="h-9 w-40 animate-pulse rounded bg-zinc-100" />
        <div className="h-9 w-44 animate-pulse rounded bg-zinc-100" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-zinc-100" />
        ))}
      </div>
    </div>
  );
}
