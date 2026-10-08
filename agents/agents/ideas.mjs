import fs from "fs";
import { ask } from "./llm.mjs";

const repo = process.env.GITHUB_REPOSITORY;
const strategy = fs.readFileSync("STRATEGY.md", "utf8");
const files = fs
  .readdirSync(".", { recursive: true })
  .filter((f) => !f.startsWith(".git") && !f.startsWith("node_modules"))
  .slice(0, 200)
  .join("\n");

const out = await ask(
  `STRATEGY:\n${strategy}\n\nCURRENT FILES:\n${files}\n\nPropose the 3 most valuable next features as a JSON array of {"title": "...", "spec": "what it does, who it's for, what done looks like"}.`,
  "You are a product manager. Suggest small, buildable features that fit the strategy. Respond with JSON only.",
  true
);

for (const idea of JSON.parse(out).slice(0, 3)) {
  await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
    body: JSON.stringify({ title: idea.title, body: idea.spec, labels: ["idea"] }),
  });
}
