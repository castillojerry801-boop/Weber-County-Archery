export function LoadingState() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
      ))}
    </div>
  );
}
