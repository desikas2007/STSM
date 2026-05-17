const OpenAI = require("openai");

if (!process.env.OPENAI_API_KEY) {
  console.warn("WARNING: OPENAI_API_KEY is not set. AI features will fail until this environment variable is configured.");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
      content: `You are SafeBot, an AI assistant for the Smart Tourist Safety System. You help tourists with safety advice, emergency procedures, and local information. The user is currently in ${userLocation || "an unknown location"}.`,
    },
    ...history,
    { role: "user", content: userMessage },
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    temperature: 0.7,
  });

  return completion.choices[0].message.content;
}

module.exports = {
  analyzeIncident,
  generateSafetyAlert,
  summarizeNews,
  chatWithAI,
};
