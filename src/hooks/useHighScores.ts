import { useState, useEffect } from "react";
import { PollinatorType } from "@/components/game/PollinatorCard";

interface HighScores {
  butterfly: number;
  beetle: number;
  bumblebee: number;
  bat: number;
}

const STORAGE_KEY = "pollinator-party-high-scores";

const defaultScores: HighScores = {
  butterfly: 0,
  beetle: 0,
  bumblebee: 0,
  bat: 0,
};

export const useHighScores = () => {
  const [highScores, setHighScores] = useState<HighScores>(defaultScores);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHighScores(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load high scores:", e);
    }
  }, []);

  const updateHighScore = (pollinator: PollinatorType, score: number): boolean => {
    const currentHigh = highScores[pollinator];
    if (score > currentHigh) {
      const newScores = { ...highScores, [pollinator]: score };
      setHighScores(newScores);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newScores));
      } catch (e) {
        console.error("Failed to save high scores:", e);
      }
      return true; // New high score!
    }
    return false;
  };

  const getHighScore = (pollinator: PollinatorType): number => {
    return highScores[pollinator];
  };

  return { highScores, updateHighScore, getHighScore };
};
