"use client";

import { useState, useRef, useEffect } from "react";
import { Settings, Clock, Send, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  correction?: {
    original: string;
    corrected: string;
    explanation: string;
  };
  vocabulary?: Array<{
    word: string;
    translation: string;
  }>;
}

interface ChatScreenProps {
  language: string;
  level: string;
  userName: string;
  onNavigate: (screen: "progress") => void;
}

const languageNames: Record<string, string> = {
  es: "Spanish",
  ja: "Japanese",
  fr: "French",
  ko: "Korean",
  de: "German",
  tl: "Tagalog",
  it: "Italian",
  pt: "Portuguese",
  zh: "Chinese",
};

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Hola! Welcome to your Spanish lesson. I'm your AI tutor. Let's start with a simple conversation. How are you today? Try responding in Spanish!",
    vocabulary: [
      { word: "Hola", translation: "Hello" },
      { word: "hoy", translation: "today" },
    ],
  },
];

const mockResponses: Message[] = [
  {
    id: "3",
    role: "assistant",
    content:
      "Muy bien! Your Spanish is improving. Let's practice some common phrases. Can you tell me what you did yesterday? Use the past tense - el pretérito.",
    correction: {
      original: "Yo soy bien",
      corrected: "Yo estoy bien",
      explanation:
        "Use 'estar' for temporary states like feelings, not 'ser'.",
    },
    vocabulary: [
      { word: "ayer", translation: "yesterday" },
      { word: "pretérito", translation: "past tense" },
    ],
  },
  {
    id: "5",
    role: "assistant",
    content:
      "Excelente trabajo! You're making great progress. The verb conjugation was perfect. Now, let's try something more challenging. Describe your favorite place using descriptive adjectives.",
    vocabulary: [
      { word: "trabajo", translation: "work/job" },
      { word: "lugar", translation: "place" },
      { word: "favorito", translation: "favorite" },
    ],
  },
];

export function ChatScreen({
  language,
  level,
  userName,
  onNavigate,
}: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sessionTime, setSessionTime] = useState(0);
  const [expandedCorrections, setExpandedCorrections] = useState<Set<string>>(
    new Set()
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const responseIndex = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      if (responseIndex.current < mockResponses.length) {
        setMessages((prev) => [
          ...prev,
          {
            ...mockResponses[responseIndex.current],
            id: Date.now().toString(),
          },
        ]);
        responseIndex.current++;
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content:
              "Great response! Keep practicing. Your vocabulary and grammar are steadily improving. Would you like to try another topic?",
          },
        ]);
      }
    }, 1000);
  };

  const toggleCorrection = (messageId: string) => {
    setExpandedCorrections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const VocabularyWord = ({
    word,
    translation,
  }: {
    word: string;
    translation: string;
  }) => (
    <span className="group relative inline">
      <span className="border-b border-dashed border-secondary/50 cursor-help">
        {word}
      </span>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-card-elevated text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-border/50 shadow-lg z-10">
        {translation}
      </span>
    </span>
  );

  const renderMessageContent = (message: Message) => {
    if (!message.vocabulary || message.vocabulary.length === 0) {
      return message.content;
    }

    let content = message.content;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;

    message.vocabulary.forEach((vocab, idx) => {
      const index = content.toLowerCase().indexOf(vocab.word.toLowerCase());
      if (index !== -1) {
        if (index > lastIndex) {
          parts.push(content.slice(lastIndex, index));
        }
        parts.push(
          <VocabularyWord
            key={idx}
            word={content.slice(index, index + vocab.word.length)}
            translation={vocab.translation}
          />
        );
        lastIndex = index + vocab.word.length;
      }
    });

    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return parts.length > 0 ? parts : content;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="bg-card border-b border-border/50 px-4 md:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              LinguaAI
            </h1>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                {languageNames[language] || language}
              </span>
              <span className="px-3 py-1 bg-secondary/20 text-secondary rounded-full text-sm font-medium">
                {level}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="font-mono text-sm">{formatTime(sessionTime)}</span>
            </div>
            <button
              onClick={() => onNavigate("progress")}
              className="p-2 rounded-lg hover:bg-card-elevated transition-colors"
              aria-label="View Progress"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
                  <span className="text-lg">🤖</span>
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] md:max-w-[70%]",
                  message.role === "user" ? "order-first" : ""
                )}
              >
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3",
                    message.role === "user"
                      ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground ml-auto"
                      : "bg-card-elevated text-foreground border border-border/30"
                  )}
                >
                  <p className="leading-relaxed">
                    {renderMessageContent(message)}
                  </p>
                </div>

                {/* Correction Section */}
                {message.correction && (
                  <div className="mt-2">
                    <button
                      onClick={() => toggleCorrection(message.id)}
                      className="flex items-center gap-2 text-warning text-sm font-medium hover:text-warning/80 transition-colors"
                    >
                      {expandedCorrections.has(message.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                      View correction
                    </button>
                    {expandedCorrections.has(message.id) && (
                      <div className="mt-2 p-4 bg-warning/10 border border-warning/30 rounded-xl space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-medium text-warning/70 uppercase tracking-wider">
                            Original:
                          </span>
                          <span className="text-foreground/70 line-through">
                            {message.correction.original}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-medium text-warning/70 uppercase tracking-wider">
                            Correct:
                          </span>
                          <span className="text-foreground font-medium">
                            {message.correction.corrected}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground pt-1 border-t border-warning/20">
                          {message.correction.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {message.role === "user" && (
                <div className="w-10 h-10 rounded-full bg-card-elevated flex items-center justify-center flex-shrink-0 border border-border/50">
                  <span className="text-sm font-medium text-foreground">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-card border-t border-border/50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`Type in ${languageNames[language] || "your target language"}...`}
                className="w-full resize-none bg-card-elevated border border-border/50 rounded-xl px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                rows={1}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={cn(
                "p-3 rounded-xl transition-all duration-200",
                input.trim()
                  ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-105"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
