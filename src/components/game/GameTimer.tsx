import { cn } from "@/lib/utils";

interface GameTimerProps {
  timeLeft: number;
  isFrozen?: boolean;
}

export const GameTimer = ({ timeLeft, isFrozen = false }: GameTimerProps) => {
  const isLow = timeLeft <= 10;
  const progress = (timeLeft / 30) * 100;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <span className={cn("text-2xl", isFrozen && "animate-pulse")}>
          {isFrozen ? "❄️" : "⏱️"}
        </span>
        <span
          className={cn(
            "text-4xl font-display font-bold tabular-nums",
            isFrozen 
              ? "text-cyan-500" 
              : isLow 
                ? "text-destructive animate-countdown" 
                : "text-foreground"
          )}
        >
          {timeLeft}s
        </span>
        {isFrozen && (
          <span className="text-xs text-cyan-500 font-semibold uppercase tracking-wide">
            Frozen!
          </span>
        )}
      </div>
      
      <div className="w-48 h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000",
            isFrozen 
              ? "bg-cyan-500" 
              : isLow 
                ? "bg-destructive" 
                : "bg-primary"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
