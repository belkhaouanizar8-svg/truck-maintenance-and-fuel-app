interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}

export default function StatCard({ icon, label, value, sub, accent }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition-colors hover:border-slate-700">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium text-slate-400">{label}</p>
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-xl text-lg ${
            accent ?? "bg-slate-800"
          }`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 text-2xl font-extrabold tracking-tight text-white">{value}</p>
      {sub ? <p className="mt-1 text-xs text-slate-500">{sub}</p> : null}
    </div>
  );
}
