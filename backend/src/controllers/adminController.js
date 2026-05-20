const asyncHandler = require('../utils/asyncHandler');
const { parse } = require('csv-parse');
const Label = require('../models/Label');
const Invoice = require('../models/Invoice');
const User = require('../models/User');
const { parseAddressInput, getCategory } = require('../services/addressParser');
const { createTrackingId, createInvoiceId } = require('../utils/generateIds');

const getStats = asyncHandler(async (_req, res) => {
  const [totalLabels, totalInvoices, totalUsers, latestLabels] = await Promise.all([
    Label.countDocuments(),
    Invoice.countDocuments(),
    User.countDocuments(),
    Label.find().sort({ createdAt: -1 }).limit(10).populate('user', 'name email'),
  ]);

  res.json({
    stats: { totalLabels, totalInvoices, totalUsers },
    latestLabels,
  });
});

const bulkUpload = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const text = file.buffer.toString('utf8');
  const rows = [];

  await new Promise((resolve, reject) => {
    parse(
      text,
      { columns: true, skip_empty_lines: true, trim: true },
      (err, parsed) => {
        if (err) return reject(err);
        rows.push(...parsed);
        resolve();
      },
    );
  });

  const created = [];
  for (const row of rows.slice(0, 500)) {
    const raw = Object.values(row).join('\n');
    const parsed = parseAddressInput(raw);
    const label = await Label.create({
      user: req.user._id,
      rawInput: raw,
      parsedData: { ...parsed, category: getCategory(parsed.amount) },
      trackingId: createTrackingId(),
      invoiceId: createInvoiceId(),
      template: 'vertical',
    });
    created.push(label);
  }

  res.json({ message: 'Bulk upload complete', uploaded: created.length, labels: created });
});

module.exports = { getStats, bulkUpload };