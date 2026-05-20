import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatCard from '../components/StatCard';

const LOCAL_LABELS_KEY = 'gsr-local-labels';

function readLocalLabels() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_LABELS_KEY) || '[]');
  } catch {
    return [];
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ labels: 0, invoices: 0, history: 0 });
  const [recentLabels, setRecentLabels] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [apiAuthRequired, setApiAuthRequired] = useState(false);

  useEffect(() => {
    // show local labels immediately for fast UI
    const localLabelsNow = readLocalLabels().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setStats((current) => ({ ...current, labels: localLabelsNow.length }));
    setRecentLabels(localLabelsNow.slice(0, 4));

    api
      .get('/labels')
      .then(({ data }) => {
        setApiAuthRequired(false);
        const localLabels = readLocalLabels();
        const mergedLabels = [
          ...localLabels.filter((local) => !data.labels.some((remote) => remote._id === local._id)),
          ...data.labels,
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setStats((current) => ({ ...current, labels: mergedLabels.length }));
        setRecentLabels(mergedLabels.slice(0, 4));
      })
      .catch((err) => {
        const localLabels = readLocalLabels().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setStats((current) => ({ ...current, labels: localLabels.length }));
        setRecentLabels(localLabels.slice(0, 4));
        if (err?.response?.status === 401) setApiAuthRequired(true);
      });

    api
      .get('/invoices')
      .then(({ data }) => {
        setStats((current) => ({ ...current, invoices: data.invoices.length }));
        setRecentInvoices(data.invoices.slice(0, 4));
      })
      .catch(() => setRecentInvoices([]));
  }, []);

  useEffect(() => {
    const handler = () => {
      const localLabels = readLocalLabels().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (apiAuthRequired) {
        setRecentLabels(localLabels.slice(0, 4));
        setStats((current) => ({ ...current, labels: localLabels.length }));
        return;
      }
      // merge with any server labels already present in recentLabels
      const serverLabels = recentLabels.filter((r) => !String(r._id).startsWith('local-'));
      const merged = [
        ...localLabels.filter((local) => !serverLabels.some((remote) => remote._id === local._id)),
        ...serverLabels,
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentLabels(merged.slice(0, 4));
      setStats((current) => ({ ...current, labels: merged.length }));
    };

    window.addEventListener('gsr.labels.updated', handler);
    return () => window.removeEventListener('gsr.labels.updated', handler);
  }, [apiAuthRequired, recentLabels]);

  return (
    <div className="space-y-4">
      <section className="lux-card pop-in rounded-[1.5rem] p-4 shadow-soft md:rounded-[2rem] md:p-5">
        <div className="text-xs tracking-wide text-brand-700 dark:text-cyan-300">Daily overview</div>
        <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white md:text-4xl">Labels, invoices, and print history</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-300">A clean workspace for handling shipping tasks without the noise.</p>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Labels" value={stats.labels} hint="Saved in your workspace" />
        <StatCard label="Invoices" value={stats.invoices} hint="Ready for export" />
        <StatCard label="Print history" value={stats.history} hint="Recent activity" />
      </div>

      <section className="lux-card rounded-[1.5rem] p-4 shadow-soft md:rounded-[2rem] md:p-5">
          <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Recent labels</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Saved labels from the Labels section appear here.</p>
          </div>
          {apiAuthRequired && (
            <div className="text-sm text-amber-600 dark:text-amber-300">Not signed in — showing only local labels. <a href="/auth" className="underline">Sign in</a> to view synced labels.</div>
          )}
          <Link to="/labels" className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
            View all
          </Link>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {recentLabels.length > 0 ? (
            recentLabels.map((label) => (
              <div key={label._id} className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
                <div className="font-semibold text-slate-950 dark:text-white">{label.parsedData?.name || 'Unnamed label'}</div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{label.trackingId}</div>
                <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">{String(label.parsedData?.address || 'No address available').slice(0, 90)}</div>
                <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">Category {label.parsedData?.category || '-'}</div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/30 dark:text-slate-400">
              No labels saved yet.
            </div>
          )}
        </div>
      </section>

      <section className="lux-card rounded-[1.5rem] p-4 shadow-soft md:rounded-[2rem] md:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Recent invoices</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Saved invoices from the Invoice section appear here.</p>
          </div>
          <Link to="/invoices" className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
            View all
          </Link>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {recentInvoices.length > 0 ? (
            recentInvoices.map((invoice) => (
              <div key={invoice._id} className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
                <div className="font-semibold text-slate-950 dark:text-white">{invoice.invoiceNumber || 'Invoice'}</div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{invoice.customer?.name || 'No customer name'}</div>
                <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">₹{Math.round(Number(invoice.total || 0))}</div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{invoice.paymentStatus || 'Pending'}</span>
                  <span>{invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : ''}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/30 dark:text-slate-400">
              No invoices saved yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}