import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import Chart from 'chart.js/auto';
import { Home, Trophy, Star } from 'lucide-react';

const BACKEND_URL = 'https://chimera-clan-sight.onrender.com';

// Define clear types for your data
type WarHistoryItem = {
  war: string;
  score: number;
};

type PlayerPerformanceData = {
  averageWarScore: number;
  warHistory: WarHistoryItem[];
};

// Async function to fetch player data
const fetchPlayerPerformance = async (playerTag: string): Promise<PlayerPerformanceData> => {
  if (!BACKEND_URL) throw new Error('Backend URL is not configured.');
  const tag = playerTag.replace('#', '');
  const res = await fetch(`${BACKEND_URL}/api/player-performance/${tag}`);
  if (!res.ok) throw new Error('Network response was not ok');
  const result = await res.json();
  if (result.error) throw new Error(result.error);
  return result.data;
};

// Define props for the component
interface PlayerDetailsModalProps {
  player: any; // Consider defining a stricter type for the player object
  onClose: () => void;
}

export const PlayerDetailsModal: React.FC<PlayerDetailsModalProps> = ({ player, onClose }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  const { data: performanceData, isLoading, error } = useQuery<PlayerPerformanceData>({
    queryKey: ['playerPerformance', player.tag],
    queryFn: () => fetchPlayerPerformance(player.tag),
    enabled: !!player?.tag, // Only run query if player tag exists
    retry: false,
  });

  useEffect(() => {
    if (!chartRef.current || !performanceData?.warHistory) {
      return;
    }

    // Destroy the previous chart instance before creating a new one
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create the new line chart
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
          x: { ticks: { maxRotation: 45, minRotation: 0, color: '#A1A1AA' } },
          y: { beginAtZero: true, ticks: { color: '#A1A1AA' } },
        },
        plugins: {
          legend: {
            labels: {
              color: '#FFFFFF'
            }
          }
        }
      },
    });

    // Cleanup function to destroy chart on component unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [performanceData]);

  const avgScore = performanceData?.averageWarScore ?? 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{player?.name ?? 'Unknown Player'}</h2>
            <p>
              {player?.role?.replace('coLeader', 'Co-Leader')?.replace('admin', 'Elder') ?? 'Member'} - TH{player?.townHallLevel ?? 0}
            </p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>

        <div className="modal-body">
          <div className="modal-profile">
            <div className="stats-grid">
              <div className="stat-card">
                <Home />
                <div>
                  <div className="stat-label">Town Hall</div>
                  <div className="stat-value">{player?.townHallLevel ?? 0}</div>
                </div>
              </div>
              <div className="stat-card">
                <Trophy />
                <div>
                  <div className="stat-label">Trophies</div>
                  <div className="stat-value">{player?.trophies ?? 0}</div>
                </div>
              </div>
              <div className="stat-card">
                <Star />
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
};
