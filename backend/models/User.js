const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  mobile: { type: String, required: true, minlength: 10, maxlength: 10 },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["tourist", "data_provider"],
    required: true,
  },
  location: {
    type: String,
    enum: ["Kodaikanal", "Ooty", "Munnar", "Coorg", "Shimla"],
    required: true,
  },
  walletAddress: { type: String, default: null },
  blockchainIDIssued: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
