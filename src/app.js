import express from "express";
import cors from "cors";
import chatRoute from "./routes/chat.route.js";
import leaderboardRoute from "./routes/leaderboard.route.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/chat", chatRoute);
app.use("/leaderboard", leaderboardRoute);

// ====================== URLSCAN PROXY API ======================
const URLSCAN_API_BASE = "https://urlscan.io/api/v1";
const URLSCAN_API_KEY = process.env.URLSCAN_API_KEY || "019c2e22-3ca4-7519-8187-3ec3081bbb8b";

// Helper sleep
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

app.post("/urlscan/scan", async (req, res) => {
  const { url } = req.body || {};

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  if (!URLSCAN_API_KEY || URLSCAN_API_KEY === "YOUR_URLSCAN_API_KEY_HERE") {
    return res.status(500).json({
      error: "URLSCAN_API_KEY is not configured on the backend",
    });
  }

  try {
    // 1. Submit URL để tạo scan
    const scanRes = await fetch(`${URLSCAN_API_BASE}/scan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": URLSCAN_API_KEY,
      },
      body: JSON.stringify({
        url,
        visibility: "public",
      }),
    });

    if (!scanRes.ok) {
      const text = await scanRes.text();
      return res.status(scanRes.status).json({
        error: "Failed to create scan on urlscan.io",
        details: text,
      });
    }

    const scanData = await scanRes.json();
    const scanId = scanData.uuid;

    if (!scanId) {
      return res.status(500).json({
        error: "No scanId (uuid) returned from urlscan.io",
      });
    }

    // 2. Poll kết quả scan từ urlscan.io
    const maxAttempts = 10;
    let resultData = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const delay = attempt === 0 ? 10000 : 2000; // 10s lần đầu, sau đó 2s
      await sleep(delay);

      const resultRes = await fetch(`${URLSCAN_API_BASE}/result/${scanId}/`, {
        headers: {
          "api-key": URLSCAN_API_KEY,
        },
      });

      if (!resultRes.ok) {
        // Có thể là 404 tạm thời, tiếp tục thử
        continue;
      }

      const data = await resultRes.json();

      if (data.task && data.task.status && data.task.status !== "done") {
        // Scan chưa xong, tiếp tục poll
        continue;
      }

      resultData = data;
      break;
    }

    if (!resultData) {
      return res.status(504).json({
        error: "Timed out waiting for urlscan.io result",
      });
    }

    // Chỉ gửi về những field frontend cần
    const { stats, page } = resultData;

    return res.json({
      stats,
      page,
      scanId,
    });
  } catch (err) {
    console.error("Error calling urlscan.io:", err);
    return res.status(500).json({
      error: "Internal server error while calling urlscan.io",
      details: err.message,
    });
  }
});
// ===============================================================
// Screenshot: proxy ảnh PNG từ urlscan.io về cho frontend
app.get("/urlscan/screenshot/:scanId", async (req, res) => {
  const { scanId } = req.params;

  if (!scanId) {
    return res.status(400).json({ error: "scanId is required" });
  }

  if (!URLSCAN_API_KEY || URLSCAN_API_KEY === "YOUR_URLSCAN_API_KEY_HERE") {
    return res.status(500).json({
      error: "URLSCAN_API_KEY is not configured on the backend",
    });
  }

  try {
    const upstreamRes = await fetch(
      `https://urlscan.io/screenshots/${scanId}.png`,
      {
        headers: {
          "api-key": URLSCAN_API_KEY,
        },
      }
    );

    if (!upstreamRes.ok) {
      const text = await upstreamRes.text();
      return res.status(upstreamRes.status).json({
        error: "Failed to fetch screenshot from urlscan.io",
        details: text,
      });
    }

    const arrayBuffer = await upstreamRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", "image/png");
    res.send(buffer);
  } catch (err) {
    console.error("Error fetching screenshot from urlscan.io:", err);
    return res.status(500).json({
      error: "Internal server error while fetching screenshot",
      details: err.message,
    });
  }
});

app.listen(3000, () => {
  console.log("API running at http://localhost:3000");
});
