import { cn } from "@/lib/utils";

export type PollinatorType = "butterfly" | "beetle" | "bumblebee" | "bat";

interface PollinatorInfo {
  name: string;
  emoji: string;
  fact: string;
  color: string;
  bgGradient: string;
}

export const pollinatorData: Record<PollinatorType, PollinatorInfo> = {
  butterfly: {
    name: "Butterfly",
    emoji: "🦋",
    fact: "Butterflies can see ultraviolet light, helping them find nectar-rich flowers invisible to humans!",
    color: "text-pollinator-butterfly",
    bgGradient: "from-purple-400/20 to-pink-400/20",
  },
  beetle: {
    name: "Beetle",
    emoji: "🪲",
    fact: "Beetles were the first pollinators on Earth, appearing 200 million years ago before bees existed!",
    color: "text-pollinator-beetle",
    bgGradient: "from-amber-600/20 to-orange-400/20",
  },
  bumblebee: {
    name: "Bumblebee",
    emoji: "🐝",
    fact: "Bumblebees can vibrate their bodies to shake pollen loose - it's called 'buzz pollination'!",
    color: "text-pollinator-bumblebee",
    bgGradient: "from-yellow-400/20 to-amber-300/20",
  },
  bat: {
    name: "Bat",
    emoji: "🦇",
    fact: "Bats pollinate over 500 plant species including bananas, mangoes, and agave used for tequila!",
    color: "text-pollinator-bat",
    bgGradient: "from-purple-900/20 to-indigo-700/20",
  },
};

interface PollinatorCardProps {
  type: PollinatorType;
  selected: boolean;
  onClick: () => void;
  highScore?: number;
}

export const PollinatorCard = ({ type, selected, onClick, highScore = 0 }: PollinatorCardProps) => {
  const data = pollinatorData[type];

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative group p-6 rounded-2xl border-2 transition-all duration-300 text-left",
        "hover:scale-105 hover:shadow-xl",
        "bg-gradient-to-br",
        data.bgGradient,
        selected
          ? "border-primary shadow-lg ring-4 ring-primary/30 scale-105"
          : "border-border hover:border-primary/50"
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <span className="text-6xl animate-fly">{data.emoji}</span>
        <h3 className={cn("text-xl font-display font-bold", data.color)}>
          {data.name}
        </h3>
        <p className="text-sm text-muted-foreground text-center leading-relaxed">
          {data.fact}
        </p>
        
        {/* High score badge */}
        {highScore > 0 && (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 text-sm font-semibold text-primary">
            <span>🏆</span>
            <span>Best: {highScore}</span>
          </div>
        )}
      </div>
      
      {selected && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
          <span className="text-primary-foreground text-lg">✓</span>
        </div>
      )}
    </button>
  );
};
