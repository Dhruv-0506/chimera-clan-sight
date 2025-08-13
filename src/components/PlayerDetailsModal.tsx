// src/components/PlayerDetailsModal.jsx
import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import Chart from 'chart.js/auto';
import { Home, Trophy, Star, Medal, Users, Shield, TrendingUp, Zap } from 'lucide-react';

const BACKEND_URL = 'https://chimera-clan-sight.onrender.com';

/* ---------- helpers ---------- */
const parseCoCTimeMs = (t) => {
  if (!t) return NaN;
  if (typeof t === 'number') return t;
  if (t instanceof Date) return t.getTime();
  if (typeof t === 'string') {
    const m = t.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(?:\.\d+)?Z$/);
    if (m) return Date.parse(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`);
    return Date.parse(t);
  }
  return NaN;
};

const fetchPlayerPerformance = async (playerTag) => {
  const tag = playerTag.replace('#', '');
  const res = await fetch(`${BACKEND_URL}/api/player-performance/${tag}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.data;
};

export default function PlayerDetailsModal({ player, onClose }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['playerPerformance', player?.tag],
    queryFn: () => fetchPlayerPerformance(player.tag),
    enabled: !!player?.tag,
    retry: false,
  });

  useEffect(() => {
    if (!chartRef.current || !data?.warHistory) return;
    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: data.warHistory.map(h => h.war),
        datasets: [
          {
            label: 'War Score',
            data: data.warHistory.map(h => h.score),
            borderColor: '#C62828',
            backgroundColor: 'rgba(198, 40, 40, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { maxRotation: 45, color: '#A1A1AA' } },
          y: { beginAtZero: true, ticks: { color: '#A1A1AA' } },
        },
        plugins: { legend: { labels: { color: '#FFFFFF' } } },
      },
    });

    return () => chartInstance.current?.destroy();
  }, [data]);

  if (!player) return null;

  const avgScore = data?.averageWarScore ?? 0;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="glass-panel p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">{player.name}</h2>
            <p className="text-muted-foreground">
              {player.role?.replace('coLeader', 'Co-Leader')?.replace('admin', 'Elder') ?? 'Member'} - TH{player.townHallLevel ?? 0}
            </p>
          </div>
          <button className="text-2xl font-bold" onClick={onClose}>&times;</button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="stat-card glass-panel p-4 flex items-center gap-3">
            <Home size={24} className="text-blue-400"/>
            <div>
              <div className="text-xs uppercase tracking-wider">Town Hall</div>
              <div className="text-xl font-bold">{player.townHallLevel ?? 0}</div>
            </div>
          </div>

          <div className="stat-card glass-panel p-4 flex items-center gap-3">
            <Trophy size={24} className="text-yellow-400"/>
            <div>
              <div className="text-xs uppercase tracking-wider">Trophies</div>
              <div className="text-xl font-bold">{player.trophies?.toLocaleString() ?? 0}</div>
            </div>
          </div>

          <div className="stat-card glass-panel p-4 flex items-center gap-3">
            <Star size={24} className="text-red-400"/>
            <div>
              <div className="text-xs uppercase tracking-wider">Avg War Score</div>
              <div className="text-xl font-bold">{Math.round(avgScore)}</div>
            </div>
          </div>

          <div className="stat-card glass-panel p-4 flex items-center gap-3">
            <Zap size={24} className="text-purple-400"/>
            <div>
              <div className="text-xs uppercase tracking-wider">Donations</div>
              <div className="text-xl font-bold">{player.donations ?? 0}</div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">War Performance Over Time</h3>
          {isLoading && <p>Loading graph...</p>}
          {error && <p className="text-red-400">{error}</p>}
          {!isLoading && !error && (
            <div className="h-60">
              <canvas ref={chartRef}></canvas>
            </div>
          )}
        </div>

        {/* Extra summary */}
        {data?.warHistory?.length ? (
          <div className="glass-panel p-4">
            <h3 className="text-lg font-semibold mb-2">Summary</h3>
            <ul className="space-y-1 text-sm">
              <li>Total wars: {data.warHistory.length}</li>
              <li>Latest score: {Math.round(data.warHistory[data.warHistory.length - 1]?.score ?? 0)}</li>
              <li>Trend: <TrendingUp size={16} className="inline-block ml-1" /></li>
            </ul>
          </div>
        ) : (
          <p className="text-muted-foreground text-center">No war history yet.</p>
        )}
      </div>
    </div>
  );
}
