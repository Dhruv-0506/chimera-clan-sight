import React, { useEffect, useState } from 'react';
import { Calendar, Filter, ShieldAlert } from 'lucide-react';

const API_URL = 'https://chimera-clan-sight.onrender.com';

interface ClanMember {
  stars?: number;
  destructionPercentage?: number;
}

interface Opponent {
  name?: string;
  members?: any[];
  stars?: number;
  destructionPercentage?: number;
}

interface War {
  warTag?: string;
  endTime?: string;
  opponent?: Opponent;
  result?: string;
  clan?: ClanMember;
}

interface WarStats {
  totalWars: number;
  winRate: number;
  avgStars: number;
  avgDestruction: number;
}

const formatDate = (ts?: string) => {
  if (!ts) return 'N/A';
  const d = new Date(ts);
  return isNaN(d.getTime()) ? 'N/A' : d.toISOString().split('T')[0];
};

const processWarList = (wars: War[]) =>
  wars.map((war, idx) => ({
    id: war.warTag ?? idx,
    date: formatDate(war.endTime),
    opponent: war.opponent?.name ?? 'Unknown Opponent',
    result: (war.result ?? 'Draw').replace(/^(.)/, (_, c) => c.toUpperCase()),
    stars: `${war.clan?.stars ?? 0}-${war.opponent?.stars ?? 0}`,
    destruction: `${(war.clan?.destructionPercentage ?? 0).toFixed(1)}% - ${(war.opponent?.destructionPercentage ?? 0).toFixed(1)}%`,
    duration: '24h',
  }));

export default function Archives() {
  const [wars, setWars] = useState<ReturnType<typeof processWarList>>([]);
  const [stats, setStats] = useState<WarStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/war-log-stats`);
        const json = await res.json();
        if (json.error) throw new Error(json.error);

        const rawWars: War[] = (json.data || []).filter((w: War) => w.opponent?.members?.length);

        const totalWars = rawWars.length;
        const wins = rawWars.filter((w) => w.result?.toLowerCase() === 'win').length;
        const totalStars = rawWars.reduce((s, w) => s + (w.clan?.stars ?? 0), 0);
        const totalDes = rawWars.reduce((d, w) => d + (w.clan?.destructionPercentage ?? 0), 0);

        setStats({
          totalWars,
          winRate: totalWars ? Math.round((wins / totalWars) * 100) : 0,
          avgStars: totalWars ? +(totalStars / totalWars).toFixed(1) : 0,
          avgDestruction: totalWars ? +(totalDes / totalWars).toFixed(1) : 0,
        });

        setWars(processWarList(rawWars));
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch war archives.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredWars = wars.filter((w) => w.opponent.toLowerCase().includes(searchTerm.toLowerCase()));

  if (isLoading)
    return (
      <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
        <p>Loading Archives...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">War Archives</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats && (
            <>
              <div className="glass-panel p-6">
                <Calendar className="text-blue-400 mb-2" size={24} />
                <div className="text-xs uppercase tracking-wide">Total Wars</div>
                <div className="text-2xl font-bold">{stats.totalWars}</div>
              </div>
              <div className="glass-panel p-6">
                <ShieldAlert className="text-red-400 mb-2" size={24} />
                <div className="text-xs uppercase tracking-wide">Win Rate</div>
                <div className="text-2xl font-bold">{stats.winRate}%</div>
              </div>
              <div className="glass-panel p-6">
                <Filter className="text-purple-400 mb-2" size={24} />
                <div className="text-xs uppercase tracking-wide">Average Stars</div>
                <div className="text-2xl font-bold">{stats.avgStars}</div>
              </div>
              <div className="glass-panel p-6">
                <Calendar className="text-yellow-400 mb-2" size={24} />
                <div className="text-xs uppercase tracking-wide">Average Destruction</div>
                <div className="text-2xl font-bold">{stats.avgDestruction}%</div>
              </div>
            </>
          )}
        </div>

        <input
          type="text"
          placeholder="Search Opponent..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />

        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Opponent</th>
              <th className="p-2 border">Result</th>
              <th className="p-2 border">Stars</th>
              <th className="p-2 border">Destruction</th>
            </tr>
          </thead>
          <tbody>
            {filteredWars.map((war) => (
              <tr key={war.id} className="even:bg-gray-50">
                <td className="p-2 border">{war.date}</td>
                <td className="p-2 border">{war.opponent}</td>
                <td className="p-2 border">{war.result}</td>
                <td className="p-2 border">{war.stars}</td>
                <td className="p-2 border">{war.destruction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
