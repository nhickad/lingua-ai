"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface OnboardingScreenProps {
  onComplete: (data: { language: string; level: string; name: string }) => void;
}

const languages = [
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "tl", name: "Tagalog", flag: "🇵🇭" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇧🇷" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
];

const levels = ["Beginner", "Intermediate", "Advanced"];

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [name, setName] = useState("");

  const canProceed = selectedLanguage && selectedLevel && name.trim();

  const handleStart = () => {
    if (canProceed) {
      onComplete({
        language: selectedLanguage,
        level: selectedLevel,
        name: name.trim(),
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Main Card */}
        <div className="bg-card rounded-2xl p-8 md:p-12 shadow-2xl shadow-primary/5 border border-border/50">
          {/* Logo */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent inline-flex items-center gap-3">
              <span className="text-4xl">🌐</span>
              LinguaAI
            </h1>
            <p className="text-muted-foreground mt-3 text-lg">
              Your AI-powered language learning companion
            </p>
          </div>

          {/* Language Picker */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-muted-foreground mb-4">
              Choose your target language
            </label>
            <div className="grid grid-cols-3 gap-3">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.code)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                    "hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10",
                    selectedLanguage === lang.code
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                      : "border-border/50 bg-card-elevated hover:border-primary/50"
                  )}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="text-sm font-medium text-foreground">
                    {lang.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Level Selector */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-muted-foreground mb-4">
              Select your level
            </label>
            <div className="flex gap-3">
              {levels.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-full font-medium transition-all duration-200",
                    "hover:scale-[1.02]",
                    selectedLevel === level
                      ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg shadow-primary/30"
                      : "bg-card-elevated text-muted-foreground hover:text-foreground border border-border/50"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div className="mb-10">
            <label className="block text-sm font-medium text-muted-foreground mb-4">
              What should we call you?
            </label>
            <Input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-card-elevated/50 border-border/50 h-12 text-lg placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary/20 backdrop-blur-sm"
            />
          </div>

          {/* CTA Button */}
          <button
            onClick={handleStart}
            disabled={!canProceed}
            className={cn(
              "w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300",
              canProceed
                ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:scale-[1.01]"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            Start Learning
          </button>
        </div>
      </div>
    </div>
  );
}
