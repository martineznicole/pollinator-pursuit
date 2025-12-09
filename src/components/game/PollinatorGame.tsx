import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { PollinatorCard, PollinatorType } from "./PollinatorCard";
import { GameArena } from "./GameArena";
import { GameTimer } from "./GameTimer";
import { ScoreDisplay } from "./ScoreDisplay";
import { GameOverScreen } from "./GameOverScreen";
import { PowerUpType, powerUpData } from "./PowerUp";
import { ActivePowerUpDisplay } from "./ActivePowerUpDisplay";
import { toast } from "sonner";
import { Pause, Play } from "lucide-react";

type GameState = "select" | "playing" | "paused" | "gameover";

const GAME_DURATION = 30;

interface ActivePowerUp {
  type: PowerUpType;
  endTime: number;
}

export const PollinatorGame = () => {
  const [gameState, setGameState] = useState<GameState>("select");
  const [selectedPollinator, setSelectedPollinator] = useState<PollinatorType | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([]);
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  const [isTimeFrozen, setIsTimeFrozen] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Check if double points is active
  const hasDoublePoints = activePowerUps.some(p => p.type === "pollen-boost");

  // Update current time for power-up display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Clean up expired power-ups
  useEffect(() => {
    const now = Date.now();
    setActivePowerUps(prev => {
      const updated = prev.filter(p => p.endTime > now);
      
      // Check if time freeze just expired
      const hadTimeFreeze = prev.some(p => p.type === "time-freeze");
      const hasTimeFreeze = updated.some(p => p.type === "time-freeze");
      if (hadTimeFreeze && !hasTimeFreeze) {
        setIsTimeFrozen(false);
      }
      
      return updated;
    });
  }, [currentTime]);

  // Timer logic
  useEffect(() => {
    if (gameState !== "playing") return;

    if (timeLeft <= 0) {
      setGameState("gameover");
      return;
    }

    if (isTimeFrozen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft, isTimeFrozen]);

  // Handle pause/resume for power-ups
  const handlePause = () => {
    setPausedAt(Date.now());
    setGameState("paused");
  };

  const handleResume = () => {
    if (pausedAt) {
      const pauseDuration = Date.now() - pausedAt;
      // Extend power-up end times by pause duration
      setActivePowerUps(prev => prev.map(p => ({
        ...p,
        endTime: p.endTime + pauseDuration,
      })));
    }
    setPausedAt(null);
    setGameState("playing");
  };

  const handleScore = useCallback((points: number) => {
    setScore((prev) => prev + points);
  }, []);

  const handlePowerUp = useCallback((type: PowerUpType, _flowerPositions: { x: number; y: number }[]) => {
    const data = powerUpData[type];
    
    toast(
      <div className="flex items-center gap-2">
        <span className="text-2xl">{data.emoji}</span>
        <div>
          <p className="font-bold">{data.name}</p>
          <p className="text-sm opacity-80">{data.description}</p>
        </div>
      </div>,
      { duration: 2000 }
    );

    if (type === "time-freeze") {
      setIsTimeFrozen(true);
      setActivePowerUps(prev => [...prev, {
        type,
        endTime: Date.now() + data.duration * 1000,
      }]);
    } else if (type === "pollen-boost") {
      setActivePowerUps(prev => [...prev, {
        type,
        endTime: Date.now() + data.duration * 1000,
      }]);
    }
    // super-nectar is instant, handled in GameArena
  }, []);

  const startGame = () => {
    if (!selectedPollinator) return;
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setActivePowerUps([]);
    setIsTimeFrozen(false);
    setPausedAt(null);
    setGameState("playing");
  };

  const playAgain = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setActivePowerUps([]);
    setIsTimeFrozen(false);
    setPausedAt(null);
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
              Choose your pollinator and help flowers bloom! Pollinate as many flowers as you can in 30 seconds.
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

          {/* Power-up legend */}
          <section className="mb-8">
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto border border-border">
              <h3 className="text-xl font-display font-semibold mb-4 text-center text-foreground">
                ✨ Power-Ups
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(["pollen-boost", "time-freeze", "super-nectar"] as PowerUpType[]).map((type) => {
                  const data = powerUpData[type];
                  return (
                    <div key={type} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                      <span className="text-3xl">{data.emoji}</span>
                      <div>
                        <p className="font-semibold text-sm">{data.name}</p>
                        <p className="text-xs text-muted-foreground">{data.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
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

  // Playing or paused screen
  if ((gameState === "playing" || gameState === "paused") && selectedPollinator) {
    return (
      <div className="min-h-screen p-4 bg-gradient-to-b from-background to-secondary">
        <div className="max-w-5xl mx-auto">
          {/* Game HUD */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <ScoreDisplay score={score} />
            <div className="flex items-center gap-4">
              <ActivePowerUpDisplay activePowerUps={activePowerUps} currentTime={currentTime} />
              <Button
                onClick={gameState === "paused" ? handleResume : handlePause}
                variant="outline"
                size="icon"
                className="rounded-full h-12 w-12"
              >
                {gameState === "paused" ? (
                  <Play className="h-5 w-5" />
                ) : (
                  <Pause className="h-5 w-5" />
                )}
              </Button>
            </div>
            <GameTimer timeLeft={timeLeft} isFrozen={isTimeFrozen || gameState === "paused"} />
          </div>

          {/* Game Arena */}
          <div className="relative">
            <GameArena
              pollinator={selectedPollinator}
              onScore={handleScore}
              onPowerUp={handlePowerUp}
              isPlaying={gameState === "playing"}
              hasDoublePoints={hasDoublePoints}
            />
            
            {/* Pause overlay */}
            {gameState === "paused" && (
              <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm rounded-3xl flex items-center justify-center z-50">
                <div className="text-center space-y-6">
                  <div className="text-6xl">⏸️</div>
                  <h2 className="text-3xl font-display font-bold text-card">Game Paused</h2>
                  <div className="flex gap-4">
                    <Button
                      onClick={handleResume}
                      size="lg"
                      className="text-lg font-display h-14 px-8 rounded-xl"
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Resume
                    </Button>
                    <Button
                      onClick={chooseNewPollinator}
                      variant="outline"
                      size="lg"
                      className="text-lg font-display h-14 px-8 rounded-xl bg-card/90"
                    >
                      Quit
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick tip */}
          <p className="text-center text-muted-foreground mt-4 text-sm">
            Click flowers to pollinate them! Grab power-ups for bonus effects! ✨
          </p>
        </div>
      </div>
    );
  }

  return null;
};
