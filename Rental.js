const mongoose = require("mongoose");

const rentalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  status: { type: String, default: "pending" },
  requestedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Rental", rentalSchema);
