import { useState } from "react";
import { PlayerCard } from "@/components/PlayerCard";
import { PlayerDetailsModal } from "@/components/PlayerDetailsModal";

// Mock data for demonstration
const mockPlayers = [
  {
    id: "1",
    name: "DragonSlayer",
    townHallLevel: 16,
    averageWarScore: 2847,
    role: "leader" as const,
    trophies: 5234,
    warStars: 892,
    donations: 15420,
    warHistory: [
      { war: "War 1", score: 2650 },
      { war: "War 2", score: 2720 },
      { war: "War 3", score: 2890 },
      { war: "War 4", score: 2950 },
      { war: "War 5", score: 2840 },
      { war: "War 6", score: 2930 },
      { war: "War 7", score: 2880 },
      { war: "War 8", score: 2960 },
      { war: "War 9", score: 2850 },
      { war: "War 10", score: 2870 },
    ],
  },
  {
    id: "2", 
    name: "StormBreaker",
    townHallLevel: 15,
    averageWarScore: 2654,
    role: "co-leader" as const,
    trophies: 4987,
    warStars: 743,
    donations: 12890,
    warHistory: [
      { war: "War 1", score: 2450 },
      { war: "War 2", score: 2580 },
      { war: "War 3", score: 2690 },
      { war: "War 4", score: 2720 },
      { war: "War 5", score: 2640 },
      { war: "War 6", score: 2750 },
      { war: "War 7", score: 2680 },
      { war: "War 8", score: 2760 },
      { war: "War 9", score: 2650 },
      { war: "War 10", score: 2670 },
    ],
  },
  {
    id: "3",
    name: "IronFist",
    townHallLevel: 14,
    averageWarScore: 2456,
    role: "elder" as const,
    trophies: 4512,
    warStars: 654,
    donations: 9870,
    warHistory: [
      { war: "War 1", score: 2350 },
      { war: "War 2", score: 2420 },
      { war: "War 3", score: 2490 },
      { war: "War 4", score: 2520 },
      { war: "War 5", score: 2440 },
      { war: "War 6", score: 2530 },
      { war: "War 7", score: 2460 },
      { war: "War 8", score: 2540 },
      { war: "War 9", score: 2450 },
      { war: "War 10", score: 2470 },
    ],
  },
  {
    id: "4",
    name: "ShadowHunter",
    townHallLevel: 15,
    averageWarScore: 2598,
    role: "elder" as const,
    trophies: 4756,
    warStars: 698,
    donations: 11234,
    warHistory: [
      { war: "War 1", score: 2480 },
      { war: "War 2", score: 2550 },
      { war: "War 3", score: 2620 },
      { war: "War 4", score: 2680 },
      { war: "War 5", score: 2570 },
      { war: "War 6", score: 2690 },
      { war: "War 7", score: 2610 },
      { war: "War 8", score: 2700 },
      { war: "War 9", score: 2580 },
      { war: "War 10", score: 2590 },
    ],
  },
  {
    id: "5",
    name: "FireStorm",
    townHallLevel: 13,
    averageWarScore: 2234,
    role: "member" as const,
    trophies: 3876,
    warStars: 543,
    donations: 7654,
    warHistory: [
      { war: "War 1", score: 2150 },
      { war: "War 2", score: 2210 },
      { war: "War 3", score: 2280 },
      { war: "War 4", score: 2320 },
      { war: "War 5", score: 2190 },
      { war: "War 6", score: 2340 },
      { war: "War 7", score: 2220 },
      { war: "War 8", score: 2350 },
      { war: "War 9", score: 2230 },
      { war: "War 10", score: 2240 },
    ],
  },
  {
    id: "6",
    name: "ThunderBolt",
    townHallLevel: 14,
    averageWarScore: 2387,
    role: "member" as const,
    trophies: 4234,
    warStars: 612,
    donations: 8934,
    warHistory: [
      { war: "War 1", score: 2280 },
      { war: "War 2", score: 2340 },
      { war: "War 3", score: 2410 },
      { war: "War 4", score: 2450 },
      { war: "War 5", score: 2320 },
      { war: "War 6", score: 2460 },
      { war: "War 7", score: 2380 },
      { war: "War 8", score: 2470 },
      { war: "War 9", score: 2360 },
      { war: "War 10", score: 2390 },
    ],
  },
];

export default function PlayerRoster() {
  const [selectedPlayer, setSelectedPlayer] = useState<typeof mockPlayers[0] | null>(null);

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Player Roster</h1>
          <p className="text-muted-foreground">Click on any player to view detailed performance analytics</p>
        </div>

        <div className="grid gap-4">
          {mockPlayers.map((player) => (
            <PlayerCard
              key={player.id}
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