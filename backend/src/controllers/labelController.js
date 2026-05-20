const asyncHandler = require('../utils/asyncHandler');
const Label = require('../models/Label');
const PrintHistory = require('../models/PrintHistory');
const { parseAddressInput, getCategory } = require('../services/addressParser');
const { createTrackingId, createInvoiceId } = require('../utils/generateIds');

function getUserId(user) {
  return user?._id || user?.id;
}

const createLabel = asyncHandler(async (req, res) => {
  const { rawInput, template = 'vertical' } = req.body;
  const parsed = parseAddressInput(rawInput);
  const parsedData = { ...parsed, category: getCategory(parsed.amount) };
  const userId = getUserId(req.user);

  if (!userId) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const label = await Label.create({
    user: userId,
    rawInput,
    parsedData,
    trackingId: createTrackingId(),
    invoiceId: createInvoiceId(),
    template,
  });

  res.status(201).json({ label });
});

const getLabels = asyncHandler(async (req, res) => {
  const { q, startDate, endDate } = req.query;
  const userId = getUserId(req.user);
  const query = { user: userId };
  if (q) {
    query.$or = [
      { trackingId: new RegExp(q, 'i') },
      { invoiceId: new RegExp(q, 'i') },
      { rawInput: new RegExp(q, 'i') },
      { 'parsedData.name': new RegExp(q, 'i') },
    ];
  }
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const labels = await Label.find(query).sort({ createdAt: -1 }).limit(200);
  res.json({ labels });
});

const getLabelById = asyncHandler(async (req, res) => {
  const label = await Label.findOne({ _id: req.params.id, user: getUserId(req.user) });
  if (!label) {
    res.status(404);
    throw new Error('Label not found');
  }
  res.json({ label });
});

const deleteLabel = asyncHandler(async (req, res) => {
  const label = await Label.findOneAndDelete({ _id: req.params.id, user: getUserId(req.user) });
  if (!label) {
    res.status(404);
    throw new Error('Label not found');
  }
  res.json({ message: 'Label deleted' });
});

const registerPrint = asyncHandler(async (req, res) => {
  const label = await Label.findOne({ _id: req.params.id, user: getUserId(req.user) });
  if (!label) {
    res.status(404);
    throw new Error('Label not found');
  }
  await PrintHistory.create({ user: getUserId(req.user), label: label._id, type: 'label' });
  res.json({ message: 'Print registered' });
});

module.exports = { createLabel, getLabels, getLabelById, deleteLabel, registerPrint };