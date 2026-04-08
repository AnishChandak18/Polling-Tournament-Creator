/**
 * Animated "Live" indicator.
 * Usage: <LiveBadge /> or <LiveBadge label="In Progress" />
 */
export default function LiveBadge({ label = "Live Now" }) {
  return (
    <span className="badge-live animate-pulse">
      <span className="h-1.5 w-1.5 rounded-full bg-tertiary" />
      {label}
    </span>
  );
}
