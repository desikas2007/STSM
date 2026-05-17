const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  analyzeIncident,
  generateSafetyAlert,
  summarizeNews,
  chatWithAI,
} = require("../services/openaiService");

const router = express.Router();

router.post("/analyze-incident", authMiddleware, async (req, res) => {
  try {
    const { title, description, severity } = req.body;
    const result = await analyzeIncident(title, description, severity);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/generate-alert", authMiddleware, async (req, res) => {
  try {
    const { title, description } = req.body;
    const alert = await generateSafetyAlert({ title, description });
    res.json({ alert });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/summarize-news", authMiddleware, async (req, res) => {
  try {
    const { headline, body } = req.body;
    const result = await summarizeNews(headline, body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/chat", authMiddleware, async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        message: "Server error: OpenAI API key not configured",
        details: "OPENAI_API_KEY environment variable is not set" 
      });
    }

    const { message, location } = req.body;
    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    if (!req.session.chatHistory) {
      req.session.chatHistory = [];
    }

    const userLocation = location || req.user.location;
    const reply = await chatWithAI(
      message,
      userLocation,
      req.session.chatHistory
    );

    req.session.chatHistory.push(
      { role: "user", content: message },
      { role: "assistant", content: reply }
    );

    if (req.session.chatHistory.length > 20) {
      req.session.chatHistory = req.session.chatHistory.slice(-20);
    }

    res.json({ reply });
  } catch (error) {
    console.error("Chat endpoint error:", error);
    res.status(500).json({ 
      message: "Failed to process chat request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

module.exports = router;
