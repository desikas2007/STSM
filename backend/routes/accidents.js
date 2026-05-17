const express = require("express");
const Accident = require("../models/Accident");
const authMiddleware = require("../middleware/authMiddleware");
const { generateSafetyAlert } = require("../services/openaiService");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const location = req.query.location || req.user.location;
    const accidents = await Accident.find({ location })
      .populate("reportedBy", "name email role")
      .sort({ createdAt: -1 });
    res.json(accidents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      peopleInvolved,
      injuriesReported,
      dateTime,
      imageUrl,
      blockchainTxHash,
    } = req.body;
    const location = req.user.location;

    let aiAlert = "";
    try {
      aiAlert = await generateSafetyAlert({ title, description });
    } catch (aiErr) {
      aiAlert = `⚠️ SAFETY ALERT: Accident reported in ${location}. Avoid the area and contact emergency services if needed.`;
    }

    const accident = await Accident.create({
      title,
      description,
      peopleInvolved,
      injuriesReported,
      dateTime,
      location,
      imageUrl,
      aiAlert,
      blockchainTxHash,
      reportedBy: req.user._id,
    });

    const populated = await Accident.findById(accident._id).populate(
      "reportedBy",
      "name email role"
    );
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
