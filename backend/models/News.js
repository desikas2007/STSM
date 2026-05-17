const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema({
  headline: { type: String, required: true },
  body: { type: String, required: true },
  source: { type: String },
  date: { type: Date },
  location: { type: String, required: true },
  aiSummary: { type: String },
  aiTips: [{ type: String }],
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("News", newsSchema);
