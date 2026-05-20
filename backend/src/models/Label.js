const mongoose = require('mongoose');

const labelSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rawInput: { type: String, required: true },
    parsedData: {
      name: String,
      address: String,
      pincode: String,
      phone: String,
      amount: Number,
      category: String,
    },
    trackingId: { type: String, required: true, unique: true },
    invoiceId: { type: String, required: true, unique: true },
    imagePath: String,
    template: { type: String, default: 'vertical' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Label', labelSchema);