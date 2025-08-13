import React, { useEffect, useState } from 'react';

const API_URL = 'https://chimera-clan-sight.onrender.com';

interface CWLOpponent {
  name: string;
  tag: string;
  stars: number;
  destructionPercentage: number;
}

interface CWLWar {
  state: string;
  clan: {
    name: string;
    stars: number;
    destructionPercentage: number;
    members: any[];
  };
  opponent: CWLOpponent;
  teamSize: number;
}

export default function CWL() {
  const [war, setWar] = useState<CWLWar | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCWL = async () => {
      try {
        const res = await fetch(`${API_URL}/api/cwl`);
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        if (!json.data || !json.data.clan) throw new Error('No CWL war data found');
        setWar(json.data);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch CWL data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCWL();
  }, []);

  if (isLoading)
    return (
      <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
        <p>Loading CWL...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );

  if (!war) return null;

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Current CWL</h1>
        <div className="bg-gray-50 p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-2">{war.clan.name}</h2>
          <p>
            Stars: {war.clan.stars} - {war.opponent.stars} | Destruction:{' '}
            {war.clan.destructionPercentage.toFixed(1)}% - {war.opponent.destructionPercentage.toFixed(1)}%
          </p>
          <p>State: {war.state}</p>
          <p>Team Size: {war.teamSize}</p>
          <p>Opponent: {war.opponent.name}</p>
        </div>
      </div>
    </div>
  );
}
