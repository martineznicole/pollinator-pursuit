import { cn } from "@/lib/utils";
import { useState } from "react";

export type PowerUpType = "pollen-boost" | "time-freeze" | "super-nectar";

interface PowerUpInfo {
  name: string;
  emoji: string;
  description: string;
  color: string;
  duration: number; // in seconds, 0 for instant
}

export const powerUpData: Record<PowerUpType, PowerUpInfo> = {
  "pollen-boost": {
    name: "Pollen Boost",
    emoji: "⚡",
    description: "Double points!",
    color: "from-yellow-400 to-orange-500",
    duration: 8,
  },
  "time-freeze": {
    name: "Time Freeze",
    emoji: "❄️",
    description: "Timer paused!",
    color: "from-cyan-400 to-blue-500",
    duration: 5,
  },
  "super-nectar": {
    name: "Super Nectar",
    emoji: "🌟",
    description: "Burst pollination!",
    color: "from-pink-400 to-purple-500",
    duration: 0,
  },
};

interface PowerUpProps {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  onCollect: (id: string, type: PowerUpType) => void;
}

export const PowerUp = ({ id, type, x, y, onCollect }: PowerUpProps) => {
  const [isCollected, setIsCollected] = useState(false);
  const data = powerUpData[type];

  const handleClick = () => {
    if (isCollected) return;
    setIsCollected(true);
    
    setTimeout(() => {
      onCollect(id, type);
    }, 300);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isCollected}
      className={cn(
        "absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300",
        "w-14 h-14 md:w-16 md:h-16 rounded-full cursor-pointer",
        "flex items-center justify-center text-3xl md:text-4xl",
        "bg-gradient-to-br shadow-lg hover:scale-125 active:scale-95",
        "animate-pulse-glow border-2 border-white/50",
        data.color,
        isCollected && "opacity-0 scale-150"
      )}
      style={{
        left: `${x}%`,
        top: `${y}%`,
      }}
    >
      {data.emoji}
    </button>
  );
};
