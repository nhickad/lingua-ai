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

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", cors({ origin: "*" }));

app.post("/api/chat", async (c) => {
  const body = await c.req.json<ChatRequest>();

  // Phase 1 mock — replace with real Cloudflare AI call in Phase 2
  const mockResponse = {
    reply: `Mock reply in ${body.language} (level: ${body.level}): "${body.message}"`,
    corrections: [
      {
        original: body.message,
        corrected: body.message,
        explanation: "No corrections needed for this mock response.",
      },
    ],
    vocab: [
      {
        word: "ejemplo",
        translation: "example",
      },
    ],
    encouragement: "Great job!",
  };

  return c.json(mockResponse);
});

export default app;
