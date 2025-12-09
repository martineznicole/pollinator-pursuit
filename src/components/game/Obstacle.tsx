import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export type ObstacleType = "wasp" | "spider" | "pesticide";

interface ObstacleInfo {
  name: string;
  emoji: string;
  effect: string;
  color: string;
}

export const obstacleData: Record<ObstacleType, ObstacleInfo> = {
  wasp: {
    name: "Wasp",
    emoji: "🐝",
    effect: "Steals 2 points!",
    color: "from-red-500/80 to-orange-500/80",
  },
  spider: {
    name: "Spider",
    emoji: "🕷️",
    effect: "Slows flower spawning!",
    color: "from-gray-700/80 to-gray-900/80",
  },
  pesticide: {
    name: "Pesticide",
    emoji: "☠️",
    effect: "Lose 3 seconds!",
    color: "from-green-600/80 to-yellow-500/80",
  },
};

interface ObstacleProps {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  onHit: (id: string, type: ObstacleType) => void;
}

export const Obstacle = ({ id, type, x, y, onHit }: ObstacleProps) => {
  const [isHit, setIsHit] = useState(false);
  const [position, setPosition] = useState({ x, y });
  const data = obstacleData[type];

  // Wasps move around
  useEffect(() => {
    if (type !== "wasp") return;

    const moveInterval = setInterval(() => {
      setPosition(prev => ({
        x: Math.max(10, Math.min(90, prev.x + (Math.random() - 0.5) * 15)),
        y: Math.max(15, Math.min(80, prev.y + (Math.random() - 0.5) * 15)),
      }));
    }, 800);

    return () => clearInterval(moveInterval);
  }, [type]);

  const handleClick = () => {
    if (isHit) return;
    setIsHit(true);
    onHit(id, type);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isHit}
      className={cn(
        "absolute transform -translate-x-1/2 -translate-y-1/2 transition-all",
        "w-12 h-12 md:w-14 md:h-14 rounded-full cursor-pointer",
        "flex items-center justify-center text-3xl md:text-4xl",
        "shadow-lg border-2 border-red-400/50",
        "hover:scale-110 active:scale-95",
        type === "wasp" && "duration-300",
        type === "spider" && "duration-200",
        type === "pesticide" && "animate-pulse duration-200",
        isHit && "opacity-0 scale-150 pointer-events-none"
      )}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
    >
      <div className={cn(
        "absolute inset-0 rounded-full bg-gradient-to-br opacity-60",
        data.color
      )} />
      <span className="relative z-10 drop-shadow-lg">
        {data.emoji}
      </span>
    </button>
  );
};
