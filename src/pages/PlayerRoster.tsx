import React, { useState, useEffect } from 'react';
import { PlayerCard } from "@/components/PlayerCard";
import { PlayerDetailsModal } from "@/components/PlayerDetailsModal";
import { ShieldAlert } from 'lucide-react';

// Define a type for the player data that matches the API response
// This provides type safety and autocompletion
type Player = {
  tag: string;
  name: string;
  townHallLevel: number;
  averageWarScore: number;
  role: 'leader' | 'coLeader' | 'admin' | 'member'; // API uses 'admin' for elder
  trophies: number;
  warStars: number;
  donations: number;
  warHistory: { war: string; score: number }[];
};

export default function PlayerRoster() {
  // States for data, loading, error, and the selected player for the modal
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
        try {
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001'; const response = await fetch(`${API_URL}/api/player-roster`);
            const result = await response.json();

            if (result.error) {
                throw new Error(result.error);
            }
            
            // Sort players by averageWarScore in descending order by default
            const sortedPlayers = result.data.sort((a: Player, b: Player) => b.averageWarScore - a.averageWarScore);
            setPlayers(sortedPlayers);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    fetchPlayerData();
  }, []); // Empty array ensures this runs only once

  if (isLoading) {
    return (
        <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground">Calculating Player Scores...</h1>
                <p className="text-muted-foreground">Analyzing historical performance data.</p>
            </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
            <div className="glass-panel p-8 text-center">
                <ShieldAlert className="mx-auto mb-4 text-primary-glow" size={48} />
                <h1 className="text-2xl font-bold text-foreground">Player Data Unavailable</h1>
                <p className="text-muted-foreground">{error}</p>
            </div>
        </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Player Roster</h1>
          <p className="text-muted-foreground">Click on any player to view detailed performance analytics</p>
        </div>

        <div className="grid gap-4">
          {players.map((player) => (
            <PlayerCard
              key={player.tag} // Use the unique player tag as the key
              player={player}
              onClick={setSelectedPlayer}
            />
          ))}
        </div>
      </div>

      {selectedPlayer && (
        <PlayerDetailsModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
}
