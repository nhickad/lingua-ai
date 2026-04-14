export interface VocabWord {
  word: string;
  translation: string;
  language: string;
  learnedAt: string;
}

const KEYS = {
  LANGUAGE: "lingua_language",
  LEVEL: "lingua_level",
  NAME: "lingua_name",
  LAST_ACTIVE: "lingua_last_active",
  STREAK: "lingua_streak",
  VOCAB: "lingua_vocab",
} as const;

export function getLanguage(): string {
  if (typeof window === "undefined") return "Spanish";
  return localStorage.getItem(KEYS.LANGUAGE) || "Spanish";
}

export function getLevel(): string {
  if (typeof window === "undefined") return "Beginner";
  return localStorage.getItem(KEYS.LEVEL) || "Beginner";
}

export function getName(): string {
  if (typeof window === "undefined") return "there";
  return localStorage.getItem(KEYS.NAME) || "there";
}

export function getStreak(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(KEYS.STREAK) || "0", 10);
}

export function updateStreak(): void {
  if (typeof window === "undefined") return;
  const today = new Date().toDateString();
  const lastActive = localStorage.getItem(KEYS.LAST_ACTIVE);

  if (!lastActive) {
    localStorage.setItem(KEYS.STREAK, "1");
    localStorage.setItem(KEYS.LAST_ACTIVE, today);
    return;
  }

  if (lastActive === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (lastActive === yesterday.toDateString()) {
    const current = getStreak();
    localStorage.setItem(KEYS.STREAK, String(current + 1));
  } else {
    localStorage.setItem(KEYS.STREAK, "1");
  }
  localStorage.setItem(KEYS.LAST_ACTIVE, today);
}

export function getVocab(): VocabWord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEYS.VOCAB) || "[]");
  } catch {
    return [];
  }
}

export function saveVocab(
  words: { word: string; translation: string }[],
  language: string
): void {
  if (typeof window === "undefined") return;
  const existing = getVocab();
  const existingWords = new Set(existing.map((v) => v.word.toLowerCase()));
  const learnedAt = new Date().toISOString();

  const newWords = words
    .filter((w) => !existingWords.has(w.word.toLowerCase()))
    .map((w) => ({ ...w, language, learnedAt }));

  const updated = [...existing, ...newWords].slice(-200);
  localStorage.setItem(KEYS.VOCAB, JSON.stringify(updated));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}
