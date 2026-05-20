import { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import InvoicePreview from '../components/InvoicePreview';
import { downloadAsPdf, directPrint } from '../utils/exporters';

const productCatalog = [
  { key: 'courier', label: 'Courier', name: 'Courier charge', price: 799 },
  { key: 'frame', label: 'Frame', name: 'Frame', price: 249 },
  { key: 'print', label: 'Print', name: 'Printing', price: 49 },
  { key: 'lamination', label: 'Lamination', name: 'Lamination', price: 39 },
  { key: 'custom', label: 'Custom', name: 'Custom item', price: 0 },
];

const getProduct = (key) => productCatalog.find((product) => product.key === key) || productCatalog[0];

const createItem = (product = productCatalog[0]) => ({
  productKey: product.key,
  name: product.name,
  quantity: 1,
  price: product.price,
});

const emptyInvoice = {
  customer: { name: '', phone: '', address: '', pincode: '' },
  items: [createItem()],
  paymentStatus: 'Pending',
};

export default function InvoicePage() {
  const [invoice, setInvoice] = useState(emptyInvoice);
  const [savedInvoice, setSavedInvoice] = useState(null);
  const [message, setMessage] = useState('');
  const previewRef = useRef(null);

  useEffect(() => {
    if (savedInvoice) {
      setInvoice((current) => ({ ...current, customer: savedInvoice.customer }));
    }
  }, [savedInvoice]);

  const updateItem = (index, field, value) => {
    setInvoice((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
    }));
  };

  const updateProduct = (index, productKey) => {
    const product = getProduct(productKey);
    setInvoice((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (
        itemIndex === index
          ? {
              ...item,
              productKey,
              name: product.key === 'custom' ? item.name : product.name,
              price: product.key === 'custom' ? item.price : product.price,
            }
          : item
      )),
    }));
  };

  const addItem = (productKey = productCatalog[0].key) => {
    setInvoice((current) => ({
      ...current,
      items: [...current.items, createItem(getProduct(productKey))],
    }));
  };

  const removeItem = (index) => {
    setInvoice((current) => ({
      ...current,
      items: current.items.length > 1 ? current.items.filter((_, itemIndex) => itemIndex !== index) : current.items,
    }));
  };

  const create = async () => {
    setMessage('');
    try {
      const { data } = await api.post('/invoices', { ...invoice, taxRate: 0 });
      if (data?.invoice) {
        setSavedInvoice(data.invoice);
        setMessage('Invoice created successfully');
      } else {
        setMessage('Unexpected response from server');
        console.error('create invoice: unexpected response', data);
      }
    } catch (err) {
      console.error('create invoice error', err);
      setMessage(err?.response?.data?.message || 'Could not create invoice');
    }
  };

  const previewModel = savedInvoice || {
    invoiceNumber: 'INV-Preview',
    ...invoice,
    subtotal: invoice.items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.price), 0),
    tax: 0,
  };
  previewModel.total = previewModel.subtotal;

  return (
    <div className="mx-auto grid w-full max-w-7xl min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
      <section className="glass rounded-[2rem] p-4 shadow-soft sm:p-5">
        <div className="text-xs uppercase tracking-[0.4em] text-brand-100">Invoice module</div>
        <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Billing and product summary</h2>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            { key: 'name', label: 'Customer Name' },
            { key: 'phone', label: 'Phone Number' },
            { key: 'address', label: 'Delivery Address' },
            { key: 'pincode', label: 'Pincode' },
          ].map(({ key: field, label }) => (
            <label key={field} className="space-y-2 text-xs uppercase tracking-[0.3em] text-slate-400">
              <span>{label}</span>
              <input
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
                placeholder={label}
                value={invoice.customer[field]}
                onChange={(event) => setInvoice((current) => ({ ...current, customer: { ...current.customer, [field]: event.target.value } }))}
              />
            </label>
          ))}
        </div>

        <div className="mt-5">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">Add products to invoice</div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-brand-500 sm:w-auto"
              defaultValue={productCatalog[0].key}
              onChange={(event) => addItem(event.target.value)}
            >
              {productCatalog.map((product) => (
                <option key={product.key} value={product.key}>
                  {product.label}
                </option>
              ))}
            </select>
            <button onClick={() => addItem()} className="w-full rounded-2xl border border-slate-700 px-4 py-3 text-slate-200 sm:w-auto">
              ➕ Add Selected Product
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {invoice.items.map((item, index) => (
              <div key={index} className="grid min-w-0 gap-3 rounded-3xl border border-slate-700/60 bg-slate-950/30 p-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.25fr)_72px_88px_96px] xl:items-end">
                <label className="min-w-0 space-y-2 text-[11px] uppercase tracking-[0.35em] text-slate-400">
                <span>Product</span>
                <select
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3.5 text-sm text-white outline-none focus:border-brand-500"
                  value={item.productKey || 'custom'}
                  onChange={(event) => updateProduct(index, event.target.value)}
                >
                  {productCatalog.map((product) => (
                    <option key={product.key} value={product.key}>
                      {product.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="min-w-0 space-y-2 text-[11px] uppercase tracking-[0.35em] text-slate-400 sm:col-span-2 xl:col-span-1">
                <span>{item.productKey === 'custom' ? 'Custom item text' : 'Item name'}</span>
                <input
                  className={`w-full rounded-2xl border px-4 py-3.5 text-sm text-white outline-none transition ${item.productKey === 'custom' ? 'border-brand-500 bg-slate-950/95 ring-1 ring-brand-500/30 placeholder:text-brand-100/40' : 'border-slate-700 bg-slate-950/70'}`}
                  value={item.name}
                  onChange={(event) => updateItem(index, 'name', event.target.value)}
                  placeholder={item.productKey === 'custom' ? 'Type the custom text here' : 'Product name'}
                />
                {item.productKey === 'custom' && <div className="text-[11px] normal-case tracking-normal text-brand-100/80">This text will show on the invoice.</div>}
              </label>

              <label className="min-w-0 space-y-2 text-[11px] uppercase tracking-[0.35em] text-slate-400">
                <span>Qty</span>
                <input className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3.5 text-sm text-white" type="number" value={item.quantity} onChange={(event) => updateItem(index, 'quantity', event.target.value)} />
              </label>

              <label className="min-w-0 space-y-2 text-[11px] uppercase tracking-[0.35em] text-slate-400">
                <span>Price</span>
                <input className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3.5 text-sm text-white" type="number" value={item.price} onChange={(event) => updateItem(index, 'price', event.target.value)} />
              </label>

              <div className="flex items-end xl:justify-stretch">
                <button onClick={() => removeItem(index)} className="w-full rounded-2xl border border-slate-700 px-4 py-3.5 text-slate-200 disabled:cursor-not-allowed disabled:opacity-40 xl:px-3" disabled={invoice.items.length === 1}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          <button onClick={create} className="w-full rounded-2xl bg-brand-600 px-4 py-3 font-semibold text-white hover:bg-brand-500">✓ Generate Invoice</button>
          <div className="grid gap-3 sm:grid-cols-2">
            <button onClick={() => downloadAsPdf(previewRef, 'invoice')} className="rounded-2xl border border-slate-700 px-4 py-3 text-slate-200 hover:bg-slate-800">📄 Export as PDF</button>
            <button onClick={() => directPrint(previewRef)} className="rounded-2xl border border-slate-700 px-4 py-3 text-slate-200 hover:bg-slate-800">🖨️ Print Invoice</button>
          </div>
        </div>
        {message && <div className="mt-3 text-sm text-slate-300">{message}</div>}
      </section>

      <section ref={previewRef} className="w-full min-w-0 print:p-0">
        <InvoicePreview invoice={previewModel} />
      </section>
    </div>
  );
}