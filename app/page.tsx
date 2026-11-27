"use client";
import { useEffect, useState } from "react";
import GameCanvas from "./game/GameCanvas";
import WelcomeScreen from "./game/WelcomeScreen";
import { DEFAULT_NAME, loadName, loadProgress, saveName, saveProgress } from "./game/storage";

export default function Page() {
  const [started, setStarted] = useState(false);
  const [startWorld, setStartWorld] = useState<number | undefined>(undefined);
  const [name, setName] = useState(DEFAULT_NAME);
  useEffect(() => { setName(loadName()); }, []);
  useEffect(() => { document.title = `¿Dónde está ${name}?`; }, [name]);
  return started
    ? <GameCanvas name={name} startWorld={startWorld} onExit={() => { setStartWorld(undefined); setStarted(false); }} />
    : <WelcomeScreen name={name} onNameChange={setName} onStart={(w) => {
        saveName(name);
        if (w == null) {
          const prev = loadProgress();
          saveProgress({ worldsCompleted: prev.worldsCompleted, bestWrongPerWorld: prev.bestWrongPerWorld });
        }
        setStartWorld(w);
        setStarted(true);
      }} />;
}
