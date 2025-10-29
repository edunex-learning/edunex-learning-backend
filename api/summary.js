import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { topic, lang = "English" } = req.body || {};
    if (!topic) return res.status(400).json({ error: "Topic required" });

    const prompt = `
Write about 800–1200 words in very simple language on "${topic}" in ${lang}.
Sections:
1) Introduction
2) Core Concept
3) Real-life Examples
4) Applications
5) Common Mistakes
6) Diagram/Analogy (optional)
7) Revision Summary (3–5 bullets)
Rules: use simple words, 2–3 everyday examples, bullets where useful, no hallucinations.
End with: "Provided by Edunex Learning AI Assistant."
`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const chat = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 1600,     // ≈ 1200 words budget
      messages: [
        { role: "system", content: "You are a knowledgeable teacher who writes long, accurate lessons in simple words." },
        { role: "user", content: prompt }
      ]
    });

    const text  = chat.choices?.[0]?.message?.content?.trim() || "";
    const words = text.split(/\s+/).filter(Boolean).length;

    res.status(200).json({
      summary: text,
      summaryWords: words,
      sources: [
        { label: "Wikipedia",  url: `https://en.wikipedia.org/wiki/${encodeURIComponent(topic)}` },
        { label: "NPTEL",      url: `https://nptel.ac.in/search?query=${encodeURIComponent(topic)}` },
        { label: "Britannica", url: `https://www.britannica.com/search?query=${encodeURIComponent(topic)}` }
      ]
    });
  } catch (e) {
    res.status(500).json({ error: "summary_failed", message: String(e?.message || e) });
  }
}

