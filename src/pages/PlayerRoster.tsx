import React, { useEffect, useState } from 'react';

const API_URL = 'https://chimera-clan-sight.onrender.com';

interface Player {
  tag: string;
  name: string;
  townhallLevel: number;
  role: string;
  donations: number;
  donationsReceived: number;
  attackWins: number;
  defenseWins: number;
}

export default function PlayerRoster() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/clan-info`);
        const text = await res.text();

        let json;
        try {
          json = JSON.parse(text);
        } catch {
          throw new Error('Backend did not return valid JSON. Response: ' + text);
        }

        if (json.error) throw new Error(json.error);

        // Map backend data safely to Player[]
        const members: Player[] = (json.data?.memberList ?? []).map((m: any) => ({
          tag: m.tag,
          name: m.name,
          townhallLevel: m.townhallLevel ?? m.townHallLevel ?? 0,
          role: m.role ?? '',
          donations: m.donations ?? 0,
          donationsReceived: m.donationsReceived ?? 0,
          attackWins: m.attackWins ?? 0,
          defenseWins: m.defenseWins ?? 0,
        }));

        if (members.length === 0) throw new Error('No players found.');

        setPlayers(members);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch player roster.');
        setPlayers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  if (isLoading)
    return (
      <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
        <p>Loading Player Roster...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Player Roster</h1>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Tag</th>
              <th className="p-2 border">TH</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Attack Wins</th>
              <th className="p-2 border">Defense Wins</th>
              <th className="p-2 border">Donations</th>
              <th className="p-2 border">Donations Received</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.tag} className="even:bg-gray-50">
                <td className="p-2 border">{p.name}</td>
                <td className="p-2 border">{p.tag}</td>
                <td className="p-2 border">{p.townhallLevel}</td>
                <td className="p-2 border">{p.role}</td>
                <td className="p-2 border">{p.attackWins}</td>
                <td className="p-2 border">{p.defenseWins}</td>
                <td className="p-2 border">{p.donations}</td>
                <td className="p-2 border">{p.donationsReceived}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
