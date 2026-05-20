export default function StatCard({ label, value, hint }) {
  return (
    <div className="lux-card pop-in rounded-3xl p-4 shadow-soft">
      <div className="text-xs tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">{value}</div>
      <div className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{hint}</div>
    </div>
  );
}