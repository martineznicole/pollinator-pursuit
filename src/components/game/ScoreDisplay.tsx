import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ScoreDisplayProps {
  score: number;
}

export const ScoreDisplay = ({ score }: ScoreDisplayProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (score > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 200);
      return () => clearTimeout(timer);
    }
  }, [score]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl">🌼</span>
      <span
        className={cn(
          "text-4xl font-display font-bold tabular-nums text-primary transition-transform",
          isAnimating && "scale-125"
        )}
      >
        {score}
      </span>
      <span className="text-muted-foreground font-body">pollinated</span>
    </div>
  );
};
