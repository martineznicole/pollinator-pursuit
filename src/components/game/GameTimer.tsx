import { cn } from "@/lib/utils";

interface GameTimerProps {
  timeLeft: number;
}

export const GameTimer = ({ timeLeft }: GameTimerProps) => {
  const isLow = timeLeft <= 10;
  const progress = (timeLeft / 60) * 100;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <span className="text-2xl">⏱️</span>
        <span
          className={cn(
            "text-4xl font-display font-bold tabular-nums",
            isLow ? "text-destructive animate-countdown" : "text-foreground"
          )}
        >
          {timeLeft}s
        </span>
      </div>
      
      <div className="w-48 h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000",
            isLow ? "bg-destructive" : "bg-primary"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
