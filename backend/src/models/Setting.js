const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    companyName: String,
    supportNumber: String,
    logoUrl: String,
    defaultTemplate: { type: String, default: 'vertical' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Setting', settingSchema);