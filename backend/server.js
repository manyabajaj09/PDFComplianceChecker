const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const axios = require('axios');
require('dotenv').config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Extract PDF
app.post("/api/extract-pdf", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No PDF uploaded" });

    const data = await pdfParse(req.file.buffer);
    res.json({ text: data.text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check rules using OpenAI FREE MODEL
app.post("/api/check-rules", async (req, res) => {
  try {
    const { text, rules } = req.body;

    const results = [];

    for (const rule of rules) {
      const prompt = `
You are a document compliance checker. Analyze the following document text for this rule: "${rule}"

Document text:
${text.substring(0, 6000)}

Respond ONLY with JSON:
{
  "rule": "${rule}",
  "status": "pass" or "fail",
  "evidence": "one sentence from document",
  "reasoning": "short explanation",
  "confidence": number 0-100
}`;

      const openaiResponse = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4.1-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 500
        },
        {
          headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      const raw = openaiResponse.data.choices[0].message.content;
      const clean = raw.replace(/```json|```/g, '').trim();

      results.push(JSON.parse(clean));
    }

    res.json({ results });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
