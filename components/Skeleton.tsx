export function SkeletonCard() {
  return (
    <div className="glass flex items-center p-4 gap-4 animate-pulse">
      <div className="w-11 h-11 rounded-xl bg-white/10 shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-4 w-2/3 rounded bg-white/10" />
        <div className="h-3 w-1/2 rounded bg-white/5" />
      </div>
    </div>
  );
}
