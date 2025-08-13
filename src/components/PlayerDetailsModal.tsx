// src/components/PlayerDetailsModal.jsx
import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import Chart from 'chart.js/auto';
import { Home, Trophy, Star, ShieldAlert } from 'lucide-react';

const BACKEND_URL = 'https://chimera-clan-sight.onrender.com';

const fetchPlayerPerformance = async (playerTag) => {
  const tag = playerTag.replace('#', '');
  const res = await fetch(`${BACKEND_URL}/api/player-performance/${tag}`);
  if (!res.ok) throw new Error('Network response was not ok');
  const result = await res.json();
  if (result.error) throw new Error(result.error);
  return result.data;
};

export default function PlayerDetailsModal({ player, onClose }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const { data: performanceData, isLoading, error } = useQuery({
    queryKey: ['playerPerformance', player.tag],
    queryFn: () => fetchPlayerPerformance(player.tag),
    retry: false,
    enabled: !!player?.tag,
  });

  useEffect(() => {
    if (!chartRef.current || !performanceData?.warHistory) return;
    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: performanceData.warHistory.map(h => h.war),
        datasets: [
          {
            label: 'War Score',
            data: performanceData.warHistory.map(h => h.score),
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
          x: { ticks: { maxRotation: 45, minRotation: 0 } },
          y: { beginAtZero: true },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [performanceData]);

  const avgScore = performanceData?.averageWarScore ?? 0;
  const lastWar = player?.lastWarStars ?? 0;

  return (
    <div className="modal-overlay" style={{ display: 'flex' }} onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 900, width: '100%' }}>
        <div className="modal-header">
          <div>
            <h2>{player?.name ?? 'Unknown Player'}</h2>
            <p>
              {(player?.role ?? 'member').replace('coLeader', 'Co-Leader').replace('admin', 'Elder')} - TH{player?.townHallLevel ?? 0}
            </p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>

        <div className="modal-body">
          <div className="modal-profile">
            <div className="stats-grid">
              <div className="stat-card glass-panel p-4">
                <Home className="text-blue-400" size={24} />
                <div>
                  <div className="stat-label">TH</div>
                  <div className="stat-value">{player?.townHallLevel ?? 0}</div>
                </div>
              </div>

              <div className="stat-card glass-panel p-4">
                <Trophy className="text-yellow-400" size={24} />
                <div>
                  <div className="stat-label">Trophies</div>
                  <div className="stat-value">{player?.trophies ?? 0}</div>
                </div>
              </div>

              <div className="stat-card glass-panel p-4">
                <Star className="text-red-400" size={24} />
                <div>
                  <div className="stat-label">Last War Stars</div>
                  <div className="stat-value">{lastWar}</div>
                </div>
              </div>

              <div className="stat-card glass-panel p-4">
                <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-xs font-bold text-primary-glow">%</div>
                <div>
                  <div className="stat-label">Avg War Score</div>
                  <div className="stat-value red-glow">{Math.round(avgScore)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-graph">
            <h3>War Performance Over Time</h3>
            {isLoading && <p>Loading graph...</p>}
            {error && <p className="text-red-400">Could not load graph data.</p>}
            <div className="chart-container">
              <canvas ref={chartRef}></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
