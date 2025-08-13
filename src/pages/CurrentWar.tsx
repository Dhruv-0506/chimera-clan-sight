// src/pages/CurrentWar.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Sword, Users, Trophy, Clock, ShieldAlert } from 'lucide-react';

const BACKEND_URL = 'https://chimera-clan-sight.onrender.com';

// Parse CoC time "YYYYMMDDThhmmss.000Z" -> ms since epoch
const parseCoCTimeToMs = (t?: string | number | Date | null) => {
  if (!t) return NaN;
  if (typeof t === 'number') return t;
  if (t instanceof Date) return t.getTime();
  if (typeof t === 'string') {
    // try native
    const native = Date.parse(t);
    if (!Number.isNaN(native)) return native;
    // convert "20250820T164500.000Z" -> "2025-08-20T16:45:00Z"
    const m = t.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(?:\.\d+)?Z$/);
    if (m) {
      const iso = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`;
      const fixed = Date.parse(iso);
      if (!Number.isNaN(fixed)) return fixed;
    }
    return NaN;
  }
  return NaN;
};

const formatDistance = (futureMs: number, nowMs: number) => {
  const diff = futureMs - nowMs;
  if (diff <= 0) return 'War Ended';
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`;
};

const processAttacks = (war: any) => {
  if (!war?.clan?.members || !war?.opponent?.members) return [];

  const memberNameMap = new Map(war.clan.members.map((m: any) => [m.tag, m.name]));
  const opponentPositionMap = new Map(war.opponent.members.map((m: any) => [m.tag, m.mapPosition]));

  const allAttacks = war.clan.members.flatMap((member: any) =>
    (member.attacks || []).map((attack: any) => ({
      player: memberNameMap.get(attack.attackerTag) || 'Unknown Player',
      target: `#${opponentPositionMap.get(attack.defenderTag) ?? '?'}`,
      stars: attack.stars ?? 0,
      destruction: attack.destructionPercentage ?? 0,
      order: attack.order ?? 0
    }))
  );

  return allAttacks.sort((a: any, b: any) => (b.order ?? 0) - (a.order ?? 0));
};

export default function CurrentWar() {
  const [warData, setWarData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const fetchWarData = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/current-war`);
        const result = await res.json();
        if (result.error) throw new Error(result.error);
        if (!result.data) throw new Error('No data received from backend.');
        if (result.data.state === 'notInWar') {
          setError('The clan is not currently in a war.');
          setWarData(null);
          return;
        }
        setWarData(result.data);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch war data.');
        setWarData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWarData();

    // live countdown tick
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const timeLeft = useMemo(() => {
    if (!warData) return 'N/A';
    const state = String(warData.state || '').toLowerCase(); // preparation | inwar | warended
    const target = state === 'preparation'
      ? parseCoCTimeToMs(warData.startTime)
      : parseCoCTimeToMs(warData.endTime);
    if (Number.isNaN(target)) return 'N/A';
    return formatDistance(target, now);
  }, [warData, now]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Loading War Data...</h1>
          <p className="text-muted-foreground">Fetching live battle analytics.</p>
        </div>
      </div>
    );
  }

  if (error || !warData) {
    return (
      <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
        <div className="glass-panel p-8 text-center">
          <ShieldAlert className="mx-auto mb-4 text-primary-glow" size={48} />
          <h1 className="text-2xl font-bold text-foreground">War Data Unavailable</h1>
          <p className="text-muted-foreground">{error || 'Could not retrieve current war information.'}</p>
        </div>
      </div>
    );
  }

  const warStatus = (warData.state ?? '').replace(/([A-Z])/g, ' $1').replace(/^./, (s: string) => s.toUpperCase());
  const attacks = processAttacks(warData);

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Current War</h1>
          <p className="text-muted-foreground">Live battle analytics and performance tracking</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <Sword className="text-primary-glow" size={24} />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Status</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{warStatus}</div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="text-blue-400" size={24} />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Time Left</span>
            </div>
            <div className="text-2xl font-bold red-glow">{timeLeft}</div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="text-yellow-400" size={24} />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Stars</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              <span className="text-primary-glow">{warData.clan?.stars ?? 0}</span>
              <span className="text-muted-foreground"> - {warData.opponent?.stars ?? 0}</span>
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="text-purple-400" size={24} />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Destruction</span>
            </div>
            <div className="text-lg font-bold text-foreground">
              <span className="text-primary-glow">{Number(warData.clan?.destructionPercentage || 0).toFixed(2)}%</span>
              <span className="text-muted-foreground"> - {Number(warData.opponent?.destructionPercentage || 0).toFixed(2)}%</span>
            </div>
          </div>
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
                {attacks.map((attack: any, index: number) => (
                  <tr key={index} className="border-b border-glass-border hover:bg-glass-hover transition-colors">
                    <td className="py-3 px-4 text-foreground font-medium">{attack.player}</td>
                    <td className="py-3 px-4 text-muted-foreground">{attack.target}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className={`w-4 h-4 ${i < (attack.stars ?? 0) ? 'text-yellow-400 drop-shadow-glow' : 'text-muted-foreground/30'}`}>
                            ⭐
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-primary-glow font-semibold">{attack.destruction}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
