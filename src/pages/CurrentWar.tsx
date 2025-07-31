import { Sword, Users, Trophy, Clock } from "lucide-react";

// Mock war data
const warData = {
  status: "In Progress",
  timeRemaining: "18h 24m",
  clanStars: 42,
  enemyStars: 38,
  clanDestruction: 87.5,
  enemyDestruction: 82.3,
  attacks: [
    { player: "DragonSlayer", target: "#1", stars: 3, destruction: 95 },
    { player: "StormBreaker", target: "#3", stars: 2, destruction: 78 },
    { player: "IronFist", target: "#5", stars: 3, destruction: 89 },
    { player: "ShadowHunter", target: "#2", stars: 2, destruction: 71 },
    { player: "FireStorm", target: "#8", stars: 3, destruction: 92 },
    { player: "ThunderBolt", target: "#6", stars: 2, destruction: 84 },
  ]
};

export default function CurrentWar() {
  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Current War</h1>
          <p className="text-muted-foreground">Live battle analytics and performance tracking</p>
        </div>

        {/* War Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <Sword className="text-primary-glow" size={24} />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Status</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{warData.status}</div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="text-blue-400" size={24} />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Time Left</span>
            </div>
            <div className="text-2xl font-bold red-glow">{warData.timeRemaining}</div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="text-yellow-400" size={24} />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Stars</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              <span className="text-primary-glow">{warData.clanStars}</span>
              <span className="text-muted-foreground"> - {warData.enemyStars}</span>
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="text-purple-400" size={24} />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Destruction</span>
            </div>
            <div className="text-lg font-bold text-foreground">
              <span className="text-primary-glow">{warData.clanDestruction}%</span>
              <span className="text-muted-foreground"> - {warData.enemyDestruction}%</span>
            </div>
          </div>
        </div>

        {/* Recent Attacks Table */}
        <div className="glass-panel p-6">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Recent Attacks</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-glass-border">
                  <th className="text-left py-3 px-4 text-primary-glow font-semibold">Player</th>
                  <th className="text-left py-3 px-4 text-primary-glow font-semibold">Target</th>
                  <th className="text-left py-3 px-4 text-primary-glow font-semibold">Stars</th>
                  <th className="text-left py-3 px-4 text-primary-glow font-semibold">Destruction</th>
                </tr>
              </thead>
              <tbody>
                {warData.attacks.map((attack, index) => (
                  <tr key={index} className="border-b border-glass-border hover:bg-glass-hover transition-colors">
                    <td className="py-3 px-4 text-foreground font-medium">{attack.player}</td>
                    <td className="py-3 px-4 text-muted-foreground">{attack.target}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-4 h-4 ${
                              i < attack.stars
                                ? "text-yellow-400 drop-shadow-glow"
                                : "text-muted-foreground/30"
                            }`}
                          >
                            ⭐
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-primary-glow font-semibold">{attack.destruction}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}