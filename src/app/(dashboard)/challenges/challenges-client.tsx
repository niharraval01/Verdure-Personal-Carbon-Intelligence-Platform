"use client";

import { ChallengeGrid } from "@/features/challenges/components/challenge-grid";
import { useCarbon } from "@/contexts/CarbonContext";

export function ChallengesClient() {
  const { challenges, toggleChallengeJoined, toggleChallengeCompleted } = useCarbon();

  return (
    <ChallengeGrid 
      challenges={challenges} 
      onJoin={toggleChallengeJoined}
      onComplete={toggleChallengeCompleted}
    />
  );
}
