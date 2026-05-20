const asyncHandler = require('../utils/asyncHandler');
const Setting = require('../models/Setting');

const getSettings = asyncHandler(async (_req, res) => {
  const settings = await Setting.findOne().sort({ createdAt: -1 });
  res.json({ settings });
});

const updateSettings = asyncHandler(async (req, res) => {
  const settings = await Setting.findOneAndUpdate({}, req.body, { new: true, upsert: true });
  res.json({ settings });
});

module.exports = { getSettings, updateSettings };