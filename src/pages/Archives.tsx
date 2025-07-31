import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Calendar, Star, TrendingUp, PieChart } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const fetchWarLog = async () => {
    if (!BACKEND_URL) throw new Error("Backend URL is not configured.");
    const response = await fetch(`${BACKEND_URL}/api/war-log`);
    const result = await response.json();
    if (result.error) throw new Error(result.error);
    return result.data.items.filter((war: any) => war.clan.attacks !== undefined);
};

const calculateStats = (wars) => {
    if (!wars || wars.length === 0) return { totalWars: 0, winRate: 0, avgStars: 0, avgDestruction: 0 };
    const wins = wars.filter(w => w.result === 'win').length;
    const totalStars = wars.reduce((sum, w) => sum + w.clan.stars, 0);
    const totalDestruction = wars.reduce((sum, w) => sum + w.clan.destructionPercentage, 0);
    return {
        totalWars: wars.length,
        winRate: Math.round((wins / wars.length) * 100),
        avgStars: Math.round(totalStars / wars.length),
        avgDestruction: Math.round(totalDestruction / wars.length)
    };
};

export default function Archives() {
  const { data: recentWars, isLoading, error } = useQuery({ queryKey: ['warLog'], queryFn: fetchWarLog });
  const stats = calculateStats(recentWars);

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">War Archives</h1>
          <p className="text-muted-foreground">Historical battle records and performance analysis</p>
        </div>

        {isLoading && <p className="text-center text-muted-foreground">Loading Archives...</p>}
        {error && <p className="text-center text-red-400">Error: {error.message}</p>}
        
        {recentWars && (
            <>
                <div className="stats-grid">
                    <div className="stat-card"><div className="stat-header"><Calendar size={18}/><span>Total Wars</span></div><div className="stat-value">{stats.totalWars}</div></div>
                    <div className="stat-card"><div className="stat-header"><TrendingUp size={18}/><span>Win Rate</span></div><div className="stat-value" style={{color: '#4CAF50'}}>{stats.winRate}%</div></div>
                    <div className="stat-card"><div className="stat-header"><Star size={18}/><span>Avg Stars</span></div><div className="stat-value">{stats.avgStars}</div></div>
                    <div className="stat-card"><div className="stat-header"><PieChart size={18}/><span>Avg Destruction</span></div><div className="stat-value">{stats.avgDestruction}%</div></div>
                </div>

                <div className="glass-panel">
                    <h2 className="text-2xl font-semibold text-foreground mb-6">Recent Wars</h2>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-glass-border">
                                <th className="text-left py-3 px-4 text-primary-glow font-semibold">Opponent</th>
                                <th className="text-left py-3 px-4 text-primary-glow font-semibold">Result</th>
                                <th className="text-left py-3 px-4 text-primary-glow font-semibold">Stars</th>
                                <th className="text-left py-3 px-4 text-primary-glow font-semibold">Destruction</th>
                            </tr>
                        </thead>
                        <tbody>
                        {recentWars.map((war, index) => (
                            <tr key={index} className="border-b border-glass-border hover:bg-glass-hover">
                                <td className="py-3 px-4 text-foreground font-medium">{war.opponent.name}</td>
                                <td className="py-3 px-4"><span className={`result-pill ${war.result}`}>{war.result}</span></td>
                                <td className="py-3 px-4 text-primary-glow font-semibold">{war.clan.stars} - {war.opponent.stars}</td>
                                <td className="py-3 px-4 text-primary-glow font-semibold">{war.clan.destructionPercentage.toFixed(1)}%</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </>
        )}
      </div>
    </div>
  );
}
