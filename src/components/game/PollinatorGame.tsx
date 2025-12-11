import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PollinatorCard, PollinatorType } from "./PollinatorCard";
import { GameArena } from "./GameArena";
import { GameTimer } from "./GameTimer";
import { ScoreDisplay } from "./ScoreDisplay";
import { GameOverScreen } from "./GameOverScreen";
import { PowerUpType, powerUpData } from "./PowerUp";
import { ObstacleType, obstacleData } from "./Obstacle";
import { ActivePowerUpDisplay } from "./ActivePowerUpDisplay";
import { toast } from "sonner";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useHighScores } from "@/hooks/useHighScores";
import { useSoundEffects } from "@/hooks/useSoundEffects";

type GameState = "select" | "countdown" | "playing" | "paused" | "gameover";

const GAME_DURATION = 30;
const COUNTDOWN_DURATION = 3;

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
  const [isSlowed, setIsSlowed] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION);
  const lastWarningTime = useRef<number>(0);

  const { highScores, updateHighScore, getHighScore } = useHighScores();
  const { playSound, isMuted, toggleMute } = useSoundEffects();

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

  // Countdown before game starts
  useEffect(() => {
    if (gameState !== "countdown") return;

    if (countdown <= 0) {
      setGameState("playing");
      playSound("gameStart");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [gameState, countdown, playSound]);

  // Timer countdown
  useEffect(() => {
    if (gameState !== "playing" || isTimeFrozen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, isTimeFrozen]);

  // Game over check and warning sounds
  useEffect(() => {
    if (gameState !== "playing") return;

    if (timeLeft <= 0) {
      setGameState("gameover");
      playSound("gameOver");
      
      if (selectedPollinator) {
        const isNew = updateHighScore(selectedPollinator, score);
        setIsNewHighScore(isNew);
        if (isNew) {
          setTimeout(() => playSound("newHighScore"), 500);
        }
      }
      return;
    }

    // Play warning sound at 10, 5, 4, 3, 2, 1
    if (timeLeft <= 10 && timeLeft !== lastWarningTime.current) {
      lastWarningTime.current = timeLeft;
      if (timeLeft <= 5 || timeLeft === 10) {
        playSound("warning");
      }
    }
  }, [gameState, timeLeft, playSound, selectedPollinator, score, updateHighScore]);

  // Handle pause/resume for power-ups
  const handlePause = () => {
    setPausedAt(Date.now());
    setGameState("paused");
  };

  const handleResume = () => {
    if (pausedAt) {
      const pauseDuration = Date.now() - pausedAt;
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
    playSound("pollinate");
  }, [playSound]);

  const handlePowerUp = useCallback((type: PowerUpType, _flowerPositions: { x: number; y: number }[]) => {
    const data = powerUpData[type];
    
    playSound("powerup");
    
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
  }, [playSound]);

  const handleObstacleHit = useCallback((type: ObstacleType) => {
    const data = obstacleData[type];
    
    playSound("obstacle");
    
    toast(
      <div className="flex items-center gap-2 text-red-500">
        <span className="text-2xl">{data.emoji}</span>
        <div>
          <p className="font-bold">{data.name}</p>
          <p className="text-sm opacity-80">{data.effect}</p>
        </div>
      </div>,
      { duration: 2000 }
    );

    switch (type) {
      case "wasp":
        // Steals 2 points
        setScore(prev => Math.max(0, prev - 2));
        break;
      case "spider":
        // Slows flower spawning for 5 seconds
        setIsSlowed(true);
        setTimeout(() => setIsSlowed(false), 5000);
        break;
      case "pesticide":
        // Lose 3 seconds
        setTimeLeft(prev => Math.max(1, prev - 3));
        break;
    }
  }, [playSound]);

  const startGame = () => {
    if (!selectedPollinator) return;
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setActivePowerUps([]);
    setIsTimeFrozen(false);
    setIsSlowed(false);
    setPausedAt(null);
    setIsNewHighScore(false);
    lastWarningTime.current = 0;
    setCountdown(COUNTDOWN_DURATION);
    setGameState("countdown");
  };

  const playAgain = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setActivePowerUps([]);
    setIsTimeFrozen(false);
    setIsSlowed(false);
    setPausedAt(null);
    setIsNewHighScore(false);
    lastWarningTime.current = 0;
    setCountdown(COUNTDOWN_DURATION);
    setGameState("countdown");
  };

  const chooseNewPollinator = () => {
    setSelectedPollinator(null);
    setGameState("select");
  };

  // Mute button component
  const MuteButton = () => (
    <Button
      onClick={toggleMute}
      variant="outline"
      size="icon"
      className="rounded-full h-10 w-10"
      title={isMuted ? "Unmute" : "Mute"}
    >
      {isMuted ? (
        <VolumeX className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
    </Button>
  );

  // Selection screen
  if (gameState === "select") {
    return (
      <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-background via-background to-secondary">
        <div className="max-w-5xl mx-auto">
          {/* Header with mute button */}
          <header className="text-center mb-8 md:mb-12 relative">
            <div className="absolute right-0 top-0">
              <MuteButton />
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-4">
              🌸 Pollinator Party 🐝
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose your pollinator and help flowers bloom! Pollinate as many flowers as you can in 30 seconds.
            </p>
          </header>

          {/* Educational section */}
          <section className="mb-8">
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto border border-border">
              <h3 className="text-xl font-display font-semibold mb-3 text-foreground text-center">
                🌍 Why Pollinators Matter
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Pollinators are essential for our food supply! They help pollinate about 75% of flowering plants and nearly 75% of crops. Without bees, butterflies, beetles, and bats, we wouldn't have apples, almonds, chocolate, or countless other foods we enjoy.
              </p>
            </div>
          </section>

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
                    highScore={highScores[type]}
                  />
                )
              )}
            </div>
          </section>

          {/* Power-up & Obstacle legend */}
          <section className="mb-8 space-y-4">
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

            <div className="bg-destructive/80 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto border border-destructive">
              <h3 className="text-xl font-display font-semibold mb-4 text-center text-white">
                ⚠️ Obstacles - Avoid These!
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(["wasp", "spider", "pesticide"] as ObstacleType[]).map((type) => {
                  const data = obstacleData[type];
                  return (
                    <div key={type} className="flex items-center gap-3 p-3 rounded-xl bg-destructive/10">
                      <span className="text-3xl">{data.emoji}</span>
                      <div>
                        <p className="font-semibold text-sm text-white">{data.name}</p>
                        <p className="text-xs text-black">{data.effect}</p>
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
        </div>
      </div>
    );
  }

  // Countdown screen
  if (gameState === "countdown" && selectedPollinator) {
    const pollinatorEmoji = selectedPollinator === "butterfly" ? "🦋" : 
                            selectedPollinator === "beetle" ? "🪲" : 
                            selectedPollinator === "bumblebee" ? "🐝" : "🦇";
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary">
        <div className="text-center">
          <div className="text-8xl mb-8 animate-bounce">{pollinatorEmoji}</div>
          <div className="text-9xl font-display font-bold text-primary animate-scale-in">
            {countdown > 0 ? countdown : "GO!"}
          </div>
          <p className="text-2xl text-muted-foreground mt-6">Get ready to pollinate!</p>
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
        isNewHighScore={isNewHighScore}
        highScore={getHighScore(selectedPollinator)}
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
            <div className="flex items-center gap-3">
              <ActivePowerUpDisplay activePowerUps={activePowerUps} currentTime={currentTime} />
              <MuteButton />
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
              onObstacleHit={handleObstacleHit}
              isPlaying={gameState === "playing"}
              hasDoublePoints={hasDoublePoints}
              isSlowed={isSlowed}
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
            Click flowers to pollinate them! Avoid obstacles! ✨
          </p>
        </div>
      </div>
    );
  }

  return null;
};
