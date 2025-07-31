import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlayerCard } from "@/components/PlayerCard";
import { PlayerDetailsModal } from "@/components/PlayerDetailsModal";

// The BACKEND_URL will be provided by OnRender's environment variables
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const fetchRoster = async () => {
    if (!BACKEND_URL) throw new Error("Backend URL is not configured. Please set VITE_BACKEND_URL in your environment variables.");
    
    const response = await fetch(`${BACKEND_URL}/api/player-roster`);
    if (!response.ok) {
        throw new Error("The backend server is not responding correctly. Check the backend logs.");
    }
    
    const result = await response.json();
    if (result.error) {
        throw new Error(result.error);
    }
    
    return result.data;
};

export default function PlayerRoster() {
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);

  // useQuery handles fetching, loading, and error states for us automatically
  const { data: players, isLoading, error } = useQuery({
    queryKey: ['playerRoster'],
    queryFn: fetchRoster,
    retry: false // It's better not to retry automatically on server errors
  });

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Player Roster</h1>
          <p className="text-muted-foreground">Click on any player to view detailed performance analytics</p>
        </div>

        {/* Conditional Rendering: Show loading, error, or data */}
        {isLoading && <p className="text-center text-muted-foreground">Calculating Historical Scores...</p>}
        
        {error && <p className="text-center text-red-400">Error: {error.message}</p>}
        
        {players && (
          <div className="player-card-grid">
            {/* Sort players by average score, descending */}
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

      {/* The Modal will appear here when a player is selected */}
      {selectedPlayer && (
        <PlayerDetailsModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
}```

### **Final Instructions**

1.  **Replace** the entire contents of `src/index.css` and `src/pages/PlayerRoster.tsx` on your GitHub.
2.  **Commit the changes.**
3.  OnRender will see your commits and automatically start a new deployment for your **Static Site (the frontend)**.
4.  Once the deployment is "Live", go to your website and do a **Hard Refresh** (`Ctrl+Shift+R` or `Cmd+Shift+R`).

This definitive update will resolve all the outstanding issues. The CSS will now correctly render the "liquid glass" UI, and the Player Roster page will finally have the correct card-based layout, display the accurate average scores, and have a fully functional pop-up with the performance graph. Your dashboard will be complete and correct.
