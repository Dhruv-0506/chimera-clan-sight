// src/pages/PlayerRoster.jsx
import React, { useEffect, useState } from 'react';
import { Users, ShieldAlert, Trophy } from 'lucide-react';
import { PlayerDetailsModal } from '../components/PlayerDetailsModal'; // <-- your old modal file

const BACKEND_URL = 'https://chimera-clan-sight.onrender.com';

export default function PlayerRoster() {
  const [roster, setRoster]   = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);   // for modal

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/roster`)
      .then(res => res.json())
      .then(json => {
        if (json.error) throw new Error(json.error);
        setRoster(json.data ?? []);
      })
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="min-h-screen pt-24 px-6 flex items-center justify-center"><h1 className="text-2xl font-bold">Loading Roster...</h1></div>;
  if (error)     return <div className="min-h-screen pt-24 px-6 flex items-center justify-center"><ShieldAlert className="mx-auto mb-4 text-primary-glow" size={48}/><h1 className="text-2xl font-bold">Roster Unavailable</h1><p className="text-muted-foreground">{error}</p></div>;

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Clan Roster</h1>
          <p className="text-muted-foreground">Full member list & basic stats</p>
        </div>

        <div className="glass-panel p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-glass-border">
                  <th className="text-left py-3 px-4 text-primary-glow">Name</th>
                  <th className="text-left py-3 px-4 text-primary-glow">Role</th>
                  <th className="text-left py-3 px-4 text-primary-glow">TH</th>
                  <th className="text-left py-3 px-4 text-primary-glow">Trophies</th>
                  <th className="text-left py-3 px-4 text-primary-glow">Donated</th>
                  <th className="text-left py-3 px-4 text-primary-glow">Received</th>
                  <th className="text-left py-3 px-4 text-primary-glow">Action</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((m) => (
                  <tr key={m.tag} className="border-b border-glass-border hover:bg-glass-hover">
                    <td className="py-3 px-4 font-medium">{m.name}</td>
                    <td className="py-3 px-4">{m.role}</td>
                    <td className="py-3 px-4">{m.townHall}</td>
                    <td className="py-3 px-4">{m.trophies.toLocaleString()}</td>
                    <td className="py-3 px-4">{m.donations.toLocaleString()}</td>
                    <td className="py-3 px-4">{m.received.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <button
                        className="glass-panel-hover px-3 py-1 text-sm rounded"
                        onClick={() => setSelected({ tag: m.tag, name: m.name })}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {selected && (
          <PlayerDetailsModal
            player={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </div>
  );
}
