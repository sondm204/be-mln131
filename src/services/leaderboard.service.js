import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FILE = path.join(__dirname, "..", "data", "leaderboard.json");

export async function readLeaderboard() {
  const data = await fs.readFile(FILE, "utf8");
  return JSON.parse(data);
}

export async function saveScore(entry) {
  const leaderboard = await readLeaderboard();

  const updated = [...leaderboard, entry]
    .sort((a, b) => {
      if (b.percentage !== a.percentage) return b.percentage - a.percentage;
      return b.score - a.score;
    })
    .slice(0, 100);

  await fs.writeFile(FILE, JSON.stringify(updated, null, 2));
  return updated;
}

export async function clearLeaderboard() {
  await fs.writeFile(FILE, JSON.stringify([], null, 2));
}
