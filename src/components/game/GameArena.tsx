import { useState, useEffect, useCallback } from "react";
import { Flower } from "./Flower";
import { PollinatorType, pollinatorData } from "./PollinatorCard";

interface FlowerData {
  id: string;
  x: number;
  y: number;
  color: "coral" | "lavender" | "sunflower" | "pink" | "blue";
}

interface GameArenaProps {
  pollinator: PollinatorType;
  onScore: () => void;
  isPlaying: boolean;
}

const colors: FlowerData["color"][] = ["coral", "lavender", "sunflower", "pink", "blue"];

const generateFlower = (): FlowerData => ({
  id: Math.random().toString(36).substr(2, 9),
  x: 10 + Math.random() * 80,
  y: 15 + Math.random() * 70,
  color: colors[Math.floor(Math.random() * colors.length)],
});

export const GameArena = ({ pollinator, onScore, isPlaying }: GameArenaProps) => {
  const [flowers, setFlowers] = useState<FlowerData[]>([]);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });

  // Initialize flowers
  useEffect(() => {
    if (isPlaying) {
      const initialFlowers = Array.from({ length: 5 }, generateFlower);
      setFlowers(initialFlowers);
    }
  }, [isPlaying]);

  // Spawn new flowers periodically
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setFlowers((prev) => {
        if (prev.length < 8) {
          return [...prev, generateFlower()];
        }
        return prev;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePollinate = useCallback(
    (id: string) => {
      setFlowers((prev) => prev.filter((f) => f.id !== id));
      onScore();
      
      // Add a new flower after a short delay
      setTimeout(() => {
        setFlowers((prev) => [...prev, generateFlower()]);
      }, 500);
    },
    [onScore]
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCursorPos({ x, y });
  };

  const data = pollinatorData[pollinator];

  return (
    <div
      className="relative w-full h-[60vh] md:h-[70vh] rounded-3xl overflow-hidden cursor-none bg-gradient-to-b from-meadow-light to-secondary border-4 border-meadow-dark/30"
      onMouseMove={handleMouseMove}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-meadow-dark/30 to-transparent" />
        <div className="absolute top-10 left-10 text-6xl opacity-30">☁️</div>
        <div className="absolute top-20 right-20 text-4xl opacity-30">☁️</div>
        <div className="absolute top-5 right-10 text-5xl opacity-30">☀️</div>
      </div>

      {/* Grass at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 flex items-end justify-around overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className="text-3xl opacity-60"
            style={{ transform: `rotate(${(Math.random() - 0.5) * 20}deg)` }}
          >
            🌿
          </span>
        ))}
      </div>

      {/* Flowers */}
      {flowers.map((flower) => (
        <Flower
          key={flower.id}
          {...flower}
          onPollinate={handlePollinate}
        />
      ))}

      {/* Custom cursor - the pollinator */}
      <div
        className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 text-5xl md:text-6xl transition-transform duration-75 z-50 animate-fly"
        style={{
          left: `${cursorPos.x}%`,
          top: `${cursorPos.y}%`,
        }}
      >
        {data.emoji}
      </div>

      {/* Instructions overlay when not playing */}
      {!isPlaying && (
        <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center text-card p-8 rounded-2xl">
            <p className="text-2xl font-display">Click flowers to pollinate them!</p>
          </div>
        </div>
      )}
    </div>
  );
};
