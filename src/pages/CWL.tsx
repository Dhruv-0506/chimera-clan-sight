// src/pages/CWL.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Medal, TrendingUp, Users, Trophy, ShieldAlert } from "lucide-react";

const CLAN_TAG = "#2G8LRGU2Q";
const API_URL = 'https://chimera-clan-sight.onrender.com';

/* ---------- helpers ---------- */

// CoC time "YYYYMMDDThhmmss.000Z" -> Date
const parseCoCTime = (t?: string | null) => {
  if (!t) return null;
  const native = Date.parse(t);
  if (!Number.isNaN(native)) return new Date(native);
  const m = t.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(?:\.\d+)?Z$/);
  if (m) {
    return new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`);
  }
  return null;
};

// Aggregate standings from full CWL war list
const computeStandings = (wars: any[]) => {
  const table = new Map<string, { tag: string; name: string; stars: number; destruction: number }>();

  const add = (team: any) => {
    const prev = table.get(team.tag) || { tag: team.tag, name: team.name, stars: 0, destruction: 0 };
    table.set(team.tag, {
      tag: team.tag,
      name: team.name,
      stars: prev.stars + (team.stars || 0),
      destruction: prev.destruction + (team.destructionPercentage || 0)
    });
  };

  for (const w of wars) {
    if (!w?.clan || !w?.opponent) continue;
    add(w.clan);
    add(w.opponent);
  }

  return Array.from(table.values()).sort((a, b) => {
    if (b.stars !== a.stars) return b.stars - a.stars;
    return b.destruction - a.destruction;
  });
};

const toTitle = (s: string) => s.toLowerCase().replace(/^(.)/, (_, c) => c.toUpperCase());

/* ---------- component ---------- */
export default function CWL() {
  const [data, setData] = useState<{
    season: string;
    rounds: any[];
    ourWars: any[];
    allWars: any[];
    leagueName: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // 1) group + clan info
        const [groupRes, clanRes] = await Promise.all([
          fetch(`${API_URL}/api/cwl-group`),
          fetch(`${API_URL}/api/clan-info`)
        ]);

        const groupJson = await groupRes.json();
        const clanJson  = await clanRes.json();

        if (groupJson.error) throw new Error(groupJson.error);
        if (!groupJson.data) throw new Error('CWL group data unavailable (not currently in CWL?).');

        const group = groupJson.data; // { season, clans, rounds }
        const leagueName = clanJson?.data?.warLeague?.name || 'Unknown League';

        // 2) fetch ALL warTags listed in rounds
        const tags = (group.rounds || [])
          .flatMap((r: any) => r.warTags || [])
          .filter((t: string) => t && t !== '#0');

        const uniqueTags = Array.from(new Set(tags));
        const warFetches = uniqueTags.map(async (tag: string) => {
          const res = await fetch(`${API_URL}/api/cwl-war/${encodeURIComponent(tag)}`);
          const json = await res.json();
          return json.data || null;
        });

        const allWars = (await Promise.all(warFetches)).filter(Boolean);

        // 3) our clan’s wars (one per day)
        const ourWars = allWars
          .filter((w: any) => w?.clan?.tag === CLAN_TAG || w?.opponent?.tag === CLAN_TAG)
          .sort((a: any, b: any) => {
            const da = parseCoCTime(a?.endTime)?.getTime() || 0;
            const db = parseCoCTime(b?.endTime)?.getTime() || 0;
            return da - db;
          });

        setData({
          season: group.season,
          rounds: group.rounds || [],
          ourWars,
          allWars,
          leagueName
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load CWL data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, []);

  const view = useMemo(() => {
    if (!data) return null;

    // standings & position
    const standings = computeStandings(data.allWars);
    const totalClans = standings.length || (data as any).clans?.length || 8;
    const ourIndex = standings.findIndex(s => s.tag === CLAN_TAG);
    const ourPosition = ourIndex === -1 ? null : (ourIndex + 1);

    // matches for UI
    const matches = data.ourWars.map((war: any, idx: number) => {
      const isOurClan = war.clan?.tag === CLAN_TAG;
      const us = isOurClan ? war.clan : war.opponent;
      const them = isOurClan ? war.opponent : war.clan;

      const stars = `${us?.stars ?? 0}-${them?.stars ?? 0}`;
      const destr = `${(us?.destructionPercentage ?? 0).toFixed(1)}% - ${(them?.destructionPercentage ?? 0).toFixed(1)}%`;
      const result =
        (us?.stars ?? 0) > (them?.stars ?? 0)
          ? 'Win'
          : (us?.stars ?? 0) < (them?.stars ?? 0)
            ? 'Loss'
            : ((us?.destructionPercentage ?? 0) > (them?.destructionPercentage ?? 0) ? 'Win' :
               (us?.destructionPercentage ?? 0) < (them?.destructionPercentage ?? 0) ? 'Loss' : 'Draw');

      return {
        day: idx + 1,
        opponent: them?.name || 'Unknown Opponent',
        result,
        stars,
        destruction: destr
      };
    }).reverse(); // latest first like your UI

    // top performers across our CWL wars
    const playerStats = new Map<string, { name: string; stars: number; attacks: number; destruction: number }>();
    for (const war of data.ourWars) {
      const isOurClan = war?.clan?.tag === CLAN_TAG;
      const ourSide = isOurClan ? war?.clan : war?.opponent;
      const theirSide = isOurClan ? war?.opponent : war?.clan;
      if (!ourSide?.members || !theirSide?.members) continue;

      for (const m of ourSide.members) {
        const ps = playerStats.get(m.tag) || { name: m.name, stars: 0, attacks: 0, destruction: 0 };
        const atks = m.attacks || [];
        ps.stars += atks.reduce((s: number, a: any) => s + (a.stars || 0), 0);
        ps.attacks += atks.length;
        ps.destruction += atks.reduce((s: number, a: any) => s + (a.destructionPercentage || 0), 0);
        playerStats.set(m.tag, ps);
      }
    }

    const topPerformers = Array.from(playerStats.values())
      .sort((a, b) => b.stars - a.stars)
      .slice(0, 4)
      .map(p => ({
        name: p.name,
        stars: p.stars,
        averageDestruction: p.attacks ? (p.destruction / p.attacks).toFixed(1) : '0.0'
      }));

    const ourTotals = standings.find(s => s.tag === CLAN_TAG);
    const roundText = `Day ${Math.max(1, data.ourWars.length)} of ${data.rounds.length}`;

    return {
      league: data.leagueName,
      position: ourPosition,
      totalClans,
      stars: ourTotals?.stars ?? 0,
      roundText,
      matches,
      topPerformers
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Loading CWL Data...</h1>
          <p className="text-muted-foreground">Analyzing championship performance.</p>
        </div>
      </div>
    );
  }

  if (error || !data || !view) {
    return (
      <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
        <div className="glass-panel p-8 text-center">
          <ShieldAlert className="mx-auto mb-4 text-primary-glow" size={48} />
          <h1 className="text-2xl font-bold text-foreground">CWL Data Unavailable</h1>
          <p className="text-muted-foreground">{error || "Could not retrieve CWL information."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Clan War League</h1>
          <p className="text-muted-foreground">Championship performance analytics and standings</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <Medal className="text-yellow-400" size={24} />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">League</span>
            </div>
            <div className="text-lg font-bold text-foreground">{view.league}</div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="text-green-400" size={24} />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Position</span>
            </div>
            <div className="text-2xl font-bold red-glow">
              {view.position ? `#${view.position}` : '—'}
              <span className="text-muted-foreground text-lg">/{view.totalClans}</span>
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="text-blue-400" size={24} />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Total Stars</span>
            </div>
            <div className="text-2xl font-bold text-primary-glow">{view.stars}</div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="text-purple-400" size={24} />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Progress</span>
            </div>
            <div className="text-lg font-bold text-foreground">{view.roundText}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Match Results */}
          <div className="glass-panel p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-6">Match Results</h2>
            <div className="space-y-4">
              {view.matches.map((match, index) => (
                <div key={index} className="glass-panel p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-muted-foreground">Day {match.day}</div>
                      <div className="text-foreground font-medium">{match.opponent}</div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        match.result === "Win"
                          ? "bg-green-500/20 text-green-400"
                          : match.result === "Loss"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {match.result}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Stars: </span>
                      <span className="text-primary-glow font-semibold">{match.stars}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Destruction: </span>
                      <span className="text-primary-glow font-semibold">{match.destruction}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performers */}
          <div className="glass-panel p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-6">Top Performers</h2>
            <div className="space-y-4">
              {view.topPerformers.map((performer, index) => (
                <div key={index} className="glass-panel p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary-glow">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="text-foreground font-semibold">{performer.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {performer.averageDestruction}% avg destruction
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary-glow">{performer.stars}</div>
                      <div className="text-xs text-muted-foreground">stars</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
