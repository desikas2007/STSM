const express = require("express");
const News = require("../models/News");
const authMiddleware = require("../middleware/authMiddleware");
const { summarizeNews } = require("../services/openaiService");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const location = req.query.location || req.user.location;
    const news = await News.find({ location })
      .populate("postedBy", "name email role")
      .sort({ createdAt: -1 });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "data_provider") {
      return res.status(403).json({ message: "Only data providers can post news" });
    }

    const { headline, body, source, date } = req.body;
    const location = req.user.location;

    let aiSummary = "";
    let aiTips = [];
    try {
      const result = await summarizeNews(headline, body);
      aiSummary = result.summary;
      aiTips = result.tips || [];
    } catch (aiErr) {
      aiSummary = "Summary unavailable.";
      aiTips = ["Stay informed", "Follow local guidelines", "Keep emergency contacts handy"];
    }

    const newsItem = await News.create({
      headline,
      body,
      source,
      date,
      location,
      aiSummary,
      aiTips,
      postedBy: req.user._id,
    });

    const populated = await News.findById(newsItem._id).populate(
      "postedBy",
      "name email role"
    );
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
