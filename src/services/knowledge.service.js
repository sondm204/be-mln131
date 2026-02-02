import fs from "fs";
import path from "path";

const knowledgePath = path.join("knowledge", "data.txt");

export function loadKnowledge() {
  const text = fs.readFileSync(knowledgePath, "utf-8");
  return text;
}
