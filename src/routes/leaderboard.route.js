import express from "express";
import {
  readLeaderboard,
  saveScore,
  clearLeaderboard
} from "../services/leaderboard.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const data = await readLeaderboard();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, chapter, score, total } = req.body;

    if (!name || score == null || total == null) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields"
      });
    }

    const entry = {
      name: String(name).slice(0, 30),
      chapter: chapter || "Chương 4",
      score: Number(score),
      total: Number(total),
      percentage: Math.round((score / total) * 100),
      date: new Date().toISOString()
    };

    const data = await saveScore(entry);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/", async (req, res) => {
  await clearLeaderboard();
  res.json({ success: true });
});

export default router;
