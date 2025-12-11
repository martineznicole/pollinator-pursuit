import { Button } from "@/components/ui/button";
import { PollinatorType, pollinatorData } from "./PollinatorCard";
import { useMemo } from "react";

interface GameOverScreenProps {
  score: number;
  pollinator: PollinatorType;
  onPlayAgain: () => void;
  onChooseNew: () => void;
  isNewHighScore: boolean;
  highScore: number;
}

const pollinatorFacts: Record<PollinatorType, string[]> = {
  butterfly: [
    "Monarch butterflies migrate up to 3,000 miles each year!",
    "Butterflies taste with their feet to find food for their caterpillars.",
    "A butterfly's wings are actually transparent - the colors come from tiny scales!",
    "There are about 20,000 species of butterflies in the world.",
    "Butterflies can fly at speeds up to 30 miles per hour.",
  ],
  beetle: [
    "Beetles make up about 25% of all known animal species on Earth!",
    "Some beetles can lift objects 850 times their own weight.",
    "Beetle fossils date back 270 million years - older than dinosaurs!",
    "Fireflies are actually a type of beetle that produces light.",
    "Dung beetles navigate using the Milky Way as a guide!",
  ],
  bumblebee: [
    "Bumblebees can fly in rain and visit 50-1000 flowers per day!",
    "A bumblebee's wings beat about 200 times per second.",
    "Bumblebees can sense the electric fields of flowers!",
    "Only female bumblebees can sting, and they can sting multiple times.",
    "Bumblebees warm up their flight muscles by shivering before takeoff.",
  ],
  bat: [
    "A single bat can eat up to 1,200 mosquitoes in an hour!",
    "Bats are the only mammals capable of true sustained flight.",
    "Some bat species can live for over 30 years.",
    "Bat droppings (guano) are one of the richest fertilizers!",
    "Mexican free-tailed bats can fly at speeds over 100 mph!",
  ],
};

const getScoreMessage = (score: number, isNewHighScore: boolean): { title: string; emoji: string } => {
  if (isNewHighScore) return { title: "New High Score!", emoji: "🏆" };
  if (score >= 20) return { title: "Amazing!", emoji: "🌟" };
  if (score >= 15) return { title: "Great Job!", emoji: "🎉" };
  if (score >= 10) return { title: "Well Done!", emoji: "👍" };
  if (score >= 5) return { title: "Good Start!", emoji: "💪" };
  return { title: "Keep Practicing!", emoji: "🌱" };
};

export const GameOverScreen = ({
  score,
  pollinator,
  onPlayAgain,
  onChooseNew,
  isNewHighScore,
  highScore,
}: GameOverScreenProps) => {
  const { title, emoji } = getScoreMessage(score, isNewHighScore);
  const data = pollinatorData[pollinator];
  
  const randomFact = useMemo(() => {
    const facts = pollinatorFacts[pollinator];
    return facts[Math.floor(Math.random() * facts.length)];
  }, [pollinator]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-secondary">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Result card */}
        <div className="bg-card rounded-3xl p-8 shadow-2xl border-2 border-primary/20">
          <div className="text-8xl mb-4">{emoji}</div>
          
          <h2 className="text-3xl font-display font-bold text-foreground mb-2">
            {title}
          </h2>
          
          {isNewHighScore && (
            <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-display animate-pulse">
              <span>🎊</span>
              <span>NEW RECORD!</span>
              <span>🎊</span>
            </div>
          )}
          
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-5xl">{data.emoji}</span>
            <span className="text-muted-foreground">as a {data.name}</span>
          </div>

          <div className="bg-primary/10 rounded-2xl p-6 mb-4">
            <p className="text-muted-foreground mb-2">Flowers Pollinated</p>
            <p className="text-6xl font-display font-bold text-primary">{score}</p>
          </div>

          {!isNewHighScore && highScore > 0 && (
            <div className="mb-4 text-muted-foreground">
              <span>🏆 Your best: </span>
              <span className="font-bold text-foreground">{highScore}</span>
            </div>
          )}

          <div className="bg-muted rounded-xl p-4 text-sm text-muted-foreground">
            <p className="font-semibold mb-1">🌱 Did you know?</p>
            <p>{randomFact}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={onPlayAgain}
            size="lg"
            className="w-full text-lg font-display h-14 rounded-xl animate-pulse-glow"
          >
            🔄 Play Again
          </Button>
          
          <Button
            onClick={onChooseNew}
            variant="outline"
            size="lg"
            className="w-full text-lg font-display h-14 rounded-xl"
          >
            🦋 Choose New Pollinator
          </Button>
        </div>
      </div>
    </div>
  );
};
