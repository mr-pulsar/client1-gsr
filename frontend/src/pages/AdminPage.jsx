import { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api
      .get('/admin/stats')
      .then(({ data }) => setStats(data))
      .catch(() => setStats({ stats: { totalLabels: 0, totalInvoices: 0, totalUsers: 0 }, latestLabels: [] }));
  }, []);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return setMessage('Please select a CSV file');
    setUploading(true);
    setMessage('Uploading...');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/admin/bulk-upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage(`Uploaded ${data.uploaded} rows`);
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="glass rounded-[2rem] p-6 shadow-soft">
        <div className="text-xs uppercase tracking-[0.4em] text-brand-100">Admin dashboard</div>
        <h2 className="mt-2 text-2xl font-bold text-white">Analytics and operations</h2>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">Labels: {stats?.stats.totalLabels ?? 0}</div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">Invoices: {stats?.stats.totalInvoices ?? 0}</div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">Users: {stats?.stats.totalUsers ?? 0}</div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
        <h3 className="text-lg font-semibold text-white">Bulk CSV upload</h3>
        <form onSubmit={handleUpload} className="mt-4 flex items-center gap-3">
          <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <button disabled={uploading} className="rounded-xl bg-brand-600 px-4 py-2 text-white">
            {uploading ? 'Uploading...' : 'Upload CSV'}
          </button>
        </form>
        {message && <div className="mt-3 text-sm text-slate-300">{message}</div>}
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
        <h3 className="text-lg font-semibold text-white">Latest labels</h3>
        <div className="mt-4 space-y-3">
          {stats?.latestLabels?.map((label) => (
            <div key={label._id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="font-medium text-white">{label.parsedData?.name}</div>
              <div className="text-sm text-slate-400">{label.trackingId}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}