import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: "OPENAI_API_KEY is not configured" });

  try {
    const { message, history = [] } = req.body || {};
    if (!message || typeof message !== "string") return res.status(400).json({ error: "Message required" });

    const input = [
      ...history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: message }
    ];

    const response = await client.responses.create({
      model: "gpt-5",
      instructions: "You are Pocket Agent, a concise practical personal assistant. Be clear, helpful and action-oriented. Keep replies fairly short unless the user asks for detail.",
      input
    });

    res.status(200).json({ reply: response.output_text || "I couldn't produce a response." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error?.message || "Something went wrong" });
  }
}
