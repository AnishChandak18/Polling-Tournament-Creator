export default function Loading() {
  return (
    <div
      className="pointer-events-none fixed left-0 right-0 top-0 z-[200] h-1 overflow-hidden bg-black/25"
      aria-hidden
    >
      <div className="route-progress-bar h-full w-2/5 bg-primary-container opacity-95 shadow-[0_0_10px_rgba(255,231,146,0.45)]" />
    </div>
  );
}
