import { useQuery } from "@tanstack/react-query";
// Import icons as needed

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const fetchWarLog = async () => {
    if (!BACKEND_URL) throw new Error("Backend URL is not configured.");
    const response = await fetch(`${BACKEND_URL}/api/war-log`);
    if (!response.ok) throw new Error("Network response was not ok");
    const result = await response.json();
    if (result.error) throw new Error(result.error);
    // Filter for regular wars
    return result.data.items.filter((war: any) => war.clan.attacks !== undefined);
};

export default function Archives() {
  const { data: recentWars, isLoading, error } = useQuery({
    queryKey: ['warLog'],
    queryFn: fetchWarLog
  });

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">War Archives</h1>
          <p className="text-muted-foreground">Historical battle records and performance analysis</p>
        </div>
        
        {isLoading && <p className="text-center text-muted-foreground">Loading War Archives...</p>}
        {error && <p className="text-center text-red-400">Error: {error.message}</p>}

        {recentWars && (
          <div className="glass-panel p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-6">Recent Wars</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-glass-border">
                    <th className="text-left py-3 px-4 text-primary-glow font-semibold">Opponent</th>
                    <th className="text-left py-3 px-4 text-primary-glow font-semibold">Result</th>
                    <th className="text-left py-3 px-4 text-primary-glow font-semibold">Stars</th>
                    <th className="text-left py-3 px-4 text-primary-glow font-semibold">Destruction</th>
                  </tr>
                </thead>
                <tbody>
                  {recentWars.map((war: any, index: number) => (
                    <tr key={index} className="border-b border-glass-border hover:bg-glass-hover">
                      <td className="py-3 px-4 text-foreground font-medium">{war.opponent.name}</td>
                      <td className={`py-3 px-4 font-bold ${war.result === 'win' ? 'text-green-400' : 'text-red-400'}`}>{war.result}</td>
                      <td className="py-3 px-4 text-primary-glow font-semibold">{war.clan.stars} - {war.opponent.stars}</td>
                      <td className="py-3 px-4 text-primary-glow font-semibold">{war.clan.destructionPercentage.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
