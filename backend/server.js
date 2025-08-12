import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import Chart from 'chart.js/auto';
import { Home, Trophy, Star, ArrowDownUp } from 'lucide-react';

const BACKEND_URL = 'https://chimera-clan-sight.onrender.com';

type WarHistoryItem = { war: string; score: number };

const fetchPlayerPerformance = async (playerTag: string) => {
  if (!BACKEND_URL) throw new Error('Backend URL is not configured.');
  const tag = playerTag.replace('#', '');
  const res = await fetch(`${BACKEND_URL}/api/player-performance/${tag}`);
  if (!res.ok) throw new Error('Network response was not ok');
  const result = await res.json();
  if (result.error) throw new Error(result.error);
  return result.data as { averageWarScore: number; warHistory: WarHistoryItem[] };
};

export const PlayerDetailsModal: React.FC<{
  player: any;
  onClose: () => void;
}> = ({ player, onClose }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  const { data: performanceData, isLoading, error } = useQuery({
    queryKey: ['playerPerformance', player.tag],
    queryFn: () => fetchPlayerPerformance(player.tag),
    retry: false,
    enabled: !!player?.tag
  });

  useEffect(() => {
    if (!chartRef.current) return;
    if (!performanceData?.warHistory) return;

    // Destroy existing chart to avoid duplicates
    if (chartInstance.current) {
      try {
        chartInstance.current.destroy();
      } catch (e) {
        // ignore
      } finally {
        chartInstance.current = null;
      }
    }

    // Create a new line chart
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
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { maxRotation: 45, minRotation: 0 } },
          y: { beginAtZero: true }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        try {
          chartInstance.current.destroy();
        } catch (e) {
          // ignore
        } finally {
          chartInstance.current = null;
        }
      }
    };
  }, [performanceData]);

  // Safe display helpers
  const avgScore = performanceData?.averageWarScore ?? 0;
  const lastWar = player?.lastWarStars ?? 0;

  return (
    <div className="modal-overlay" style={{ display: 'flex' }} onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 900, width: '100%' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0 }}>{player?.name ?? 'Unknown Player'}</h2>
            <p style={{ margin: 0 }}>
              {(player?.role ?? 'member').replace('coLeader', 'Co-Leader').replace('admin', 'Admin')} - TH{player?.townHallLevel ?? 0}
            </p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close" style={{ fontSize: 24, lineHeight: 1 }}>&times;</button>
        </div>

        <div className="modal-body" style={{ display: 'flex', gap: 24, paddingTop: 16 }}>
          <div style={{ flex: '0 0 280px' }}>
            <div className="stats-grid" style={{ display: 'grid', gap: 12 }}>
              <div className="stat-card glass-panel p-4">
                <div className="stat-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Home />
                    <div>
                      <div className="stat-label">TH</div>
                      <div className="stat-value">{player?.townHallLevel ?? 0}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="stat-value">{player?.trophies ?? 0}</div>
                    <div className="stat-label">Trophies</div>
                  </div>
                </div>
              </div>

              <div className="stat-card glass-panel p-4">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Trophy />
                    <div>
                      <div className="stat-label">Last War Stars</div>
                      <div className="stat-value">{lastWar}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="stat-value">{avgScore ? Math.round(avgScore) : 0}</div>
                    <div className="stat-label">Avg War Score</div>
                  </div>
                </div>
              </div>

              <div className="stat-card glass-panel p-4">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Star />
                    <div>
                      <div className="stat-label">War History Count</div>
                      <div className="stat-value">{performanceData?.warHistory?.length ?? 0}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="stat-value">{performanceData?.warHistory?.slice(-1)[0]?.score ?? 0}</div>
                    <div className="stat-label">Latest WPS</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-graph" style={{ flex: 1, minHeight: 220 }}>
            <h3>War Performance Over Time</h3>
            {isLoading && <p>Loading graph...</p>}
            {error && <p className="text-red-400">Could not load graph data.</p>}
            <div style={{ height: 260 }}>
              <canvas ref={chartRef}></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
