const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    invoiceNumber: { type: String, required: true, unique: true },
    customer: {
      name: String,
      phone: String,
      address: String,
      pincode: String,
    },
    items: [
      {
        name: String,
        quantity: Number,
        price: Number,
      },
    ],
    subtotal: Number,
    tax: Number,
    total: Number,
    paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Failed'], default: 'Pending' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Invoice', invoiceSchema);