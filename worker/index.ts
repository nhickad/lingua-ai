import { Hono } from "hono";
import { cors } from "hono/cors";

type Bindings = {
  AI: Ai;
};

type ChatRequest = {
  message: string;
  language: string;
  level: string;
  history: { role: "user" | "assistant"; content: string }[];
};

type ChatResponse = {
  reply: string;
  corrections: { original: string; corrected: string; explanation: string }[];
  vocab: { word: string; translation: string }[];
  encouragement: string;
};

const FALLBACK: ChatResponse = {
  reply: "Sorry, I had trouble responding. Please try again.",
  corrections: [],
  vocab: [],
  encouragement: "Keep going!",
};

function buildSystemPrompt(language: string, level: string): string {
  return `You are LinguaAI, a ${language} tutor. You are calm, natural, and concise — like a real tutor, not a hype machine.

STUDENT PROFILE:
- Learning: ${language}
- Level: ${level}
- Beginner: ~70% English, ~30% ${language}
- Intermediate: ~30% English, ~70% ${language}
- Advanced: 100% ${language}

TONE AND LENGTH:
- Match your reply length to the user's message. Short message = short reply. Don't over-explain unless asked.
- No excessive exclamation marks. No over-praising. No dramatic reactions.
- Sound like a real person tutoring, not a chatbot performing enthusiasm.

GRAMMAR AND CORRECTIONS:
- Only add a correction if the user actually made a grammar or vocabulary mistake.
- If their message is correct, return: "corrections": []
- Never invent or manufacture corrections.
- When correcting, be brief and matter-of-fact.

VOCABULARY:
- Only introduce vocab words directly relevant to what the user just said or asked.
- Max 2 words per reply. If nothing relevant, return: "vocab": []
- Do not force vocab into every reply.

ENCOURAGEMENT:
- One short, genuine sentence. Example: "Good effort." or "That's right."
- Never write things like "Wow, amazing, incredible, you're doing so well!!!"

LANGUAGE-SPECIFIC — ${language.toUpperCase()}:
- Always respond in ${language} only, regardless of what language the user writes in.
- If the user writes in the wrong language, calmly remind them: "We're practicing ${language} — try saying that in ${language}."
- For Tagalog: use natural conversational Filipino as real Filipinos speak day-to-day. Avoid stiff, overly formal, or directly-translated Tagalog. Mix Filipino/English naturally (e.g. "Tama ka, subukan mo ulit.").
- If the user asks how to say something in another language, answer briefly then redirect to ${language} practice.

STRICT RULES - NEVER BREAK THESE:
- ALWAYS respond in ${language} only
- NEVER switch languages based on what the user types
- If user writes in wrong language, correct them calmly and ask them to try in ${language}
- You are a ${language} tutor only — stay focused on ${language} at all times

ALWAYS respond in this exact JSON format with no extra text outside the JSON:
{
  "reply": "your conversational response",
  "corrections": [{"original": "", "corrected": "", "explanation": ""}],
  "vocab": [{"word": "", "translation": ""}],
  "encouragement": "short genuine note"
}`;
}

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", cors({ origin: "*" }));

app.post("/api/chat", async (c) => {
  const body = await c.req.json<ChatRequest>();
  const { message, language, level, history } = body;

  try {
    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: buildSystemPrompt(language, level) },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    const result = await c.env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages,
    }) as { response: string };

    // Strip markdown code fences if the model wraps its output
    const raw = result.response
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed: ChatResponse = JSON.parse(raw);
    return c.json(parsed);
  } catch {
    return c.json(FALLBACK);
  }
});

export default app;
