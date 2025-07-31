import { useQuery } from "@tanstack/react-query";
import { Sword, Clock, Trophy, Users } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const fetchCurrentWar = async () => {
    if (!BACKEND_URL) throw new Error("Backend URL is not configured.");
    const response = await fetch(`${BACKEND_URL}/api/current-war`);
    const result = await response.json();
    if (result.error) throw new Error(result.error);
    return result.data;
};

export default function CurrentWar() {
  const { data: warData, isLoading, error } = useQuery({
    queryKey: ['currentWar'],
    queryFn: fetchCurrentWar,
    retry: false // Don't retry on 404 "not in war" errors
  });

  const renderContent = () => {
    if (isLoading) return <p className="text-center text-muted-foreground">Loading Current War Data...</p>;
    if (error) return <div className="glass-panel p-6 text-center text-muted-foreground">{error.message}</div>;
    
    if (warData && warData.state !== 'notInWar') {
      return (
        <>
          <div className="glass-panel p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-6">Recent Attacks</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-glass-border">
                    <th className="text-left py-3 px-4 text-primary-glow font-semibold">Player</th>
                    <th className="text-left py-3 px-4 text-primary-glow font-semibold">Attacks</th>
                  </tr>
                </thead>
                <tbody>
                  {warData.clan.members.sort((a,b) => a.mapPosition - b.mapPosition).map((member) => (
                    <tr key={member.tag} className="border-b border-glass-border">
                      <td className="py-3 px-4 text-foreground font-medium">{member.name}</td>
                      <td className="py-3 px-4">
                        {member.attacks ? (
                          <div className="flex flex-col gap-2">
                            {member.attacks.map((attack, index) => (
                              <div key={index} className="flex items-center gap-4">
                                <span className="text-yellow-400">{'⭐'.repeat(attack.stars)}</span>
                                <span className="text-primary-glow font-semibold">{attack.destructionPercentage}%</span>
                                <span className="text-muted-foreground">on #{attack.defenderTag.slice(-4)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No attacks yet</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      );
    }
    return <div className="glass-panel p-6 text-center text-muted-foreground">No active clan war found.</div>;
  };

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Current War</h1>
          <p className="text-muted-foreground">Live battle analytics and performance tracking</p>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}
