import OpenAI from "openai";
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { topic, count=10, lang="English" } = req.body || {};
    const prompt = `Generate ${count} MCQs on "${topic}" in ${lang}. Return ONLY JSON [{"q":"...","options":["A","B","C","D"],"a":0}].`;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const chat = await openai.chat.completions.create({
      model: "gpt-4o-mini", temperature: 0.6, max_tokens: 1000,
      messages: [{ role:"system", content:"Return pure JSON only." }, { role:"user", content: prompt }]
    });
    const raw = chat.choices?.[0]?.message?.content || "[]";
    res.status(200).json({ mcq: JSON.parse(raw) });
  } catch { res.status(200).json({ mcq: [] }); }
}
