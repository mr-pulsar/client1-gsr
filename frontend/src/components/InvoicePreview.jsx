import { QRCodeCanvas } from 'qrcode.react';

export default function InvoicePreview({ invoice }) {
  const money = (value) => `₹${Math.round(Number(value || 0))}`;

  return (
    <div className="w-full rounded-[2rem] border border-slate-200 bg-white p-4 text-slate-950 shadow-xl sm:p-5">
      <div className="flex flex-col items-center gap-2 border-b border-slate-200 pb-3 text-center">
        <div className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.35em] text-brand-700">
          GSR Graphics
        </div>
        <div className="text-xs uppercase tracking-[0.4em] text-slate-500">Invoice</div>
        <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">{invoice.invoiceNumber}</h3>
        <p className="text-sm text-slate-500">{new Date(invoice.createdAt || Date.now()).toLocaleString()}</p>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_220px] lg:items-stretch">
        <div className="rounded-3xl bg-slate-50 p-4">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Customer</div>
          <div className="mt-1 text-lg font-semibold leading-tight">{invoice.customer?.name}</div>
          <div className="text-sm text-slate-600">{invoice.customer?.phone}</div>
          <div className="mt-1.5 text-sm leading-5 text-slate-700">{invoice.customer?.address}</div>
        </div>
        <div className="flex h-full flex-col items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-white p-4">
          <QRCodeCanvas
            value={invoice.invoiceNumber || 'INV-Preview'}
            size={160}
            bgColor="#ffffff"
            fgColor="#0f172a"
            level="M"
            includeMargin
          />
          <div className="text-center text-xs text-slate-500">Scan for invoice details</div>
        </div>
      </div>

      <div className="mt-5 space-y-4 md:hidden">
        {invoice.items?.map((item, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-slate-900">{item.name}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-400">Qty {item.quantity}</div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Price</div>
                <div className="font-semibold">{money(item.price)}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 text-sm font-medium">
              <span>Line Total</span>
              <span>{money(item.quantity * item.price)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 hidden overflow-hidden rounded-3xl border border-slate-200 md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950 text-white">
            <tr>
              <th className="w-[46%] px-4 py-3.5">Item</th>
              <th className="w-[12%] px-4 py-3.5 text-center">Qty</th>
              <th className="w-[21%] px-4 py-3.5 text-right">Price</th>
              <th className="w-[21%] px-4 py-3.5 text-right">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item, index) => (
              <tr key={index} className="border-t border-slate-200">
                <td className="px-4 py-3.5 align-middle">{item.name}</td>
                <td className="px-4 py-3.5 text-center align-middle">{item.quantity}</td>
                <td className="px-4 py-3.5 text-right align-middle">{money(item.price)}</td>
                <td className="px-4 py-3.5 text-right align-middle">{money(item.quantity * item.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Subtotal</span>
          <span className="font-semibold text-slate-900">{money(invoice.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 pt-3">
          <span className="font-semibold text-slate-900">Total Invoice</span>
          <span className="text-2xl font-bold tracking-tight text-brand-700">{money(invoice.total)}</span>
        </div>
      </div>

      <div className="mt-4 rounded-2xl p-4 text-xs text-slate-600 dark:text-slate-400">
        <div className="font-semibold text-slate-900 dark:text-white">Terms and Conditions</div>
        <div className="mt-1 leading-snug">Note: No Warranty / No Return. Company will not be responsible for any damages in transit.</div>
      </div>
    </div>
  );
}