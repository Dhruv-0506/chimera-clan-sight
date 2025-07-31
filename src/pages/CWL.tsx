import { useQuery } from "@tanstack/react-query";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const fetchCwlLog = async () => {
    if (!BACKEND_URL) throw new Error("Backend URL is not configured.");
    const response = await fetch(`${BACKEND_URL}/api/war-log`);
    const result = await response.json();
    if (result.error) throw new Error(result.error);
    return result.data.items.filter((war: any) => war.clan.attacks === undefined);
};

export default function CWL() {
  const { data: cwlWars, isLoading, error } = useQuery({ queryKey: ['cwlLog'], queryFn: fetchCwlLog });

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Clan War League Archives</h1>
          <p className="text-muted-foreground">Historical CWL performance</p>
        </div>

        {isLoading && <p className="text-center text-muted-foreground">Loading CWL Archives...</p>}
        {error && <p className="text-center text-red-400">Error: {error.message}</p>}

        {cwlWars && cwlWars.length > 0 ? (
            <div className="glass-panel p-6">
                {cwlWars.map((match: any, index: number) => (
                    <div key={index} className="p-4 border-b border-glass-border">
                        <p className="font-medium">{match.opponent.name}</p>
                        <p className={`font-bold ${match.result === 'win' ? 'text-green-400' : 'text-red-400'}`}>{match.result}</p>
                    </div>
                ))}
            </div>
        ) : (
            !isLoading && <div className="glass-panel p-6 text-center text-muted-foreground">No recent CWL wars found in the log.</div>
        )}
      </div>
    </div>
  );
}
