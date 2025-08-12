import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlayerCard } from "@/components/PlayerCard";
import { PlayerDetailsModal } from "@/components/PlayerDetailsModal";

const API_URL = import.meta.env.VITE_BACKEND_URL || (import.meta.env.PROD ? 'https://chimera-clan-sight.onrender.com' : 'http://localhost:3001');

const fetchRoster = async () => {
  if (!API_URL) throw new Error("Backend URL is not configured.");

  // Set a timeout on the fetch call itself
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 28000); // 28 seconds

  try {
    const response = await fetch(`${API_URL}/api/player-roster`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`The backend server responded with status: ${response.status}`);
    }

    const result = await response.json();
    if (result.error) {
      throw new Error(result.error);
    }

    return result.data;
  } catch (err: any) {
    // AbortError check - different runtimes can vary
    if (err && (err.name === 'AbortError' || err.code === 'ABORT_ERR')) {
      throw new Error("Request to the backend timed out. Please try again.");
    }
    throw err;
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

        {error && <div className="glass-panel text-center text-red-400 p-6"><strong>Error:</strong> {(error as any).message}</div>}

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
