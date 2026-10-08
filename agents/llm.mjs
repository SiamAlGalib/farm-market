export async function ask(prompt, system, json = false) {
  const maxAttempts = 6;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
        ...(json ? { response_format: { type: "json_object" } } : {}),
      }),
    });
    const data = await res.json();
    if (res.ok) return data.choices[0].message.content;

    // Rate limited: wait and try again
    if (res.status === 429 && attempt < maxAttempts) {
      const waitMs = Math.min(20000 * attempt, 60000);
      console.log(`Rate limited. Waiting ${waitMs / 1000}s (attempt ${attempt})`);
      await new Promise((r) => setTimeout(r, waitMs));
      continue;
    }
    throw new Error(JSON.stringify(data));
  }
}
