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
    console.log("✅ PDF extracted, text length:", data.text.length);
    res.json({ text: data.text });
  } catch (err) {
    console.error("❌ PDF extraction error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Check rules using OpenAI
app.post("/api/check-rules", async (req, res) => {
  try {
    const { text, rules } = req.body;

    if (!text || !rules) {
      return res.status(400).json({ error: "Missing text or rules" });
    }

    console.log("📋 Checking", rules.length, "rules...");

    const results = [];

    for (const rule of rules) {
      try {
        const prompt = `You are a document compliance checker. Analyze the following document text for this rule: "${rule}"

Document text:
${text.substring(0, 6000)}

Respond ONLY with JSON (no markdown, no backticks):
{
  "rule": "${rule}",
  "status": "pass" or "fail",
  "evidence": "one sentence from document",
  "reasoning": "short explanation",
  "confidence": 85
}`;

        console.log("🤖 Calling OpenAI for rule:", rule);

        const openaiResponse = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-4o-mini", // ✅ FIXED: was "gpt-4.1-mini"
            messages: [{ role: "user", content: prompt }],
            max_tokens: 500,
            temperature: 0.3
          },
          {
            headers: {
              "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
              "Content-Type": "application/json"
            }
          }
        );

        const raw = openaiResponse.data.choices[0].message.content;
        console.log("📥 Raw response:", raw);

        const clean = raw.replace(/```json\n?|```\n?/g, '').trim();
        const parsed = JSON.parse(clean);
        
        console.log("✅ Parsed result:", parsed);
        results.push(parsed);

      } catch (ruleError) {
        console.error("❌ Error checking rule:", rule, ruleError.message);
        results.push({
          rule: rule,
          status: "fail",
          evidence: "Error processing this rule",
          reasoning: ruleError.message,
          confidence: 0
        });
      }
    }

    console.log("✅ Sending", results.length, "results to frontend");
    res.json({ results });

  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
  console.log("📝 OpenAI API Key:", process.env.OPENAI_API_KEY ? "Found ✅" : "Missing ❌");
});