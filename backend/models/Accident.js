const mongoose = require("mongoose");

const accidentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  peopleInvolved: { type: Number, default: 0 },
  injuriesReported: { type: Boolean, default: false },
  dateTime: { type: Date, required: true },
  location: { type: String, required: true },
  imageUrl: { type: String },
  aiAlert: { type: String },
  blockchainTxHash: { type: String },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Accident", accidentSchema);
