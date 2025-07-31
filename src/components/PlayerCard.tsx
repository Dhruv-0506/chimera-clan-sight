import { Crown, Shield, Star } from "lucide-react";

interface PlayerCardProps {
  player: {
    id: string;
    name: string;
    townHallLevel: number;
    averageWarScore: number;
    role: "leader" | "co-leader" | "elder" | "member";
    trophies: number;
    warStars: number;
    donations: number;
  };
  onClick: (player: any) => void;
}

const roleIcons = {
  leader: Crown,
  "co-leader": Shield,
  elder: Star,
  member: null,
};

const roleColors = {
  leader: "text-yellow-400",
  "co-leader": "text-orange-400", 
  elder: "text-blue-400",
  member: "text-muted-foreground",
};

export function PlayerCard({ player, onClick }: PlayerCardProps) {
  const RoleIcon = roleIcons[player.role];
  
  return (
    <div
      className="glass-panel-hover p-6 cursor-pointer group"
      onClick={() => onClick(player)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {RoleIcon && <RoleIcon size={16} className={roleColors[player.role]} />}
            <h3 className="text-lg font-semibold text-foreground group-hover:red-glow transition-all duration-300">
              {player.name}
            </h3>
          </div>
          
          <div className="flex items-center space-x-3 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-xs font-bold text-primary-glow">
                {player.townHallLevel}
              </div>
              <span>TH{player.townHallLevel}</span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-primary-glow">
            {player.averageWarScore}
          </div>
          <div className="text-xs text-muted-foreground">Avg War Score</div>
        </div>
      </div>
    </div>
  );
}