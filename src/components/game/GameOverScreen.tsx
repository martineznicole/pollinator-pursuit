import { Button } from "@/components/ui/button";
import { PollinatorType, pollinatorData } from "./PollinatorCard";

interface GameOverScreenProps {
  score: number;
  pollinator: PollinatorType;
  onPlayAgain: () => void;
  onChooseNew: () => void;
}

const getScoreMessage = (score: number): { title: string; emoji: string } => {
  if (score >= 30) return { title: "Legendary Pollinator!", emoji: "🏆" };
  if (score >= 20) return { title: "Expert Pollinator!", emoji: "🌟" };
  if (score >= 10) return { title: "Great Job!", emoji: "🎉" };
  if (score >= 5) return { title: "Good Start!", emoji: "👍" };
  return { title: "Keep Practicing!", emoji: "💪" };
};

export const GameOverScreen = ({
  score,
  pollinator,
  onPlayAgain,
  onChooseNew,
}: GameOverScreenProps) => {
  const { title, emoji } = getScoreMessage(score);
  const data = pollinatorData[pollinator];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-secondary">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Result card */}
        <div className="bg-card rounded-3xl p-8 shadow-2xl border-2 border-primary/20">
          <div className="text-8xl mb-4">{emoji}</div>
          
          <h2 className="text-3xl font-display font-bold text-foreground mb-2">
            {title}
          </h2>
          
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-5xl">{data.emoji}</span>
            <span className="text-muted-foreground">as a {data.name}</span>
          </div>

          <div className="bg-primary/10 rounded-2xl p-6 mb-6">
            <p className="text-muted-foreground mb-2">Flowers Pollinated</p>
            <p className="text-6xl font-display font-bold text-primary">{score}</p>
          </div>

          <div className="bg-muted rounded-xl p-4 text-sm text-muted-foreground">
            <p className="font-semibold mb-1">🌱 Did you know?</p>
            <p>{data.fact}</p>
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
