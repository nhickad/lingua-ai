"use client";

import { ArrowLeft, Flame, BookOpen, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressScreenProps {
  userName: string;
  onBack: () => void;
}

const stats = {
  streak: 7,
  wordsLearned: 156,
  sessionsCompleted: 23,
};

const vocabulary = [
  { word: "Hola", translation: "Hello", timesSeen: 12 },
  { word: "Gracias", translation: "Thank you", timesSeen: 8 },
  { word: "Ayer", translation: "Yesterday", timesSeen: 5 },
  { word: "Trabajo", translation: "Work", timesSeen: 7 },
  { word: "Amigo", translation: "Friend", timesSeen: 10 },
  { word: "Casa", translation: "House", timesSeen: 6 },
  { word: "Tiempo", translation: "Time/Weather", timesSeen: 4 },
  { word: "Comida", translation: "Food", timesSeen: 9 },
  { word: "Familia", translation: "Family", timesSeen: 11 },
  { word: "Ciudad", translation: "City", timesSeen: 3 },
  { word: "Libro", translation: "Book", timesSeen: 5 },
  { word: "Bueno", translation: "Good", timesSeen: 15 },
];

const recentSessions = [
  {
    date: "Apr 14, 2026",
    language: "Spanish",
    duration: "25 min",
    messages: 18,
    difficulty: "Intermediate",
  },
  {
    date: "Apr 13, 2026",
    language: "Spanish",
    duration: "32 min",
    messages: 24,
    difficulty: "Intermediate",
  },
  {
    date: "Apr 12, 2026",
    language: "Spanish",
    duration: "18 min",
    messages: 12,
    difficulty: "Beginner",
  },
  {
    date: "Apr 11, 2026",
    language: "Spanish",
    duration: "28 min",
    messages: 20,
    difficulty: "Intermediate",
  },
  {
    date: "Apr 10, 2026",
    language: "Spanish",
    duration: "15 min",
    messages: 10,
    difficulty: "Beginner",
  },
];

const difficultyColors: Record<string, string> = {
  Beginner: "bg-chart-4/20 text-chart-4",
  Intermediate: "bg-primary/20 text-primary",
  Advanced: "bg-secondary/20 text-secondary",
};

export function ProgressScreen({ userName, onBack }: ProgressScreenProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border/50 px-4 md:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-card-elevated transition-colors"
              aria-label="Back to chat"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Your Progress
            </h1>
          </div>
          <span className="text-muted-foreground">
            Welcome back, {userName}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-2xl p-6 border border-border/30 hover:border-warning/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-warning/20 flex items-center justify-center">
                <Flame className="w-7 h-7 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Daily Streak</p>
                <p className="text-3xl font-bold text-foreground">
                  {stats.streak}
                  <span className="text-lg text-muted-foreground ml-1">days</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border/30 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Words Learned</p>
                <p className="text-3xl font-bold text-foreground">
                  {stats.wordsLearned}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border/30 hover:border-secondary/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-secondary/20 flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sessions Completed</p>
                <p className="text-3xl font-bold text-foreground">
                  {stats.sessionsCompleted}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Vocabulary Section */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Vocabulary
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {vocabulary.map((item, index) => (
              <div
                key={index}
                className="bg-card-elevated rounded-xl p-4 border border-border/30 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all hover:scale-[1.02]"
              >
                <p className="font-semibold text-foreground">{item.word}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {item.translation}
                </p>
                <div className="mt-2 inline-flex items-center px-2 py-0.5 bg-muted rounded-full">
                  <span className="text-xs text-muted-foreground">
                    {item.timesSeen}x seen
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Sessions */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Recent Sessions
          </h2>
          <div className="bg-card rounded-2xl border border-border/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Language
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Messages
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Difficulty
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {recentSessions.map((session, index) => (
                    <tr
                      key={index}
                      className="hover:bg-card-elevated/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-foreground">
                        {session.date}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {session.language}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {session.duration}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {session.messages}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium",
                            difficultyColors[session.difficulty]
                          )}
                        >
                          {session.difficulty}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
