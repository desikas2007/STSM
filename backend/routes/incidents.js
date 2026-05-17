const express = require("express");
const Incident = require("../models/Incident");
const authMiddleware = require("../middleware/authMiddleware");
const { analyzeIncident } = require("../services/openaiService");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const location = req.query.location || req.user.location;
    const incidents = await Incident.find({ location })
      .populate("reportedBy", "name email role")
      .sort({ createdAt: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "data_provider") {
      return res.status(403).json({ message: "Only data providers can create incidents" });
    }

    const { title, description, severity, dateTime, imageUrl, blockchainTxHash } = req.body;
    const location = req.user.location;

    let aiAnalysis = null;
    try {
      aiAnalysis = await analyzeIncident(title, description, severity);
    } catch (aiErr) {
      aiAnalysis = {
        riskLevel: severity,
        safetyAdvice: "AI analysis unavailable. Exercise caution in the area.",
        recommendedAction: "Follow local authority guidance.",
        affectedRadius: "500 meters",
      };
    }

    const incident = await Incident.create({
      title,
      description,
      severity,
      dateTime,
      location,
      imageUrl,
      aiAnalysis,
      blockchainTxHash,
      reportedBy: req.user._id,
    });

    const populated = await Incident.findById(incident._id).populate(
      "reportedBy",
      "name email role"
    );
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
