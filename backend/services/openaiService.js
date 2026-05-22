const OpenAI = require("openai");

if (!process.env.OPENAI_API_KEY) {
  console.error("❌ CRITICAL: OPENAI_API_KEY is missing in backend/.env");
  console.error("   To fix: Get API key from https://openrouter.ai/keys and add to .env");
} else {
  console.log("✓ OpenRouter API Key configured and ready");
}

// Using OpenRouter API (compatible with OpenAI SDK)
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",  // OpenRouter endpoint
  timeout: 30000,  // 30 second timeout
  maxRetries: 2,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5000",  // Optional: helps with rate limiting
    "X-Title": "Smart Tourist Safety"  // Optional: custom header
  }
});

function parseJsonFromText(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    return JSON.parse(match[0]);
  }
  return JSON.parse(text);
}

async function analyzeIncident(title, description, severity) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: `You are a tourist safety AI. Analyze this incident report.
Title: ${title}. Description: ${description}. Severity: ${severity}.
Return JSON with keys:
{ "riskLevel": "Low|Medium|High|Critical",
  "safetyAdvice": "string (2-3 sentences)",
  "recommendedAction": "string",
  "affectedRadius": "string (e.g. '500 meters')" }
Return only valid JSON.`,
      },
    ],
    temperature: 0.3,
  });

  const content = completion.choices[0].message.content;
  return parseJsonFromText(content);
}

async function generateSafetyAlert(accidentData) {
  const { title, description } = accidentData;
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: `Generate a short emergency broadcast message (max 100 words) for this accident:
Title: ${title}
Description: ${description}
Format your response as: "⚠️ SAFETY ALERT: [message]"`,
      },
    ],
    temperature: 0.5,
  });

  return completion.choices[0].message.content.trim();
}

async function summarizeNews(headline, body) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: `Summarize this news for tourists.
Headline: ${headline}
Body: ${body}
Return JSON: { "summary": "2-sentence summary", "tips": ["tip1", "tip2", "tip3"] }
Return only valid JSON with exactly 3 tips.`,
      },
    ],
    temperature: 0.4,
  });

  return parseJsonFromText(completion.choices[0].message.content);
}

async function chatWithAI(userMessage, userLocation, history = []) {
  const messages = [
    {
      role: "system",
      content: `You are SafeBot, an AI safety assistant for tourists. Provide practical safety advice and local information. User location: ${userLocation || "unknown"}. Be concise, helpful, and prioritize safety. If emergency info needed, provide specific steps.`,
    },
    ...history,
    { role: "user", content: userMessage },
  ];

  try {
    console.log(`[OpenRouter] Sending chat request (${messages.length} messages, history: ${history.length})`);
    
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o",  // OpenRouter model name
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    if (!completion.choices || completion.choices.length === 0) {
      throw new Error("No response from OpenRouter API");
    }

    const reply = completion.choices[0].message.content;
    console.log(`[OpenRouter] ✓ Response received (${reply.length} chars)`);
    return reply;
  } catch (error) {
    console.error(`[OpenRouter] API Error:`, {
      name: error.name,
      message: error.message,
      status: error.status,
      code: error.code
    });
    throw error;
  }
}

module.exports = {
  analyzeIncident,
  generateSafetyAlert,
  summarizeNews,
  chatWithAI,
};
