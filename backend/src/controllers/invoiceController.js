const asyncHandler = require('../utils/asyncHandler');
const Invoice = require('../models/Invoice');
const PrintHistory = require('../models/PrintHistory');
const { createInvoiceId } = require('../utils/generateIds');

const createInvoice = asyncHandler(async (req, res) => {
  const { customer, items = [], paymentStatus = 'Pending', taxRate = 18 } = req.body;
  const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  const tax = subtotal * (Number(taxRate) / 100);
  const total = subtotal + tax;

  const invoice = await Invoice.create({
    user: req.user._id,
    invoiceNumber: createInvoiceId(),
    customer,
    items,
    subtotal,
    tax,
    total,
    paymentStatus,
  });

  res.status(201).json({ invoice });
});

const getInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(200);
  res.json({ invoices });
});

const registerInvoicePrint = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, user: req.user._id });
  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }
  await PrintHistory.create({ user: req.user._id, invoice: invoice._id, type: 'invoice' });
  res.json({ message: 'Invoice print registered' });
});

module.exports = { createInvoice, getInvoices, registerInvoicePrint };