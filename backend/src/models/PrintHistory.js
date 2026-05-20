const mongoose = require('mongoose');

const printHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    label: { type: mongoose.Schema.Types.ObjectId, ref: 'Label' },
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
    type: { type: String, enum: ['label', 'invoice'], required: true },
    printedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model('PrintHistory', printHistorySchema);