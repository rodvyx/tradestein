// Simple client using fetch; no extra deps needed.
// Requires VITE_OPENAI_API_KEY in your .env

const API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o"; // GPT-4 class model

export async function chatWithAI(messages) {
  const key = import.meta.env.VITE_OPENAI_API_KEY;
  if (!key) throw new Error("Missing VITE_OPENAI_API_KEY");

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.3,
      max_tokens: 900,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenAI error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "No response.";
}
