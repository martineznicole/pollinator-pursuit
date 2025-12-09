import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { PollinatorCard, PollinatorType } from "./PollinatorCard";
import { GameArena } from "./GameArena";
import { GameTimer } from "./GameTimer";
import { ScoreDisplay } from "./ScoreDisplay";
import { GameOverScreen } from "./GameOverScreen";

type GameState = "select" | "playing" | "gameover";

const GAME_DURATION = 60;

export const PollinatorGame = () => {
  const [gameState, setGameState] = useState<GameState>("select");
  const [selectedPollinator, setSelectedPollinator] = useState<PollinatorType | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);

  // Timer logic
  useEffect(() => {
    if (gameState !== "playing") return;

    if (timeLeft <= 0) {
      setGameState("gameover");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const handleScore = useCallback(() => {
    setScore((prev) => prev + 1);
  }, []);

  const startGame = () => {
    if (!selectedPollinator) return;
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameState("playing");
  };

  const playAgain = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameState("playing");
  };

  const chooseNewPollinator = () => {
    setSelectedPollinator(null);
    setGameState("select");
  };

  // Selection screen
  if (gameState === "select") {
    return (
      <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-background via-background to-secondary">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <header className="text-center mb-8 md:mb-12">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-4">
              🌸 Pollinator Party 🐝
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose your pollinator and help flowers bloom! Pollinate as many flowers as you can in 60 seconds.
            </p>
          </header>

          {/* Pollinator selection */}
          <section className="mb-8">
            <h2 className="text-2xl font-display font-semibold text-center mb-6 text-foreground">
              Choose Your Pollinator
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {(["butterfly", "beetle", "bumblebee", "bat"] as PollinatorType[]).map(
                (type) => (
                  <PollinatorCard
                    key={type}
                    type={type}
                    selected={selectedPollinator === type}
                    onClick={() => setSelectedPollinator(type)}
                  />
                )
              )}
            </div>
          </section>

          {/* Start button */}
          <div className="text-center">
            <Button
              onClick={startGame}
              disabled={!selectedPollinator}
              size="lg"
              className="text-xl font-display px-12 h-16 rounded-2xl animate-pulse-glow disabled:animate-none disabled:opacity-50"
            >
              🎮 Start Game
            </Button>
          </div>

          {/* Educational footer */}
          <footer className="mt-12 text-center">
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto border border-border">
              <h3 className="text-xl font-display font-semibold mb-3 text-foreground">
                🌍 Why Pollinators Matter
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Pollinators are essential for our food supply! They help pollinate about 75% of flowering plants and nearly 75% of crops. Without bees, butterflies, beetles, and bats, we wouldn't have apples, almonds, chocolate, or countless other foods we enjoy.
              </p>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  // Game over screen
  if (gameState === "gameover" && selectedPollinator) {
    return (
      <GameOverScreen
        score={score}
        pollinator={selectedPollinator}
        onPlayAgain={playAgain}
        onChooseNew={chooseNewPollinator}
      />
    );
  }

  // Playing screen
  if (gameState === "playing" && selectedPollinator) {
    return (
      <div className="min-h-screen p-4 bg-gradient-to-b from-background to-secondary">
        <div className="max-w-5xl mx-auto">
          {/* Game HUD */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <ScoreDisplay score={score} />
            <GameTimer timeLeft={timeLeft} />
          </div>

          {/* Game Arena */}
          <GameArena
            pollinator={selectedPollinator}
            onScore={handleScore}
            isPlaying={gameState === "playing"}
          />

          {/* Quick tip */}
          <p className="text-center text-muted-foreground mt-4 text-sm">
            Move your pollinator and click on flowers to pollinate them! 🌸
          </p>
        </div>
      </div>
    );
  }

  return null;
};
