"use client";

import { useState, useEffect } from "react";
import { OnboardingScreen } from "@/components/lingua/onboarding-screen";
import { ChatScreen } from "@/components/lingua/chat-screen";
import { ProgressScreen } from "@/components/lingua/progress-screen";

type Screen = "onboarding" | "chat" | "progress";

interface UserData {
  language: string;
  level: string;
  name: string;
}

export default function LinguaAI() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("onboarding");
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const storedName = localStorage.getItem("lingua_name");
    if (storedName) {
      setUserData({
        language: localStorage.getItem("lingua_language") || "Spanish",
        level: localStorage.getItem("lingua_level") || "Beginner",
        name: storedName,
      });
      setCurrentScreen("chat");
    }
  }, []);

  const handleOnboardingComplete = (data: UserData) => {
    setUserData(data);
    setCurrentScreen("chat");
  };

  const handleNavigate = (screen: "progress") => {
    setCurrentScreen(screen);
  };

  const handleBackToChat = () => {
    setCurrentScreen("chat");
  };

  if (currentScreen === "onboarding") {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  if (currentScreen === "progress" && userData) {
    return <ProgressScreen userName={userData.name} onBack={handleBackToChat} />;
  }

  if (currentScreen === "chat" && userData) {
    return (
      <ChatScreen
        language={userData.language}
        level={userData.level}
        userName={userData.name}
        onNavigate={handleNavigate}
      />
    );
  }

  return null;
}
