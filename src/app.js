import express from "express";
import cors from "cors";
import chatRoute from "./routes/chat.route.js";
import leaderboardRoute from "./routes/leaderboard.route.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/chat", chatRoute);
app.use("/leaderboard", leaderboardRoute);

app.listen(3000, () => {
  console.log("API running at http://localhost:3000");
});
