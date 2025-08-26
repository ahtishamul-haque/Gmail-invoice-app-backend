const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  vendor: String,
  amount: Number,
  date: Date,
  category: String,
  emailId: String,
});

module.exports = mongoose.model("Invoice", invoiceSchema);
