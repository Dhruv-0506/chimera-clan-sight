import React, { useState, useEffect } from 'react';
import { Sword, Users, Trophy, Clock, ShieldAlert } from "lucide-react";

// --- HELPER FUNCTIONS to process API data ---
const formatTimeRemaining = (endTimeString: string | undefined | null) => {
  if (!endTimeString) return "N/A";
  const endTime = new Date(endTimeString).getTime();
  const now = new Date().getTime();
  const distance = endTime - now;

  if (distance < 0) return "War Ended";

  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
};

const processAttacks = (war: any) => {
  if (!war?.clan?.members || !war?.opponent?.members) return [];

  const memberNameMap = new Map(war.clan.members.map((m: any) => [m.tag, m.name]));
  const opponentPositionMap = new Map(war.opponent.members.map((m: any) => [m.tag, m.mapPosition]));

  const allAttacks = war.clan.members.flatMap((member: any) =>
    (member.attacks || []).map((attack: any) => ({
      player: memberNameMap.get(attack.attackerTag) || 'Unknown Player',
      target: `#${opponentPositionMap.get(attack.defenderTag) || '?'}`,
      stars: attack.stars,
      destruction: attack.destructionPercentage,
      order: attack.order
    }))
  );

  return allAttacks.sort((a: any, b: any) => b.order - a.order);
};

// --- COMPONENT ---
export default function CurrentWar() {
  const [warData, setWarData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWarData = async () => {
      const API_URL = import.meta.env.VITE_BACKEND_URL || (import.meta.env.PROD ? 'https://chimera-clan-sight.onrender.com' : 'http://localhost:3001');

      try {
        const response = await fetch(`${API_URL}/api/current-war`);
        const result = await response.json();

        if (result.error) {
          throw new Error(result.error);
        }

        if (result.data?.state === 'notInWar') {
          throw new Error("The clan is not currently in a war.");
        }

        setWarData(result.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch war data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWarData();
  }, []);

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Loading War Data...</h1>
          <p className="text-muted-foreground">Fetching live battle analytics.</p>
        </div>
      </div>
    );
  }

  // 2. Error or No War State
  if (error || !warData) {
    return (
      <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
        <div className="glass-panel p-8 text-center">
          <ShieldAlert className="mx-auto mb-4 text-primary-glow" size={48} />
          <h1 className="text-2xl font-bold text-foreground">War Data Unavailable</h1>
          <p className="text-muted-foreground">{error || "Could not retrieve current war information."}</p>
        </div>
      </div>
    );
  }

  // 3. Success State: Prepare data for the existing UI
  const warStatus = (warData.state || '').replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase());
  const attacks = processAttacks(warData);

  // Render the original UI with fetched data
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
            <div className="text-2xl font-bold text-foreground">{warStatus}</div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="text-blue-400" size={24} />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Time Left</span>
            </div>
            <div className="text-2xl font-bold red-glow">{formatTimeRemaining(warData.endTime)}</div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="text-yellow-400" size={24} />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Stars</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              <span className="text-primary-glow">{warData.clan?.stars ?? 0}</span>
              <span className="text-muted-foreground"> - {warData.opponent?.stars ?? 0}</span>
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="text-purple-400" size={24} />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Destruction</span>
            </div>
            <div className="text-lg font-bold text-foreground">
              <span className="text-primary-glow">{(warData.clan?.destructionPercentage ?? 0).toFixed(2)}%</span>
              <span className="text-muted-foreground"> - {(warData.opponent?.destructionPercentage ?? 0).toFixed(2)}%</span>
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
                {attacks.map((attack: any, index: number) => (
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
