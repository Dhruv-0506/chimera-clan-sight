import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlayerCard } from "@/components/PlayerCard";
import { PlayerDetailsModal } from "@/components/PlayerDetailsModal";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const fetchRoster = async () => {
    if (!BACKEND_URL) throw new Error("Backend URL is not configured.");
    const response = await fetch(`${BACKEND_URL}/api/player-roster`);
    if (!response.ok) throw new Error("Network response was not ok");
    const result = await response.json();
    if (result.error) throw new Error(result.error);
    return result.data;
};

export default function PlayerRoster() {
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);

  const { data: players, isLoading, error } = useQuery({
    queryKey: ['playerRoster'],
    queryFn: fetchRoster
  });

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Player Roster</h1>
          <p className="text-muted-foreground">Click on any player to view detailed performance analytics</p>
        </div>

        {isLoading && <p className="text-center text-muted-foreground">Calculating Historical Scores...</p>}
        {error && <p className="text-center text-red-400">Error: {error.message}</p>}
        
        {players && (
          <div className="grid gap-4">
            {players.sort((a,b) => b.averageWarScore - a.averageWarScore).map((player: any) => (
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
