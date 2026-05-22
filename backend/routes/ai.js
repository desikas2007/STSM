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
      console.error("[AI Chat] Missing OPENAI_API_KEY environment variable");
      return res.status(500).json({ 
        message: "Server error: OpenAI API key not configured",
        details: "Please set OPENAI_API_KEY in backend/.env",
        error: "CONFIG_ERROR"
      });
    }

    const { message, location } = req.body;
    if (!message || message.trim() === "") {
      return res.status(400).json({ 
        message: "Message cannot be empty",
        error: "INVALID_INPUT"
      });
    }

    if (!req.session.chatHistory) {
      req.session.chatHistory = [];
    }

    const userLocation = location || req.user.location || "unknown";
    console.log(`[AI] User ${req.user.email} from ${userLocation}: "${message.substring(0, 50)}..."`);
    
    try {
      const reply = await chatWithAI(
        message,
        userLocation,
        req.session.chatHistory
      );

      req.session.chatHistory.push(
        { role: "user", content: message },
        { role: "assistant", content: reply }
      );

      if (req.session.chatHistory.length > 40) {
        req.session.chatHistory = req.session.chatHistory.slice(-40);
      }

      console.log(`[AI] Reply sent successfully (${reply.length} chars)`);
      res.json({ reply });
    } catch (aiError) {
      console.error("[AI] OpenAI Service Error:", {
        message: aiError.message,
        status: aiError.status,
        type: aiError.type
      });
      
      if (aiError.status === 401) {
        return res.status(500).json({ 
          message: "API authentication failed",
          details: "Your OpenAI API key is invalid or expired",
          error: "API_AUTH_ERROR"
        });
      } else if (aiError.status === 429) {
        return res.status(429).json({ 
          message: "API rate limit exceeded",
          details: "Please wait a moment and try again",
          error: "RATE_LIMIT"
        });
      }
      throw aiError;
    }
  } catch (error) {
    console.error("[AI] Unhandled error:", error.message);
    res.status(500).json({ 
      message: "Failed to process chat request",
      details: process.env.NODE_ENV === "development" ? error.message : "Internal error",
      error: "SERVER_ERROR"
    });
  }
});

module.exports = router;
