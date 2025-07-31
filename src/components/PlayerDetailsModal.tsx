import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { Home, Trophy, Star, ArrowDownUp } from 'lucide-react';

export const PlayerDetailsModal = ({ player, onClose }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current && player.warHistory) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      chartInstance.current = new Chart(chartRef.current, {
        type: 'line',
        data: {
          labels: player.warHistory.map(h => h.war),
          datasets: [{
            label: 'War Score',
            data: player.warHistory.map(h => h.score),
            borderColor: '#C62828',
            backgroundColor: 'rgba(198, 40, 40, 0.2)',
            fill: true,
            tension: 0.4
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [player]);

  return (
    <div className="modal-overlay" style={{ display: 'flex' }} onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ margin: 0 }}>{player.name}</h2>
            <p style={{ margin: 0 }}>{player.role} - TH{player.townHallLevel}</p>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="modal-profile">
            <h3>Profile Details</h3>
            <ul>
              <li><div><Home size={18}/><span>Town Hall</span></div><strong>{player.townHallLevel}</strong></li>
              <li><div><Trophy size={18}/><span>Trophies</span></div><strong>{player.trophies}</strong></li>
              <li><div><Star size={18}/><span>War Stars</span></div><strong>{player.warStars}</strong></li>
              <li><div><ArrowDownUp size={18}/><span>Donations</span></div><strong>{player.donations}</strong></li>
            </ul>
          </div>
          <div className="modal-graph">
            <h3>Performance Over Time</h3>
            <canvas ref={chartRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};
