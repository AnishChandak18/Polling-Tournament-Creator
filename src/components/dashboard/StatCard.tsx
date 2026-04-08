type StatCardProps = {
  label: string;
  value: string | number;
};

export default function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-xl bg-black/20 p-4">
      <div className="text-xs uppercase tracking-wider text-text/70">{label}</div>
      <div className="mt-1 text-2xl font-black">{value}</div>
    </div>
  );
}
