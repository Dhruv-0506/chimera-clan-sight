import { Calendar, Search, Filter } from "lucide-react";

// Mock archive data
const archiveData = {
  recentWars: [
    { 
      id: 1, 
      date: "2024-01-28", 
      opponent: "Shadow Legends", 
      result: "Victory", 
      stars: "45-41", 
      destruction: "92.3% - 88.7%",
      duration: "23h 45m"
    },
    { 
      id: 2, 
      date: "2024-01-26", 
      opponent: "Fire Dragons", 
      result: "Victory", 
      stars: "43-39", 
      destruction: "89.1% - 85.2%",
      duration: "22h 12m"
    },
    { 
      id: 3, 
      date: "2024-01-24", 
      opponent: "Ice Wolves", 
      result: "Defeat", 
      stars: "38-44", 
      destruction: "84.6% - 91.8%",
      duration: "23h 58m"
    },
    { 
      id: 4, 
      date: "2024-01-22", 
      opponent: "Storm Raiders", 
      result: "Victory", 
      stars: "47-35", 
      destruction: "94.7% - 82.1%",
      duration: "21h 33m"
    },
    { 
      id: 5, 
      date: "2024-01-20", 
      opponent: "Golden Eagles", 
      result: "Victory", 
      stars: "42-40", 
      destruction: "88.9% - 87.4%",
      duration: "23h 19m"
    },
  ],
  stats: {
    totalWars: 156,
    winRate: 73.8,
    averageStars: 42.3,
    averageDestruction: 88.7
  }
};

export default function Archives() {
  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">War Archives</h1>
          <p className="text-muted-foreground">Historical battle records and performance analysis</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="text-blue-400" size={24} />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Total Wars</span>
            </div>
            <div className="text-2xl font-bold text-primary-glow">{archiveData.stats.totalWars}</div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Win Rate</span>
            </div>
            <div className="text-2xl font-bold text-green-400">{archiveData.stats.winRate}%</div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-yellow-400">⭐</div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Avg Stars</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{archiveData.stats.averageStars}</div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-xs font-bold text-primary-glow">
                %
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Avg Destruction</span>
            </div>
            <div className="text-2xl font-bold text-primary-glow">{archiveData.stats.averageDestruction}%</div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="glass-panel p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search by opponent name..."
                className="w-full pl-10 pr-4 py-2 bg-input rounded-lg border border-glass-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <button className="glass-panel-hover px-4 py-2 flex items-center space-x-2">
              <Filter size={16} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* War History Table */}
        <div className="glass-panel p-6">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Recent Wars</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-glass-border">
                  <th className="text-left py-3 px-4 text-primary-glow font-semibold">Date</th>
                  <th className="text-left py-3 px-4 text-primary-glow font-semibold">Opponent</th>
                  <th className="text-left py-3 px-4 text-primary-glow font-semibold">Result</th>
                  <th className="text-left py-3 px-4 text-primary-glow font-semibold">Stars</th>
                  <th className="text-left py-3 px-4 text-primary-glow font-semibold">Destruction</th>
                  <th className="text-left py-3 px-4 text-primary-glow font-semibold">Duration</th>
                </tr>
              </thead>
              <tbody>
                {archiveData.recentWars.map((war, index) => (
                  <tr key={index} className="border-b border-glass-border hover:bg-glass-hover transition-colors cursor-pointer">
                    <td className="py-3 px-4 text-muted-foreground">{war.date}</td>
                    <td className="py-3 px-4 text-foreground font-medium">{war.opponent}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        war.result === "Victory" 
                          ? "bg-green-500/20 text-green-400" 
                          : "bg-red-500/20 text-red-400"
                      }`}>
                        {war.result}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-primary-glow font-semibold">{war.stars}</td>
                    <td className="py-3 px-4 text-primary-glow font-semibold">{war.destruction}</td>
                    <td className="py-3 px-4 text-muted-foreground">{war.duration}</td>
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