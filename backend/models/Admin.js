const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  responsibleName: { type: String, default: "" },
  companyName: { type: String, default: "" },
  address: { type: String, default: "" },
  phone: { type: String, default: "" }
});

module.exports = mongoose.model("Admin", adminSchema);