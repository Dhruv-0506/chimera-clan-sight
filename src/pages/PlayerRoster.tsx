import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlayerCard } from "@/components/PlayerCard";
import { PlayerDetailsModal } from "@/components/PlayerDetailsModal";

const BACKEND_URL = 'https://chimera-clan-sight.onrender.com';

const fetchRoster = async () => {
    if (!BACKEND_URL) throw new Error("Backend URL is not configured.");
    
    // Set a timeout on the fetch call itself
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 28000); // 28 seconds

    try {
        const response = await fetch(`${BACKEND_URL}/api/player-roster`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`The backend server responded with status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.error) {
            throw new Error(result.error);
        }
        
        return result.data;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error("Request to the backend timed out. Please try again.");
        }
        throw error;
    }
};

export default function PlayerRoster() {
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);

  const { data: players, isLoading, error } = useQuery({
    queryKey: ['playerRoster'],
    queryFn: fetchRoster,
    retry: false
  });

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Player Roster</h1>
          <p className="text-muted-foreground">Click on any player to view detailed performance analytics</p>
        </div>

        {isLoading && <p className="text-center text-muted-foreground">Calculating Historical Scores...</p>}
        
        {error && <div className="glass-panel text-center text-red-400 p-6"><strong>Error:</strong> {error.message}</div>}
        
        {players && (
          <div className="player-card-grid">
            {players.sort((a: any, b: any) => b.averageWarScore - a.averageWarScore).map((player: any) => (
              <PlayerCard
                key={player.tag}
                player={player}
                onClick={setSelectedPlayer}
              />
            ))}
          </div>
        )}
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
