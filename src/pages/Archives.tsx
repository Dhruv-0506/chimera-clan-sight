import { useQuery } from "@tanstack/react-query";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const fetchWarLog = async () => {
    if (!BACKEND_URL) throw new Error("Backend URL is not configured.");
    const response = await fetch(`${BACKEND_URL}/api/war-log`);
    const result = await response.json();
    if (result.error) throw new Error(result.error);
    return result.data.items.filter((war: any) => war.clan.attacks !== undefined);
};

export default function Archives() {
  const { data: recentWars, isLoading, error } = useQuery({ queryKey: ['warLog'], queryFn: fetchWarLog });

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">War Archives</h1>
          <p className="text-muted-foreground">Historical battle records</p>
        </div>
        
        {isLoading && <p className="text-center text-muted-foreground">Loading Archives...</p>}
        {error && <p className="text-center text-red-400">Error: {error.message}</p>}

        {recentWars && (
          <div className="glass-panel p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-glass-border">
                  <th className="text-left py-3 px-4 text-primary-glow font-semibold">Opponent</th>
                  <th className="text-left py-3 px-4 text-primary-glow font-semibold">Result</th>
                </tr>
              </thead>
              <tbody>
                {recentWars.map((war: any, index: number) => (
                  <tr key={index} className="border-b border-glass-border">
                    <td className="py-3 px-4 text-foreground font-medium">{war.opponent.name}</td>
                    <td className={`py-3 px-4 font-bold ${war.result === 'win' ? 'text-green-400' : 'text-red-400'}`}>{war.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
