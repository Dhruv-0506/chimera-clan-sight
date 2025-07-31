import { Medal, TrendingUp, Users, Trophy } from "lucide-react";

// Mock CWL data
const cwlData = {
  currentLeague: "Champion League II",
  round: "Day 4 of 7",
  position: 2,
  totalClans: 8,
  stars: 186,
  destructionPercentage: 89.4,
  bonusesRemaining: 3,
  matches: [
    { day: 1, opponent: "Warriors United", result: "Win", stars: "28-24", destruction: "91.2% - 87.3%" },
    { day: 2, opponent: "Elite Guardians", result: "Win", stars: "26-22", destruction: "88.7% - 84.1%" },
    { day: 3, opponent: "Dragon Force", result: "Loss", stars: "24-27", destruction: "86.9% - 92.4%" },
    { day: 4, opponent: "Phoenix Rising", result: "Win", stars: "29-21", destruction: "93.1% - 82.7%" },
  ],
  topPerformers: [
    { name: "DragonSlayer", stars: 21, averageDestruction: 94.2 },
    { name: "StormBreaker", stars: 19, averageDestruction: 89.7 },
    { name: "IronFist", stars: 17, averageDestruction: 87.3 },
    { name: "ShadowHunter", stars: 16, averageDestruction: 85.9 },
  ]
};

export default function CWL() {
  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Clan War League</h1>
          <p className="text-muted-foreground">Championship performance analytics and standings</p>
        </div>

        {/* CWL Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <Medal className="text-yellow-400" size={24} />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">League</span>
            </div>
            <div className="text-lg font-bold text-foreground">{cwlData.currentLeague}</div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="text-green-400" size={24} />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Position</span>
            </div>
            <div className="text-2xl font-bold red-glow">
              #{cwlData.position}<span className="text-muted-foreground text-lg">/{cwlData.totalClans}</span>
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="text-blue-400" size={24} />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Total Stars</span>
            </div>
            <div className="text-2xl font-bold text-primary-glow">{cwlData.stars}</div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="text-purple-400" size={24} />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Progress</span>
            </div>
            <div className="text-lg font-bold text-foreground">{cwlData.round}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Match Results */}
          <div className="glass-panel p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-6">Match Results</h2>
            
            <div className="space-y-4">
              {cwlData.matches.map((match, index) => (
                <div key={index} className="glass-panel p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-muted-foreground">Day {match.day}</div>
                      <div className="text-foreground font-medium">{match.opponent}</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      match.result === "Win" 
                        ? "bg-green-500/20 text-green-400" 
                        : "bg-red-500/20 text-red-400"
                    }`}>
                      {match.result}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Stars: </span>
                      <span className="text-primary-glow font-semibold">{match.stars}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Destruction: </span>
                      <span className="text-primary-glow font-semibold">{match.destruction}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performers */}
          <div className="glass-panel p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-6">Top Performers</h2>
            
            <div className="space-y-4">
              {cwlData.topPerformers.map((performer, index) => (
                <div key={index} className="glass-panel p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary-glow">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="text-foreground font-semibold">{performer.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {performer.averageDestruction}% avg destruction
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary-glow">{performer.stars}</div>
                      <div className="text-xs text-muted-foreground">stars</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}