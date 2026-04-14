const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL ?? "http://localhost:8787";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type ChatResponse = {
  reply: string;
  corrections: {
    original: string;
    corrected: string;
    explanation: string;
  }[];
  vocab: {
    word: string;
    translation: string;
  }[];
  encouragement: string;
};

export async function fetchChat(
  message: string,
  language: string,
  level: string,
  history: Message[]
): Promise<ChatResponse> {
  const res = await fetch(`${WORKER_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, language, level, history }),
  });

  if (!res.ok) {
    throw new Error(`Worker error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<ChatResponse>;
}
