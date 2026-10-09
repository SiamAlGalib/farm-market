const GEMINI_MODEL = "gemini-2.5-flash";
const GROQ_MODEL = "openai/gpt-oss-120b";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function callGemini(prompt, system, json) {
  const key = process.env.GEMINI_API_KEY;
  const standard = key.startsWith("AIza");
  const url = standard
    ? `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`
    : `https://aiplatform.googleapis.com/v1/publishers/google/models/${GEMINI_MODEL}:generateContent?key=${key}`;
  const headers = { "Content-Type": "application/json" };
  if (standard) headers["x-goog-api-key"] = key;
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 16000,
        ...(json ? { responseMimeType: "application/json" } : {}),
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    const e = new Error(JSON.stringify(data).slice(0, 800));
    e.status = res.status;
    throw e;
  }
  return data.candidates[0].content.parts[0].text;
}

async function callGroq(prompt, system, json) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      reasoning_effort: "low",
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    const e = new Error(JSON.stringify(data).slice(0, 800));
    e.status = res.status;
    throw e;
  }
  return data.choices[0].message.content;
}

// Tries Gemini first (if a key exists), then Groq. Retries on rate limits and bad JSON.
export async function ask(prompt, system, json = false) {
  const providers = [];
  if (process.env.GEMINI_API_KEY) providers.push(callGemini);
  if (process.env.GROQ_API_KEY) providers.push(callGroq);
  let lastErr;
  for (const call of providers) {
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        return await call(prompt, system, json);
      } catch (e) {
        lastErr = e;
        console.log(`${call.name} failed (${e.status}), attempt ${attempt}`);
        const retry =
          e.status === 429 || e.status === 503 || /json_validate_failed/.test(e.message);
        if (!retry) break;
        await sleep(e.status === 429 ? 15000 * attempt : 3000);
      }
    }
  }
  throw lastErr;
}
