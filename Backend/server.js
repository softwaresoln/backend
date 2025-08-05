const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY not found in .env");
  process.exit(1);
}

app.use(cors());
app.use(express.json());

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

app.post("/chat", async (req, res) => {
  const { chatHistory } = req.body;

  if (!Array.isArray(chatHistory) || chatHistory.length === 0) {
    return res.status(400).json({ error: "Invalid or empty chat history." });
  }

  try {
    const formattedHistory = chatHistory.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

    // Add short-format instruction
    formattedHistory.push({
      role: "user",
      parts: [{
        text: "Please respond briefly in 3–5 lines. Use line breaks or short bullets. Format links clearly. Avoid long paragraphs."
      }]
    });

    const response = await axios.post(GEMINI_URL, {
      contents: formattedHistory,
      generationConfig: {
        temperature: 0.3,
        topK: 30,
        topP: 0.7,
        maxOutputTokens: 150,
        stopSequences: [],
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: 3 },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: 3 },
        { category: "HARM_CATEGORY_HARASSMENT", threshold: 3 },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: 3 },
        { category: "HARM_CATEGORY_CIVIC_INTEGRITY", threshold: 3 },
      ],
    });

    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
    res.json({ reply });
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Error talking to Gemini API." });
  }
});

app.get("/", (req, res) => {
  res.send("✅ TaxMate backend is running.");
});

app.listen(PORT, () => {
  console.log(`✅ TaxMate backend running at http://localhost:${PORT}`);
});
