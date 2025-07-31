
import { useQuery } from "@tanstack/react-query";
// Import icons as needed, e.g., import { Medal, TrendingUp } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const fetchCWL = async () => {
    // Note: The CWL endpoint is often empty unless a CWL war is active.
    // We need a separate endpoint for this in the backend if needed.
    // For now, let's use the war log as a placeholder.
    if (!BACKEND_URL) throw new Error("Backend URL is not configured.");
    const response = await fetch(`${BACKEND_URL}/api/war-log`);
    if (!response.ok) throw new Error("Network response was not ok");
    const result = await response.json();
    if (result.error) throw new Error(result.error);
    // Filter for CWL wars from the log
    return result.data.items.filter((war: any) => war.clan.attacks === undefined);
};

export default function CWL() {
  const { data: cwlWars, isLoading, error } = useQuery({
    queryKey: ['cwlData'],
    queryFn: fetchCWL
  });

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Clan War League</h1>
          <p className="text-muted-foreground">Championship performance analytics and standings</p>
        </div>
        
        {isLoading && <p className="text-center text-muted-foreground">Loading CWL Data...</p>}
        {error && <p className="text-center text-red-400">Error: {error.message}</p>}

        {cwlWars && cwlWars.length > 0 ? (
            <div className="glass-panel p-6">
                <h2 className="text-2xl font-semibold text-foreground mb-6">Recent CWL Match Results</h2>
                <div className="space-y-4">
                    {cwlWars.map((match: any, index: number) => (
                        <div key={index} className="glass-panel p-4">
                            <div className="flex items-center justify-between">
                                <p className="font-medium">{match.opponent.name}</p>
                                <p className={match.result === 'win' ? 'text-green-400' : 'text-red-400'}>{match.result}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {match.clan.stars} ⭐ - {match.opponent.stars} ⭐
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        ) : (
            !isLoading && <div className="glass-panel p-6 text-center text-muted-foreground">No recent CWL wars found in the log.</div>
        )}
      </div>
    </div>
  );
}
