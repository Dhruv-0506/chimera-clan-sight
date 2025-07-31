import { useState } from "react";
import { PlayerCard } from "@/components/PlayerCard";
import { PlayerDetailsModal } from "@/components/PlayerDetailsModal";

// Using the original mock data to guarantee the UI is perfect
const mockPlayers = [
  { tag: "1", name: "DragonSlayer", townHallLevel: 16, averageWarScore: 2847, role: "leader", trophies: 5234, warStars: 892, donations: 15420, warHistory: [ { war: "War 1", score: 2650 }, { war: "War 2", score: 2720 }, { war: "War 3", score: 2890 }, { war: "War 4", score: 2950 }, { war: "War 5", score: 2840 } ] },
  { tag: "2", name: "StormBreaker", townHallLevel: 15, averageWarScore: 2654, role: "co-leader", trophies: 4987, warStars: 743, donations: 12890, warHistory: [ { war: "War 1", score: 2450 }, { war: "War 2", score: 2580 }, { war: "War 3", score: 2690 }, { war: "War 4", score: 2720 }, { war: "War 5", score: 2640 } ] },
];

export default function PlayerRoster() {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  
  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Player Roster</h1>
          <p className="text-muted-foreground">Click on any player to view detailed performance analytics</p>
        </div>
        <div className="player-card-grid">
          {mockPlayers.map((player) => (
            <PlayerCard key={player.tag} player={player} onClick={setSelectedPlayer} />
          ))}
        </div>
      </div>
      {selectedPlayer && <PlayerDetailsModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />}
    </div>
  );
}
