// src/components/PlayerDetailsModal.jsx
import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import Chart from 'chart.js/auto';
import { Home, Trophy, Star, Zap } from 'lucide-react';

const BACKEND_URL = 'https://chimera-clan-sight.onrender.com';

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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">{player.name}</h2>
          <button className="text-white text-2xl" onClick={onClose}>&times;</button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-white">
          <div><span className="text-sm text-gray-400">TH</span><br />{player.townHallLevel ?? 0}</div>
          <div><span className="text-sm text-gray-400">Trophies</span><br />{player.trophies ?? 0}</div>
          <div><span className="text-sm text-gray-400">Avg Score</span><br />{Math.round(avgScore)}</div>
          <div><span className="text-sm text-gray-400">Donated</span><br />{player.donations ?? 0}</div>
        </div>

        <div className="mb-2 text-white">
          <h3 className="text-lg font-semibold">War History</h3>
          {isLoading && <p>Loading…</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!isLoading && !error && (
            <div className="h-48">
              <canvas ref={chartRef}></canvas>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
