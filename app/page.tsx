"use client";
import { useState } from "react";
import GameCanvas from "./game/GameCanvas";
import WelcomeScreen from "./game/WelcomeScreen";
import { loadProgress, saveProgress } from "./game/storage";

export default function Page() {
  const [started, setStarted] = useState(false);
  const [startWorld, setStartWorld] = useState<number | undefined>(undefined);
  return started
    ? <GameCanvas startWorld={startWorld} onExit={() => { setStartWorld(undefined); setStarted(false); }} />
    : <WelcomeScreen onStart={(w) => {
        if (w == null) {
          const prev = loadProgress();
          saveProgress({ worldsCompleted: prev.worldsCompleted, bestWrongPerWorld: prev.bestWrongPerWorld });
        }
        setStartWorld(w);
        setStarted(true);
      }} />;
}
