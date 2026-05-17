const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  severity: {
    type: String,
    enum: ["Low", "Medium", "High", "Critical"],
    required: true,
  },
  dateTime: { type: Date, required: true },
  location: { type: String, required: true },
  imageUrl: { type: String },
  aiAnalysis: {
    riskLevel: String,
    safetyAdvice: String,
    recommendedAction: String,
    affectedRadius: String,
  },
  blockchainTxHash: { type: String },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Incident", incidentSchema);
