import { Trash2, RotateCcw } from 'lucide-react';

export default function LabelCard({ label, onLoad, onDelete }) {
  return (
    <div className="lux-card pop-in rounded-2xl p-3">
      <div className="flex items-start justify-between gap-3">
        <button onClick={() => onLoad(label)} className="text-left">
          <div className="text-base font-semibold text-slate-950 dark:text-white">{label.parsedData?.name}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{label.trackingId}</div>
          <div className="mt-2 text-sm text-slate-700 dark:text-slate-200">{String(label.parsedData?.address || 'No address available').slice(0, 120)}</div>
          <div className="mt-2 flex items-center gap-4">
            <div>
              <div className="text-[10px] font-semibold uppercase text-slate-400">Pincode</div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">{label.parsedData?.pincode || '-'}</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase text-slate-400">Customer Phone</div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">{label.parsedData?.phone || '-'}</div>
            </div>
            <div className="ml-auto inline-flex rounded-full bg-brand-50 px-2 py-1 text-[10px] font-medium text-brand-700 border border-slate-300 dark:border-slate-700/40 dark:bg-slate-800 dark:text-cyan-300">{label.parsedData?.category ? `Category ${label.parsedData.category}` : ''}</div>
          </div>
        </button>
        <div className="flex gap-2">
          <button onClick={() => onLoad(label)} className="btn-lift rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800" title="Reprint / Reload">
            <RotateCcw size={15} />
          </button>
          <button onClick={() => onDelete(label._id)} className="btn-lift rounded-xl border border-rose-200 bg-white p-2 text-rose-500 hover:bg-rose-50 dark:border-rose-900/60 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-rose-500/10" title="Delete label">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}