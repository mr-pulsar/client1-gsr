import { QRCodeSVG } from 'qrcode.react';
import { AlertTriangle, Droplets, Package2, ArrowUp } from 'lucide-react';
import BarcodeStrip from './BarcodeStrip';

export default function CourierLabel({ data, trackingId, invoiceId, supportNumber, companyName = 'GSR Graphics', template = 'vertical' }) {
  const isThermal = template === 'thermal' || template === 'vertical';
  const containerClass = `mx-auto w-full ${isThermal ? 'thermal-label max-w-[360px]' : 'max-w-[720px]'} rounded-md border border-slate-200 bg-white text-slate-950 shadow print:shadow-none label-print-friendly`;
  const warningGridClass = isThermal ? 'grid grid-cols-1 gap-1' : 'grid grid-cols-2 gap-2';

  // sanitize address to remove any stray amount lines or currency mentions
  const rawAddress = (data?.address || '')?.toString() || '';
  const amountStr = (data?.amount || '')?.toString() || '';
  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  let cleanAddress = rawAddress
    .replace(/(^.*\bamount\b.*$\n?)/gim, '')
    .replace(/(^.*\b(?:₹|rs\.?|inr)\b[^\n]*$\n?)/gim, '');

  // explicitly remove the numeric amount if it appears in the address (e.g. ", 799")
  if (amountStr) {
    const amtEsc = escapeRegex(amountStr);
    // remove currency+amount or plain amount occurrences
    const reAmtAnywhere = new RegExp(`(?:₹|rs\\.?|inr)?\\s*${amtEsc}`, 'ig');
    cleanAddress = cleanAddress.replace(reAmtAnywhere, '');
    // remove trailing punctuation left after removal, e.g. ", 799" -> ""
    cleanAddress = cleanAddress.replace(new RegExp(`[,:\-\s]*${amtEsc}[,:\-\s]*$`), '');
  }

  // tidy up leftover blank lines and punctuation
  cleanAddress = cleanAddress.replace(/(^\s*\n)+/g, '\n').replace(/\s+,/g, ',').replace(/,+/g, ',').replace(/\s{2,}/g, ' ').trim();

  return (
    <div className={containerClass}>
      <div className="rounded-t-md bg-slate-950 px-4 py-3 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="text-xs uppercase tracking-[0.12em] text-brand-100">{companyName}</div>
              <div className="text-xs uppercase tracking-[0.12em] text-red-200 font-semibold">HANDLE WITH CARE</div>
            </div>
          </div>
          <div className="rounded-2xl bg-red-500 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white">Fragile</div>
        </div>
      </div>

      {/* Removed small warning icons (Handle With Care / Keep Dry / This Side Up / Courier Ready) per request */}

      <div className="space-y-3 p-4">
        {/* Category section removed per request - not required for amount */}

        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Customer Name</div>
          <div className="mt-1 text-3xl md:text-4xl font-extrabold leading-tight break-words">{data.name}</div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Address</div>
          <div className="mt-1 text-2xl md:text-3xl font-bold leading-tight text-slate-900 whitespace-pre-line">{cleanAddress || data.address}</div>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">Pincode</div>
            <div className="mt-1 text-2xl md:text-3xl font-bold text-slate-900">{data.pincode}</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">Customer Phone</div>
            <div className="mt-1 text-2xl md:text-3xl font-bold text-slate-900">{data.phone}</div>
          </div>
        </div>

        <div className="grid gap-2 rounded-lg border border-slate-200 p-2 md:grid-cols-1">
          <div className="space-y-1 text-[11px] text-slate-500 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-700">For support (GSR Team):</span>
              <span className="ml-1">{(supportNumber || '').toString().startsWith('+') ? supportNumber : `+91 ${supportNumber}`}</span>
            </div>
            <div className="text-xs text-slate-400">{companyName}</div>
          </div>
        </div>
      </div>

      <div className="rounded-b-md bg-slate-950 px-4 py-1 text-center text-[8px] font-medium uppercase tracking-[0.25em] text-slate-100">
        Date: {new Date().toLocaleDateString()}
      </div>
    </div>
  );
}