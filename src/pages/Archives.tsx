// src/pages/Archives.jsx  (or .tsx if you use TS)
import React, { useState, useEffect } from 'react';
import { Calendar, Search, Filter, ShieldAlert } from 'lucide-react';

/* ---------- helpers ---------- */
const formatDate = (endTimeString?: string) =>
  endTimeString ? new Date(endTimeString).toISOString().split('T')[0] : 'N/A';

const processWarList = (wars: any[]) =>
  wars.map((war, idx) => ({
    id: war.warTag ?? idx,
    date: formatDate(war.endTime),
    opponent: war.opponent?.name ?? 'Unknown Opponent',
    result: (war.result ?? 'Draw')
      .toLowerCase()
      .replace(/^(.)/, (_, c) => c.toUpperCase()),
    stars: `${war.clan?.stars ?? 0}-${war.opponent?.stars ?? 0}`,
    destruction: `${(war.clan?.destructionPercentage ?? 0).toFixed(1)}% - ${(war.opponent?.destructionPercentage ?? 0).toFixed(1)}%`,
    duration: '24h'
  }));

/* ---------- component ---------- */
export default function Archives() {
  const [stats, setStats] = useState<any>(null);
  const [wars, setWars]   = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = 'https://chimera-clan-sight.onrender.com';

  useEffect(() => {
    const fetchArchiveData = async () => {
      try {
        const res   = await fetch(`${API_URL}/api/war-log-stats`);
        const json  = await res.json();

        if (json.error) throw new Error(json.error);

        const regular = json.data?.regular;
        if (!regular) throw new Error('No regular war data');

        setStats(regular.stats);
        setWars(processWarList(regular.wars));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArchiveData();
  }, []);

  const filteredWars = wars.filter(w =>
    war.opponent.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading)
    return (
      <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading War Archives...</h1>
          <p className="text-muted-foreground">Compiling historical battle records.</p>
        </div>
      </div>
    );

  if (error || !stats)
    return (
      <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
        <div className="glass-panel p-8 text-center">
          <ShieldAlert className="mx-auto mb-4 text-primary-glow" size={48} />
          <h1 className="text-2xl font-bold">Archives Unavailable</h1>
          <p className="text-muted-foreground">{error ?? 'Could not retrieve war log.'}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">War Archives</h1>
          <p className="text-muted-foreground">Historical battle records and performance analysis</p>
        </div>

        {/* stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-panel p-6">
            <Calendar className="text-blue-400 mb-2" size={24} />
            <div className="text-xs uppercase tracking-wide">Total Wars</div>
            <div className="text-2xl font-bold">{stats.totalWars ?? 0}</div>
          </div>

          <div className="glass-panel p-6">
            <div className="text-green-400 mb-2">●</div>
            <div className="text-xs uppercase tracking-wide">Win Rate</div>
            <div className="text-2xl font-bold">{stats.winRate ?? 0}%</div>
          </div>

          <div className="glass-panel p-6">
            <div className="text-yellow-400 mb-2">⭐</div>
            <div className="text-xs uppercase tracking-wide">Avg Stars</div>
            <div className="text-2xl font-bold">{stats.avgStars ?? 0}</div>
          </div>

          <div className="glass-panel p-6">
            <div className="text-primary-glow mb-2">%</div>
            <div className="text-xs uppercase tracking-wide">Avg Destruction</div>
            <div className="text-2xl font-bold">{stats.avgDestruction ?? 0}%</div>
          </div>
        </div>

        {/* search */}
        <div className="glass-panel p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search by opponent name..."
                className="w-full pl-10 pr-4 py-2 bg-input rounded-lg border border-glass-border placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="glass-panel-hover px-4 py-2 flex items-center space-x-2">
              <Filter size={16} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* table */}
        <div className="glass-panel p-6">
          <h2 className="text-2xl font-semibold mb-6">Recent Wars</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-glass-border">
                  <th className="text-left py-3 px-4 text-primary-glow">Date</th>
                  <th className="text-left py-3 px-4 text-primary-glow">Opponent</th>
                  <th className="text-left py-3 px-4 text-primary-glow">Result</th>
                  <th className="text-left py-3 px-4 text-primary-glow">Stars</th>
                  <th className="text-left py-3 px-4 text-primary-glow">Destruction</th>
                  <th className="text-left py-3 px-4 text-primary-glow">Duration</th>
                </tr>
              </thead>
              <tbody>
                {filteredWars.map((war) => (
                  <tr key={war.id} className="border-b border-glass-border hover:bg-glass-hover transition-colors">
                    <td className="py-3 px-4 text-muted-foreground">{war.date}</td>
                    <td className="py-3 px-4 font-medium">{war.opponent}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          war.result === 'Win' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {war.result}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold">{war.stars}</td>
                    <td className="py-3 px-4 font-semibold">{war.destruction}</td>
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
