const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: String,
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client"
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      quantity: Number,
      price: Number,
      total: Number
    }
  ],
  total: Number,
  remaining: Number, // montant restant à payer
  status: {
    type: String,
    enum: ["unpaid", "partial", "paid"],
    default: "unpaid"
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Invoice", invoiceSchema);