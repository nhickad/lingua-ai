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
  return `You are LinguaAI, a friendly language tutor.
The student is learning: ${language}
Their level is: ${level}
Beginner: mix 70% English 30% target language
Intermediate: mix 30% English 70% target language
Advanced: 100% target language only
Always correct grammar gently.
Introduce 1-2 new vocab words per message.
If the user writes in the wrong language, gently correct them — for example: "Remember, we're practicing ${language}! Try saying that in ${language}."
If the user asks how to say something in another language while learning ${language}, answer it briefly but immediately redirect them back to ${language} practice.
ALWAYS respond in this exact JSON format with no extra text:
{
  "reply": "your conversational response",
  "corrections": [{"original": "", "corrected": "", "explanation": ""}],
  "vocab": [{"word": "", "translation": ""}],
  "encouragement": "short positive note"
}

STRICT RULES - NEVER BREAK THESE:
- ALWAYS respond in ${language} only
- NEVER switch to another language even if the user writes in one
- If user writes in wrong language, correct them kindly and ask them to try in ${language}
- You are a ${language} tutor only — stay focused on ${language} at all times`;
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
