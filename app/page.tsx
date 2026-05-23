"use client";
import { useState } from "react";
import GameCanvas from "./game/GameCanvas";
import WelcomeScreen from "./game/WelcomeScreen";

export default function Page() {
  const [started, setStarted] = useState(false);
  return started ? <GameCanvas /> : <WelcomeScreen onStart={() => setStarted(true)} />;
}
