import fs from "fs";
import path from "path";
import { ask } from "./llm.mjs";

const repo = process.env.GITHUB_REPOSITORY;
const gh = { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: "application/vnd.github+json" };
const issue = await (await fetch(`https://api.github.com/repos/${repo}/issues/${process.env.ISSUE_NUMBER}`, { headers: gh })).json();

const strategy = fs.readFileSync("STRATEGY.md", "utf8");
const files = fs.readdirSync(".", { recursive: true })
  .filter((f) => !f.startsWith(".git") && !f.startsWith("node_modules") && fs.statSync(f).isFile());
const fileList = files.slice(0, 200).join("\n");

const plan = await ask(
  `STRATEGY:\n${strategy}\n\nFILES:\n${fileList}\n\nTASK: ${issue.title}\n${issue.body}\n\nWrite a short step-by-step plan and list which files to create or change.`,
  "You are a software planner. Be concise and specific."
);

let feedback = "";
let result;
for (let round = 0; round < 3; round++) {
  const relevant = files
    .filter((f) => plan.includes(f) && fs.statSync(f).size < 30000)
    .map((f) => `--- ${f} ---\n${fs.readFileSync(f, "utf8")}`)
    .join("\n");

  result = JSON.parse(await ask(
    `PLAN:\n${plan}\n\nEXISTING FILES:\n${relevant}\n\nREVIEWER FEEDBACK:\n${feedback || "none"}\n\nReturn JSON: {"files":[{"path":"...","content":"full file content"}]}`,
    "You are a senior developer. Write complete, working code. JSON only.",
    true
  ));

  const review = JSON.parse(await ask(
    `TASK: ${issue.title}\n${issue.body}\n\nCODE:\n${JSON.stringify(result.files)}\n\nReturn JSON: {"approved": true/false, "feedback": "problems to fix"}`,
    "You are a strict code reviewer. Check for bugs and security problems. JSON only.",
    true
  ));
  if (review.approved) break;
  feedback = review.feedback;
}

for (const f of result.files) {
  const p = path.normalize(f.path);
  if (p.startsWith("..") || path.isAbsolute(p) || p.startsWith(".github")) continue;
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, f.content);
}
fs.writeFileSync(".agent-title.txt", issue.title);
