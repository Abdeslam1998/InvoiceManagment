const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  name: String,
  phone: { type: String, required: true, unique: true }, // phone unique
  address: String,
  email: { type: String, required: true, unique: true }, // email unique
});

module.exports = mongoose.model("Client", clientSchema);