Run node agents/build.mjs
file:///home/runner/work/farm-market/farm-market/agents/llm.mjs:18
  if (!res.ok) throw new Error(JSON.stringify(data));
                     ^

Error: {"error":{"message":"Rate limit reached for model `openai/gpt-oss-120b` in organization `org_01m4efacb0entrtm6n9c4br3cn` service tier `on_demand` on tokens per minute (TPM): Limit 8000, Used 5051, Requested 2980. Please try again in 232.499999ms. Need more tokens? Upgrade to Dev Tier today at https://console.groq.com/settings/billing","type":"tokens","code":"rate_limit_exceeded"}}
    at ask (file:///home/runner/work/farm-market/farm-market/agents/llm.mjs:18:22)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async file:///home/runner/work/farm-market/farm-market/agents/build.mjs:33:29

Node.js v20.20.2
Error: Process completed with exit code 1.
