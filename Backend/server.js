// Backend/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY not found in .env");
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Use the correct URL and model from your Google AI Studio
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage || typeof userMessage !== "string") {
    return res.status(400).json({ error: "Invalid or empty message." });
  }

  try {
    const response = await axios.post(GEMINI_URL, {
      contents: [
        {
          parts: [{ text: userMessage }],
        },
      ],
    });

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";

    console.log(`👤 User: ${userMessage}`);
    console.log(`🤖 Gemini: ${reply}`);

    res.json({ reply });
  } catch (error) {
    console.error("❌ Gemini API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Error talking to Gemini API." });
  }
});

// Add this before `app.listen`
app.get("/", (req, res) => {
  res.send("✅ Gemini backend is running.");
});



app.listen(PORT, () => {
  console.log(`✅ Gemini chatbot backend running at http://localhost:${PORT}`);
});
