import { cn } from "@/lib/utils";
import { PowerUpType, powerUpData } from "./PowerUp";

interface ActivePowerUpDisplayProps {
  activePowerUps: { type: PowerUpType; endTime: number }[];
  currentTime: number;
}

export const ActivePowerUpDisplay = ({ activePowerUps, currentTime }: ActivePowerUpDisplayProps) => {
  if (activePowerUps.length === 0) return null;

  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {activePowerUps.map((powerUp, index) => {
        const data = powerUpData[powerUp.type];
        const timeLeft = Math.max(0, Math.ceil((powerUp.endTime - currentTime) / 1000));
        
        return (
          <div
            key={`${powerUp.type}-${index}`}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold",
              "bg-gradient-to-r text-white shadow-lg animate-pulse",
              data.color
            )}
          >
            <span>{data.emoji}</span>
            <span>{data.name}</span>
            {data.duration > 0 && (
              <span className="bg-white/30 px-2 py-0.5 rounded-full text-xs">
                {timeLeft}s
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
