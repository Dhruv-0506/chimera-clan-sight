import React, { useState, useEffect } from 'react';
import { Calendar, Search, Filter, ShieldAlert } from "lucide-react";

// --- HELPER FUNCTIONS to process API data ---

const formatDate = (endTimeString) => {
  if (!endTimeString) return 'N/A';
  const date = new Date(endTimeString);
  return date.toISOString().split('T')[0];
};

const processWarList = (wars) => {
    return wars.map((war, index) => ({
        id: war.warTag || index,
        date: formatDate(war.endTime),
        opponent: war.opponent?.name || 'Unknown Opponent',
        result: war.result ? war.result.charAt(0).toUpperCase() + war.result.slice(1) : 'Draw',
        stars: `${war.clan?.stars || 0}-${war.opponent?.stars || 0}`,
        destruction: `${war.clan?.destructionPercentage?.toFixed(1) || 0}% - ${war.opponent?.destructionPercentage?.toFixed(1) || 0}%`,
        duration: "24h"
    }));
};

// --- COMPONENT ---

export default function Archives() {
  const [stats, setStats] = useState(null);
  const [wars, setWars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchArchiveData = async () => {
        // Define the API URL for production and local development
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        try {
            const response = await fetch(`${API_URL}/api/war-log-stats`);
            const result = await response.json();

            if (result.error) {
                throw new Error(result.error);
            }
            
            const regularWarData = result.data.regular;
            setStats(regularWarData.stats);
            setWars(processWarList(regularWarData.wars));

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    fetchArchiveData();
  }, []);

  const filteredWars = wars.filter(war =>
    war.opponent.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
        <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground">Loading War Archives...</h1>
                <p className="text-muted-foreground">Compiling historical battle records.</p>
            </div>
        </div>
    );
  }

  if (error || !stats) {
    return (
        <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
            <div className="glass-panel p-8 text-center">
                <ShieldAlert className="mx-auto mb-4 text-primary-glow" size={48} />
                <h1 className="text-2xl font-bold text-foreground">Archives Unavailable</h1>
                <p className="text-muted-foreground">{error || "Could not retrieve war log."}</p>
            </div>
        </div>
    );
  }

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
            <div className="text-2xl font-bold text-primary-glow">{stats.totalWars}</div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Win Rate</span>
            </div>
            <div className="text-2xl font-bold text-green-400">{stats.winRate}%</div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-yellow-400 text-xl">⭐</div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Avg Stars</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{stats.avgStars}</div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-xs font-bold text-primary-glow">
                %
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Avg Destruction</span>
            </div>
            <div className="text-2xl font-bold text-primary-glow">{stats.avgDestruction}%</div>
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
                {filteredWars.map((war) => (
                  <tr key={war.id} className="border-b border-glass-border hover:bg-glass-hover transition-colors cursor-pointer">
                    <td className="py-3 px-4 text-muted-foreground">{war.date}</td>
                    <td className="py-3 px-4 text-foreground font-medium">{war.opponent}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        war.result === "Win" || war.result === "Victory"
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
