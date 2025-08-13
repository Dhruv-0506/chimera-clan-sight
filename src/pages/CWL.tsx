import React, { useState, useEffect } from 'react';
import { Medal, TrendingUp, Users, Trophy, ShieldAlert } from "lucide-react";

const CLAN_TAG = "#2G8LRGU2Q";

// --- HELPER FUNCTIONS to process API data ---

const processCwlData = (groupData, warLogData) => {
    const ourClan = groupData.clans.find(c => c.tag === CLAN_TAG);
    if (!ourClan) throw new Error("Our clan not found in CWL group.");

    const sortedClans = [...groupData.clans].sort((a, b) => {
        if (b.stars !== a.stars) return b.stars - a.stars;
        return b.destructionPercentage - a.destructionPercentage;
    });
    const ourPosition = sortedClans.findIndex(c => c.tag === CLAN_TAG) + 1;

    const currentRoundIndex = groupData.rounds.findIndex(round => round.warTags.some(tag => tag !== '#0'));
    const currentRound = currentRoundIndex !== -1 ? currentRoundIndex + 1 : groupData.rounds.length;

    const cwlWars = (warLogData.cwl?.wars || []).filter(war => groupData.season === war.season);
    const matches = groupData.rounds.slice(0, currentRound).map((round, index) => {
        const warTag = round.warTags.find(tag => tag !== '#0');
        const war = cwlWars.find(w => w.warTag === warTag);

        if (!war || !war.opponent) {
            return {
                day: index + 1,
                opponent: 'War data pending...',
                result: 'Pending',
                stars: 'N/A',
                destruction: 'N/A'
            };
        }
        return {
            day: index + 1,
            opponent: war.opponent.name,
            result: war.result || 'Ongoing',
            stars: `${war.clan.stars}-${war.opponent.stars}`,
            destruction: `${war.clan.destructionPercentage.toFixed(1)}% - ${war.opponent.destructionPercentage.toFixed(1)}%`
        };
    }).reverse();

    const playerStats = new Map();
    for (const war of cwlWars) {
        if (!war.clan.members) continue;
        for (const member of war.clan.members) {
            const stats = playerStats.get(member.tag) || { name: member.name, stars: 0, attacks: 0, destruction: 0 };
            stats.stars += member.stars || 0;
            if (member.attacks) {
                stats.attacks += member.attacks.length;
                stats.destruction += member.attacks.reduce((sum, atk) => sum + atk.destructionPercentage, 0);
            }
            playerStats.set(member.tag, stats);
        }
    }
    const topPerformers = Array.from(playerStats.values())
        .sort((a, b) => b.stars - a.stars)
        .slice(0, 4)
        .map(p => ({
            name: p.name,
            stars: p.stars,
            averageDestruction: p.attacks > 0 ? (p.destruction / p.attacks).toFixed(1) : 0
        }));

    return {
        currentLeague: ourClan.league.name,
        round: `Day ${currentRound} of ${groupData.rounds.length}`,
        position: ourPosition,
        totalClans: groupData.clans.length,
        stars: ourClan.stars,
        matches,
        topPerformers
    };
};


// --- COMPONENT ---

export default function CWL() {
  const [cwlData, setCwlData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCwlPageData = async () => {
        // Define the API URL for production and local development
        const API_URL = process.env.REACT_APP_API_URL || 'https://chimera-clan-sight.onrender.com';
        try {
            const [groupResponse, warLogResponse] = await Promise.all([
                fetch(`${API_URL}/api/cwl`),
                fetch(`${API_URL}/api/war-log-stats`)
            ]);
            
            const groupResult = await groupResponse.json();
            const warLogResult = await warLogResponse.json();

            if (groupResult.error || warLogResult.error) {
                throw new Error(groupResult.error || warLogResult.error);
            }

            if (groupResult.data.state === 'notInWar') {
                 throw new Error("The clan is not currently in a Clan War League.");
            }

            const processedData = processCwlData(groupResult.data, warLogResult.data);
            setCwlData(processedData);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    fetchCwlPageData();
  }, []);

  if (isLoading) {
    return (
        <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground">Loading CWL Data...</h1>
                <p className="text-muted-foreground">Analyzing championship performance.</p>
            </div>
        </div>
    );
  }

  if (error || !cwlData) {
    return (
        <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
            <div className="glass-panel p-8 text-center">
                <ShieldAlert className="mx-auto mb-4 text-primary-glow" size={48} />
                <h1 className="text-2xl font-bold text-foreground">CWL Data Unavailable</h1>
                <p className="text-muted-foreground">{error || "Could not retrieve CWL information."}</p>
            </div>
        </div>
    );
  }

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
                      match.result === "Win" || match.result === "win"
                        ? "bg-green-500/20 text-green-400" 
                        : (match.result === "Loss" || match.result === "lose" ? "bg-red-500/20 text-red-400" : "bg-gray-500/20 text-gray-400")
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
