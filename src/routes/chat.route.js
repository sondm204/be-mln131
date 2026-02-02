import express from "express";
import { loadKnowledge } from "../services/knowledge.service.js";
import { askGemini } from "../services/gemini.service.js";
import { extractJson } from "../utils/json.util.js";


const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required"
      });
    }

    const knowledge = loadKnowledge();
    const raw = await askGemini(message, knowledge);

    let parsed;
    try {
      const jsonString = extractJson(raw);
      if (!jsonString) throw new Error("No JSON found");

      parsed = JSON.parse(jsonString);
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: "AI returned invalid JSON",
        raw
      });
    }

    res.json(parsed);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});


export default router;
