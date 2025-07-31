import { useQuery } from "@tanstack/react-query";
import { Sword, Clock, Trophy, Users } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const fetchCurrentWar = async () => {
    if (!BACKEND_URL) throw new Error("Backend URL is not configured.");
    const response = await fetch(`${BACKEND_URL}/api/current-war`);
    const result = await response.json();
    if (!response.ok || result.error) throw new Error(result.error || "Network response was not ok");
    return result.data;
};

export default function CurrentWar() {
  const { data: warData, isLoading, error } = useQuery({
    queryKey: ['currentWar'],
    queryFn: fetchCurrentWar
  });

  const renderContent = () => {
    if (isLoading) return <p className="text-center text-muted-foreground">Loading Current War Data...</p>;
    if (error) {
        // Handle "no active war" gracefully
        if (error.message.includes("No active war found")) {
            return <div className="glass-panel p-6 text-center text-muted-foreground">No active war found.</div>;
        }
        return <p className="text-center text-red-400">Error: {error.message}</p>;
    }
    
    if (warData && warData.state !== 'notInWar') {
      return (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="glass-panel p-6">
                <div className="flex items-center justify-between mb-4"><Sword className="text-primary-glow" size={24} /><span className="text-xs text-muted-foreground uppercase tracking-wide">Status</span></div>
                <div className="text-2xl font-bold text-foreground">{warData.state}</div>
            </div>
            {/* You can add the other stat cards here if you wish */}
          </div>
          <div className="glass-panel p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-6">Recent Attacks</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-glass-border">
                    <th className="text-left py-3 px-4 text-primary-glow font-semibold">Player</th>
                    <th className="text-left py-3 px-4 text-primary-glow font-semibold">Target</th>
                    <th className="text-left py-3 px-4 text-primary-glow font-semibold">Stars</th>
                    <th className="text-left py-3 px-4 text-primary-glow font-semibold">Destruction</th>
                  </tr>
                </thead>
                <tbody>
                  {warData.clan.members.filter((m) => m.attacks).flatMap((member) =>
                    member.attacks.map((attack, index) => (
                      <tr key={`${member.tag}-${index}`} className="border-b border-glass-border hover:bg-glass-hover">
                        <td className="py-3 px-4 text-foreground font-medium">{member.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">#{attack.defenderTag.slice(-4)}</td>
                        <td className="py-3 px-4 text-yellow-400">{'⭐'.repeat(attack.stars)}</td>
                        <td className="py-3 px-4 text-primary-glow font-semibold">{attack.destructionPercentage}%</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      );
    }
    return <div className="glass-panel p-6 text-center text-muted-foreground">War data not available or war has not started.</div>;
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
