import { X, Crown, Shield, Star, Trophy, Zap, Gift } from "lucide-react";
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface Player {
  id: string;
  name: string;
  townHallLevel: number;
  role: "leader" | "co-leader" | "elder" | "member";
  trophies: number;
  warStars: number;
  donations: number;
  averageWarScore: number;
  warHistory: { war: string; score: number }[];
}

interface PlayerDetailsModalProps {
  player: Player;
  onClose: () => void;
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

const roleNames = {
  leader: "Leader",
  "co-leader": "Co-leader",
  elder: "Elder",
  member: "Member",
};

export function PlayerDetailsModal({ player, onClose }: PlayerDetailsModalProps) {
  const RoleIcon = roleIcons[player.role];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative glass-panel w-full max-w-4xl mx-4 p-8 animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg glass-panel-hover text-muted-foreground hover:text-primary-glow transition-colors"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            {RoleIcon && <RoleIcon size={24} className={roleColors[player.role]} />}
            <h2 className="text-3xl font-bold text-foreground">{player.name}</h2>
          </div>
          <p className="text-muted-foreground">{roleNames[player.role]} • TH{player.townHallLevel}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Profile Details */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Profile Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 glass-panel">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-sm font-bold text-primary-glow">
                    {player.townHallLevel}
                  </div>
                  <span className="text-foreground">Town Hall Level</span>
                </div>
                <span className="text-primary-glow font-semibold">{player.townHallLevel}</span>
              </div>

              <div className="flex items-center justify-between p-3 glass-panel">
                <div className="flex items-center space-x-3">
                  <Trophy size={20} className="text-yellow-400" />
                  <span className="text-foreground">Trophies</span>
                </div>
                <span className="text-primary-glow font-semibold">{player.trophies.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between p-3 glass-panel">
                <div className="flex items-center space-x-3">
                  <Zap size={20} className="text-blue-400" />
                  <span className="text-foreground">War Stars</span>
                </div>
                <span className="text-primary-glow font-semibold">{player.warStars}</span>
              </div>

              <div className="flex items-center justify-between p-3 glass-panel">
                <div className="flex items-center space-x-3">
                  <Gift size={20} className="text-green-400" />
                  <span className="text-foreground">Donations</span>
                </div>
                <span className="text-primary-glow font-semibold">{player.donations.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Right Side - Performance Graph */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">War Performance Score Over Time</h3>
            
            <div className="glass-panel p-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={player.warHistory}>
                  <XAxis 
                    dataKey="war" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))"
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "hsl(var(--primary-glow))", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-primary-glow">
                {player.averageWarScore}
              </div>
              <div className="text-sm text-muted-foreground">Average War Score</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}