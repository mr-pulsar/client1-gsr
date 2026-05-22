import { useEffect, useMemo, useRef, useState, useDeferredValue } from 'react';
import { Link } from 'react-router-dom';
import { Camera, FileText, Printer, FileDown, Image as ImageIcon, Search } from 'lucide-react';
import api from '../services/api';
import CourierLabel from '../components/CourierLabel';
import LabelCard from '../components/LabelCard';
import DropZone from '../components/DropZone';
import { categoryFromAmount, parseRawInput } from '../utils/parser';
import { downloadAsJpeg, downloadAsPdf, downloadAsPng, directPrint } from '../utils/exporters';

const LOCAL_LABELS_KEY = 'gsr-local-labels';

function readLocalLabels() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_LABELS_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeLocalLabels(labels) {
  localStorage.setItem(LOCAL_LABELS_KEY, JSON.stringify(labels));
}

function createLocalLabel(rawInput, template, parsed) {
  const timestamp = Date.now();
  return {
    _id: `local-${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
    rawInput,
    parsedData: parsed,
    trackingId: `TRK-${timestamp}`,
    invoiceId: `INV-${timestamp}`,
    template,
    createdAt: new Date().toISOString(),
  };
}

export default function LabelPage() {
  const [rawInput, setRawInput] = useState(
    'Name : k.karthick saranya\nAddress : West street.mozhaiyur.ss nallur (post) mayiladuthurai (dt). Tamilnadu.\nPincode : 609118\nPH no : 9025644426\nAmount : 799',
  );
  const [labels, setLabels] = useState([]);
  const [savedLabel, setSavedLabel] = useState(null);
  const [search, setSearch] = useState('');
  const [logoName, setLogoName] = useState('No logo uploaded');
  const [template, setTemplate] = useState('vertical');
  const [dpi, setDpi] = useState(300);
  const [format, setFormat] = useState('6x4');
  const [message, setMessage] = useState('');
  const [apiAuthRequired, setApiAuthRequired] = useState(false);
  const previewRef = useRef(null);

  // Defer parsing/preview work so typing in the textarea stays responsive.
  const deferredRawInput = useDeferredValue(rawInput);
  const parsed = useMemo(() => {
    const result = parseRawInput(deferredRawInput);
    return { ...result, category: categoryFromAmount(result.amount) };
  }, [deferredRawInput]);

  const refreshLabels = async (query = search) => {
    const localLabels = readLocalLabels();
    const localMatches = query
      ? localLabels.filter((label) => JSON.stringify(label).toLowerCase().includes(query.toLowerCase()))
      : localLabels;

    // show local matches immediately for snappy UI
    try {
      setLabels(localMatches.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (e) {
      setLabels(localMatches);
    }

    try {
      const { data } = await api.get('/labels', { params: { q: query } });
      setApiAuthRequired(false);
      const merged = [
        ...localMatches.filter((local) => !data.labels.some((remote) => remote._id === local._id)),
        ...data.labels,
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setLabels(merged);
    } catch (err) {
      // keep local matches already shown; detect auth error
      if (err?.response?.status === 401) setApiAuthRequired(true);
    }
  };

  useEffect(() => {
    refreshLabels();
  }, [savedLabel]);

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshLabels(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const saveLabel = async () => {
    setMessage('');
    try {
      const localLabel = createLocalLabel(rawInput, template, { ...parsed });
      const localLabels = [localLabel, ...readLocalLabels()];
      writeLocalLabels(localLabels);
      setSavedLabel(localLabel);
      setLabels(localLabels);
      // notify other parts of the app (e.g., Dashboard) that local labels changed
      try {
        window.dispatchEvent(new Event('gsr.labels.updated'));
      } catch (e) {
        // ignore
      }
      setMessage('Label saved successfully');

      // attempt to persist to server but don't block UI; surface errors to the user
      api.post('/labels', { rawInput, template }).then(() => {
        // noop
      }).catch((err) => {
        console.error('Failed to persist label to server', err);
        setMessage('Label saved locally (server sync failed)');
      });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not save label');
    }
  };

  const handleDownloadAsJpeg = async () => {
    setMessage('');
    try {
      await downloadAsJpeg(previewRef, `courier-label-${format}`, { dpi, format });
      setMessage('JPEG exported');
    } catch (err) {
      console.error('JPEG export failed', err);
      setMessage('JPEG export failed');
    }
  };

  const handleDownloadAsPng = async () => {
    setMessage('');
    try {
      await downloadAsPng(previewRef, `courier-label-${format}`, { dpi, format });
      setMessage('PNG exported');
    } catch (err) {
      console.error('PNG export failed', err);
      setMessage('PNG export failed');
    }
  };

  const handleDownloadAsPdf = async () => {
    setMessage('');
    try {
      await downloadAsPdf(previewRef, 'courier-label', { dpi, format });
      setMessage('PDF exported');
    } catch (err) {
      console.error('PDF export failed', err);
      setMessage('PDF export failed');
    }
  };

  const handleDirectPrint = async () => {
    setMessage('');
    try {
      directPrint(previewRef, { format });
      setMessage('Print dialog opened');
    } catch (err) {
      console.error('Print failed', err);
      setMessage('Print failed');
    }
  };

  const reloadLabel = (label) => {
    setRawInput(label.rawInput);
    setSavedLabel(label);
  };

  const removeLabel = async (id) => {
    const nextLabels = readLocalLabels().filter((label) => label._id !== id);
    writeLocalLabels(nextLabels);
    setLabels(nextLabels);
    if (savedLabel?._id === id) {
      setSavedLabel(null);
    }
    api.delete(`/labels/${id}`).catch(() => null);
  };

  const handleLogoUpload = (file) => {
    setLogoName(file.name);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="glass rounded-[2rem] p-4 shadow-soft md:p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.4em] text-brand-100">Label generator</div>
              <h2 className="mt-2 text-2xl font-bold text-white">Raw address parser</h2>
            </div>
            {/* Category indicator removed - not required */}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 py-3 pl-10 pr-4 text-white outline-none focus:border-brand-500"
                placeholder="Search label history"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">Logo: {logoName}</div>
          </div>

          <div className="mt-4">
            <DropZone onFile={handleLogoUpload} />
          </div>

          <div className="mt-5 space-y-1">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Raw Label Data</div>
            <p className="text-xs text-slate-500">Enter label data with fields: Name, Address, Pincode, PH no, Amount (separated by colons or newlines)</p>
            <textarea
              className="w-full rounded-[1.5rem] border border-slate-700 bg-slate-950/70 p-4 text-sm text-white outline-none focus:border-brand-500 min-h-[220px]"
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="Example:\nName : John Doe\nAddress : 123 Main St\nPincode : 110001\nPH no : 9999999999\nAmount : 500"
            />
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {[
              ['Name', parsed.name],
              ['Address', parsed.address],
              ['Pincode', parsed.pincode],
              ['Phone', parsed.phone],
              ['Amount', `₹${parsed.amount}`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="text-[11px] uppercase tracking-[0.3em] text-slate-500">{label}</div>
                <div className="mt-1 text-sm font-medium text-white">{value || '-'}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-2">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Export & Print Settings</div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                <div className="text-xs uppercase text-slate-400">Label Layout</div>
                <select value={template} onChange={(e) => setTemplate(e.target.value)} className="mt-2 w-full rounded-lg bg-slate-950/60 p-2 text-sm">
                  <option value="vertical">Vertical (Thermal)</option>
                  <option value="horizontal">Horizontal</option>
                </select>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                <div className="text-xs uppercase text-slate-400">Image Quality</div>
                <select value={dpi} onChange={(e) => setDpi(Number(e.target.value))} className="mt-2 w-full rounded-lg bg-slate-950/60 p-2 text-sm">
                  <option value={150}>150 DPI (Fast)</option>
                  <option value={300}>300 DPI (Best)</option>
                </select>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                <div className="text-xs uppercase text-slate-400">Paper Size</div>
                <select value={format} onChange={(e) => setFormat(e.target.value)} className="mt-2 w-full rounded-lg bg-slate-950/60 p-2 text-sm">
                  <option value="6x4">6 x 4 inches</option>
                  <option value="a4">A4</option>
                  <option value="thermal-80">Thermal 80mm</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <button onClick={saveLabel} className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 font-semibold text-white hover:bg-brand-500">
              <FileText size={16} /> Save Label to Workspace
            </button>
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Export Label</div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                <button onClick={handleDownloadAsJpeg} className="inline-flex items-center justify-center gap-1 rounded-2xl border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">
                  <ImageIcon size={14} /> JPEG
                </button>
                <button onClick={handleDownloadAsPng} className="inline-flex items-center justify-center gap-1 rounded-2xl border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">
                  <Camera size={14} /> PNG
                </button>
                <button onClick={handleDownloadAsPdf} className="inline-flex items-center justify-center gap-1 rounded-2xl border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">
                  <FileDown size={14} /> PDF
                </button>
                <button onClick={handleDirectPrint} className="inline-flex items-center justify-center gap-1 rounded-2xl border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">
                  <Printer size={14} /> Print
                </button>
              </div>
            </div>
          </div>
          {message && <div className="mt-3 text-sm text-slate-300">{message}</div>}
        </section>

        <section className="space-y-4">
          <div className="glass rounded-[2rem] p-4 shadow-soft">
            <div className="text-xs uppercase tracking-[0.4em] text-brand-100">Real-time preview</div>
            <div className="mt-3 print:p-0" ref={previewRef}>
              <CourierLabel
                data={parsed}
                trackingId={savedLabel?.trackingId || 'TRK-Preview'}
                invoiceId={savedLabel?.invoiceId || 'INV-Preview'}
                supportNumber="9025644426"
                template={template === 'vertical' ? 'thermal' : 'horizontal'}
              />
            </div>
          </div>

          <div className="glass rounded-[2rem] p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">History</h3>
              <span className="text-sm text-slate-400">{labels.length} records</span>
            </div>
            {apiAuthRequired && (
              <div className="mt-2 text-sm text-amber-600">Not signed in — showing only local labels. <Link to="/auth" className="underline">Sign in</Link> to view synced labels.</div>
            )}
            <div className="mt-3 space-y-3">
              {labels.map((label) => (
                <LabelCard key={label._id} label={label} onLoad={reloadLabel} onDelete={removeLabel} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
