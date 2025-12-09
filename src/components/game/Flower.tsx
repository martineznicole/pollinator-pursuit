import { cn } from "@/lib/utils";
import { useState } from "react";

type FlowerColor = "coral" | "lavender" | "sunflower" | "pink" | "blue";

interface FlowerProps {
  id: string;
  x: number;
  y: number;
  color: FlowerColor;
  onPollinate: (id: string) => void;
}

const flowerColorClasses: Record<FlowerColor, string> = {
  coral: "text-flower-coral",
  lavender: "text-flower-lavender",
  sunflower: "text-flower-sunflower",
  pink: "text-flower-pink",
  blue: "text-flower-blue",
};

const flowerEmojis = ["🌸", "🌺", "🌻", "🌷", "🌼", "💐", "🪻", "🌹"];

export const Flower = ({ id, x, y, color, onPollinate }: FlowerProps) => {
  const [isPollinated, setIsPollinated] = useState(false);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleClick = () => {
    if (isPollinated) return;
    
    setIsPollinated(true);
    
    // Create sparkle effects
    const newSparkles = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 60,
      y: (Math.random() - 0.5) * 60,
    }));
    setSparkles(newSparkles);
    
    setTimeout(() => {
      onPollinate(id);
    }, 400);
  };

  const emoji = flowerEmojis[parseInt(id, 36) % flowerEmojis.length];

  return (
    <button
      onClick={handleClick}
      disabled={isPollinated}
      className={cn(
        "absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300",
        "text-5xl md:text-6xl cursor-pointer hover:scale-125 active:scale-95",
        "animate-float",
        flowerColorClasses[color],
        isPollinated && "opacity-0 scale-150"
      )}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        animationDelay: `${Math.random() * 2}s`,
      }}
    >
      {emoji}
      
      {/* Sparkle effects */}
      {sparkles.map((sparkle) => (
        <span
          key={sparkle.id}
          className="absolute animate-sparkle text-2xl pointer-events-none"
          style={{
            left: `${sparkle.x}px`,
            top: `${sparkle.y}px`,
          }}
        >
          ✨
        </span>
      ))}
    </button>
  );
};
