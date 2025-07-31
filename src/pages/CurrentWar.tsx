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
    retry: false
  });

  const renderContent = () => {
    if (isLoading) return <p className="text-center text-muted-foreground">Loading Current War Data...</p>;
    if (error) return <div className="glass-panel p-6 text-center text-muted-foreground">{error.message}</div>;
    
    if (warData && warData.state !== 'notInWar') {
      return (
        <div className="glass-panel p-6">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Recent Attacks</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-glass-border">
                  <th className="text-left py-3 px-4 text-primary-glow font-semibold">Player</th>
                  <th className="text-left py-3 px-4 text-primary-glow font-semibold">Stars</th>
                  <th className="text-left py-3 px-4 text-primary-glow font-semibold">Destruction</th>
                  <th className="text-left py-3 px-4 text-primary-glow font-semibold">Target</th>
                </tr>
              </thead>
              <tbody>
                {warData.clan.members.sort((a,b) => a.mapPosition - b.mapPosition).map((member) => (
                    // This creates a fragment for each player's attacks
                    <>
                        {member.attacks && member.attacks.length > 0 ? (
                            member.attacks.map((attack, index) => (
                                <tr key={`${member.tag}-${index}`} className="border-b border-glass-border hover:bg-glass-hover">
                                    {/* The player name only appears on the FIRST attack row */}
                                    {index === 0 && (
                                        <td rowSpan={member.attacks.length} className="py-3 px-4 text-foreground font-medium align-top">
                                            {member.name}
                                        </td>
                                    )}
                                    <td className="py-3 px-4 text-yellow-400">{'⭐'.repeat(attack.stars)}</td>
                                    <td className="py-3 px-4 text-primary-glow font-semibold">{attack.destructionPercentage}%</td>
                                    <td className="py-3 px-4 text-muted-foreground">on #{attack.defenderTag.slice(-4)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr className="border-b border-glass-border hover:bg-glass-hover">
                                <td className="py-3 px-4 text-foreground font-medium">{member.name}</td>
                                <td colSpan={3} className="py-3 px-4 text-muted-foreground">No attacks yet</td>
                            </tr>
                        )}
                    </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
