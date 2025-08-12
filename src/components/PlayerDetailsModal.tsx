import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Chart } from 'chart.js/auto';
import { Home, Trophy, Star, ArrowDownUp } from 'lucide-react';

const BACKEND_URL = 'https://chimera-clan-sight.onrender.com';

const fetchPlayerPerformance = async (playerTag) => {
    if (!BACKEND_URL) throw new Error("Backend URL is not configured.");
    const tag = playerTag.replace('#', ''); // Remove '#' for the URL parameter
    const response = await fetch(`${BACKEND_URL}/api/player-performance/${tag}`);
    if (!response.ok) throw new Error("Network response was not ok");
    const result = await response.json();
    if (result.error) throw new Error(result.error);
    return result.data;
};

export const PlayerDetailsModal = ({ player, onClose }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const { data: performanceData, isLoading, error } = useQuery({
    queryKey: ['playerPerformance', player.tag],
    queryFn: () => fetchPlayerPerformance(player.tag),
    retry: false
  });

  useEffect(() => {
    if (chartRef.current && performanceData?.warHistory) {
      if (chartInstance.current) chartInstance.current.destroy();
      chartInstance.current = new Chart(chartRef.current, {
        type: 'line',
        data: {
          labels: performanceData.warHistory.map(h => h.war),
          datasets: [{
            label: 'War Score', data: performanceData.warHistory.map(h => h.score),
            borderColor: '#C62828', backgroundColor: 'rgba(198, 40, 40, 0.2)',
            fill: true, tension: 0.4
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [performanceData]);

  return (
    <div className="modal-overlay" style={{ display: 'flex' }} onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ margin: 0 }}>{player.name}</h2>
            <p style={{ margin: 0 }}>{player.role.replace('admin', 'Elder').replace('coLeader', 'Co-Leader')} - TH{player.townHallLevel}</p>
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="modal-profile">
            <h3>Profile Details</h3>
            <ul>
              <li><div><Home size={18}/><span>Town Hall</span></div><strong>{player.townHallLevel}</strong></li>
              <li><div><Trophy size={18}/><span>Trophies</span></div><strong>{player.trophies}</strong></li>
              {/* THE FIX: Use '|| 0' to prevent blank spaces if data is missing */}
              <li><div><Star size={18}/><span>War Stars</span></div><strong>{player.warStars || 0}</strong></li>
              <li><div><ArrowDownUp size={18}/><span>Donations</span></div><strong>{player.donations || 0}</strong></li>
            </ul>
            <div style={{marginTop: '1rem'}}>
                <h3>Average War Score</h3>
                {isLoading && <p>Calculating...</p>}
                {error && <p className="text-red-400">Could not load score.</p>}
                {performanceData && <div className="stat-value red-glow">{performanceData.averageWarScore.toFixed(0)}</div>}
            </div>
          </div>
          <div className="modal-graph">
            <h3>War Performance Over Time</h3>
            {isLoading && <p>Loading graph...</p>}
            {error && <p className="text-red-400">Could not load graph data.</p>}
            <canvas ref={chartRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};
