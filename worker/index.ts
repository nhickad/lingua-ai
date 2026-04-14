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

function buildTagalogRules(): string {
  return `
TAGALOG LANGUAGE RULES (only apply when teaching Tagalog):

COMMON PHRASES - memorize these exactly:
- "I am tired" = "Pagod ako" (NEVER "Kumot ako")
- "I am hungry" = "Gutom ako"
- "I am happy" = "Masaya ako"
- "I am sad" = "Malungkot ako"
- "I am sleepy" = "Inaantok ako"
- "I don't know" = "Hindi ko alam"
- "I understand" = "Naiintindihan ko"
- "Thank you" = "Salamat"
- "You're welcome" = "Walang anuman"
- "Good morning" = "Magandang umaga"
- "Good afternoon" = "Magandang hapon"
- "Good evening" = "Magandang gabi"
- "How are you?" = "Kumusta ka?"
- "I'm fine" = "Mabuti naman ako"

GRAMMAR RULES:
- Tagalog sentence structure is Verb-Subject or Subject-Verb, not Subject-Verb-Object
- "Ako" means "I/me" and goes AFTER the adjective: "Pagod ako" not "Ako pagod"
- Use "mag-" prefix for actions: "Magluto" (to cook), "Maglakad" (to walk)
- Use "na" for already: "Kain na" (eat already/let's eat)
- Use "pa" for still/yet: "Tulog pa" (still sleeping)
- Common enclitics: na, pa, lang, ba, naman, nga, daw, raw, po, opo
- "Po/Opo" are formal/respectful particles used with elders
- Taglish (mixing English and Tagalog) is natural and acceptable

TAGLISH EXAMPLES (natural Filipino speech):
- "Saan ka pumunta?" = "Where did you go?"
- "Ano'ng plano mo?" = "What's your plan?"
- "Grabe, ang ganda!" = "Wow, so beautiful!"
- "Oo naman" = "Of course/Yes of course"
- "Hindi pa ako ready" = "I'm not ready yet" (Taglish)

STRICT TAGALOG ACCURACY:
- If unsure of a Tagalog word, say so and give the closest natural equivalent
- Never invent Tagalog words
- Prefer simple everyday Filipino over formal/archaic Tagalog
- Accept Taglish as valid — correct only if grammar is truly wrong`;
}

function buildSystemPrompt(language: string, level: string): string {
  return `IMPORTANT: You must ALWAYS respond with valid JSON only. No text before or after the JSON object. No markdown. No explanation. Just the raw JSON object.

You are LinguaAI, a ${language} tutor. You are calm, natural, and concise — like a real tutor, not a hype machine.

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

${language === "Tagalog" ? buildTagalogRules() : ""}
CORRECTIONS FORMAT RULE - STRICTLY FOLLOW:
"corrections" must ALWAYS be an array of objects like:
[{"original":"wrong text","corrected":"correct text","explanation":"why"}]
NEVER use arrow notation like "x -> y"
NEVER use plain strings in the corrections array
If there are no corrections return exactly: []

STRICT RULES - NEVER BREAK THESE:
- ALWAYS respond in ${language} only
- NEVER switch languages based on what the user types
- If user writes in wrong language, correct them calmly and ask them to try in ${language}
- You are a ${language} tutor only — stay focused on ${language} at all times

YOUR ENTIRE RESPONSE MUST BE THIS JSON AND NOTHING ELSE:
{"reply":"...","corrections":[],"vocab":[],"encouragement":"..."}`;
}

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", cors({ origin: "*" }));

app.post("/api/chat", async (c) => {
  const body = await c.req.json<ChatRequest>();
  const { message, language, level, history } = body;

  // Rate limit guard — ignore requests fired less than 1 second after the last message
  const lastMessage = history?.[history.length - 1] as any;
  if (lastMessage?.timestamp && Date.now() - lastMessage.timestamp < 1000) {
    return c.json(FALLBACK);
  }

  try {
    // Sanitize history — ensure every message content is a plain string
    const safeHistory = (history ?? [])
      .filter((m: any) => m?.role && m?.content)
      .map((m: any) => ({
        role: m.role as "user" | "assistant",
        content: typeof m.content === "string"
          ? m.content
          : Array.isArray(m.content)
            ? m.content.map((c: any) => c?.text ?? c?.content ?? "").join(" ")
            : String(m.content),
      }));

    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: buildSystemPrompt(language, level) },
      ...safeHistory,
      { role: "user", content: message },
    ];

    const result = await c.env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages,
    }) as { response: string };

    console.log("[AI raw response]", result.response);

    // Strip markdown code fences
    const stripped = result.response
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    // Attempt 1: direct parse
    try {
      const parsed: ChatResponse = JSON.parse(stripped);
      return c.json(parsed);
    } catch {
      // Attempt 2: extract outermost { ... } and parse that
      const start = stripped.indexOf("{");
      const end = stripped.lastIndexOf("}");
      if (start !== -1 && end !== -1 && end > start) {
        try {
          const parsed: ChatResponse = JSON.parse(stripped.slice(start, end + 1));
          return c.json(parsed);
        } catch {
          // fall through to fallback
        }
      }
      console.error("[AI JSON parse failed] raw response was:", result.response);
      return c.json(FALLBACK);
    }
  } catch (err) {
    console.error("[AI call failed]", err);
    return c.json(FALLBACK);
  }
});

export default app;
