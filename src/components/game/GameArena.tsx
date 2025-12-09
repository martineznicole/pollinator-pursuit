import { useState, useEffect, useCallback } from "react";
import { Flower } from "./Flower";
import { PollinatorType, pollinatorData } from "./PollinatorCard";
import { PowerUp, PowerUpType } from "./PowerUp";
import { Obstacle, ObstacleType } from "./Obstacle";

interface FlowerData {
  id: string;
  x: number;
  y: number;
  color: "coral" | "lavender" | "sunflower" | "pink" | "blue";
}

interface PowerUpData {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
}

interface ObstacleData {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
}

interface GameArenaProps {
  pollinator: PollinatorType;
  onScore: (points: number) => void;
  onPowerUp: (type: PowerUpType, flowerPositions: { x: number; y: number }[]) => void;
  onObstacleHit: (type: ObstacleType) => void;
  isPlaying: boolean;
  hasDoublePoints: boolean;
  isSlowed: boolean;
}

const colors: FlowerData["color"][] = ["coral", "lavender", "sunflower", "pink", "blue"];
const powerUpTypes: PowerUpType[] = ["pollen-boost", "time-freeze", "super-nectar"];
const obstacleTypes: ObstacleType[] = ["wasp", "spider", "pesticide"];

const generateFlower = (): FlowerData => ({
  id: Math.random().toString(36).substr(2, 9),
  x: 10 + Math.random() * 80,
  y: 15 + Math.random() * 70,
  color: colors[Math.floor(Math.random() * colors.length)],
});

const generatePowerUp = (): PowerUpData => ({
  id: Math.random().toString(36).substr(2, 9),
  type: powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)],
  x: 15 + Math.random() * 70,
  y: 20 + Math.random() * 60,
});

const generateObstacle = (): ObstacleData => ({
  id: Math.random().toString(36).substr(2, 9),
  type: obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)],
  x: 15 + Math.random() * 70,
  y: 20 + Math.random() * 60,
});

export const GameArena = ({ 
  pollinator, 
  onScore, 
  onPowerUp, 
  onObstacleHit,
  isPlaying, 
  hasDoublePoints,
  isSlowed 
}: GameArenaProps) => {
  const [flowers, setFlowers] = useState<FlowerData[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUpData[]>([]);
  const [obstacles, setObstacles] = useState<ObstacleData[]>([]);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });

  // Initialize flowers
  useEffect(() => {
    if (isPlaying) {
      const initialFlowers = Array.from({ length: 5 }, generateFlower);
      setFlowers(initialFlowers);
      setPowerUps([]);
      setObstacles([]);
    }
  }, [isPlaying]);

  // Spawn new flowers periodically
  useEffect(() => {
    if (!isPlaying) return;

    const spawnRate = isSlowed ? 2500 : 1500;
    
    const interval = setInterval(() => {
      setFlowers((prev) => {
        if (prev.length < 8) {
          return [...prev, generateFlower()];
        }
        return prev;
      });
    }, spawnRate);

    return () => clearInterval(interval);
  }, [isPlaying, isSlowed]);

  // Spawn power-ups randomly
  useEffect(() => {
    if (!isPlaying) return;

    const spawnPowerUp = () => {
      if (Math.random() < 0.3) {
        setPowerUps((prev) => {
          if (prev.length < 2) {
            return [...prev, generatePowerUp()];
          }
          return prev;
        });
      }
    };

    const interval = setInterval(spawnPowerUp, 5000);
    const initialTimeout = setTimeout(spawnPowerUp, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, [isPlaying]);

  // Spawn obstacles
  useEffect(() => {
    if (!isPlaying) return;

    const spawnObstacle = () => {
      if (Math.random() < 0.4) { // 40% chance
        setObstacles((prev) => {
          if (prev.length < 3) {
            return [...prev, generateObstacle()];
          }
          return prev;
        });
      }
    };

    // First obstacle after 5 seconds
    const initialTimeout = setTimeout(spawnObstacle, 5000);
    const interval = setInterval(spawnObstacle, 4000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isPlaying]);

  // Auto-remove obstacles after some time
  useEffect(() => {
    if (!isPlaying || obstacles.length === 0) return;

    const timeout = setTimeout(() => {
      setObstacles((prev) => prev.slice(1));
    }, 6000);

    return () => clearTimeout(timeout);
  }, [isPlaying, obstacles.length]);

  const handlePollinate = useCallback(
    (id: string) => {
      setFlowers((prev) => prev.filter((f) => f.id !== id));
      const points = hasDoublePoints ? 2 : 1;
      onScore(points);
      
      setTimeout(() => {
        setFlowers((prev) => [...prev, generateFlower()]);
      }, 500);
    },
    [onScore, hasDoublePoints]
  );

  const handlePowerUpCollect = useCallback(
    (id: string, type: PowerUpType) => {
      setPowerUps((prev) => prev.filter((p) => p.id !== id));
      
      const flowerPositions = flowers.map(f => ({ x: f.x, y: f.y }));
      onPowerUp(type, flowerPositions);
      
      if (type === "super-nectar") {
        const nearbyFlowers = flowers.filter((f) => {
          const dx = f.x - cursorPos.x;
          const dy = f.y - cursorPos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance < 30;
        });
        
        nearbyFlowers.forEach((f, i) => {
          setTimeout(() => {
            handlePollinate(f.id);
          }, i * 100);
        });
      }
    },
    [onPowerUp, flowers, cursorPos, handlePollinate]
  );

  const handleObstacleHit = useCallback(
    (id: string, type: ObstacleType) => {
      setObstacles((prev) => prev.filter((o) => o.id !== id));
      onObstacleHit(type);
    },
    [onObstacleHit]
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

      {/* Double points indicator */}
      {hasDoublePoints && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-display font-bold animate-pulse shadow-lg">
          ⚡ 2x POINTS ⚡
        </div>
      )}

      {/* Slowed indicator */}
      {isSlowed && (
        <div className="absolute top-4 right-4 z-40 bg-gradient-to-r from-gray-600 to-gray-800 text-white px-3 py-1 rounded-full font-display text-sm animate-pulse shadow-lg">
          🕷️ Slowed!
        </div>
      )}

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

      {/* Power-ups */}
      {powerUps.map((powerUp) => (
        <PowerUp
          key={powerUp.id}
          {...powerUp}
          onCollect={handlePowerUpCollect}
        />
      ))}

      {/* Obstacles */}
      {obstacles.map((obstacle) => (
        <Obstacle
          key={obstacle.id}
          {...obstacle}
          onHit={handleObstacleHit}
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
            <p className="text-lg mt-2 opacity-80">Avoid the obstacles! 🕷️</p>
          </div>
        </div>
      )}
    </div>
  );
};
