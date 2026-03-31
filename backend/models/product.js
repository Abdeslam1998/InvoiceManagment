const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // nom unique
  price: Number,
  stock: Number
});

module.exports = mongoose.model("Product", productSchema);