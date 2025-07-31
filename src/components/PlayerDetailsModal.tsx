import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { Home, Trophy, Star, ArrowDownUp } from 'lucide-react';

// Define the types for our props for better code quality
interface Player {
    name: string;
    role: string;
    townHallLevel: number;
    trophies: number;
    warStars: number;
    donations: number;
    warHistory: { war: string, score: number }[];
}

interface ModalProps {
    player: Player;
    onClose: () => void;
}

export const PlayerDetailsModal: React.FC<ModalProps> = ({ player, onClose }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);

    useEffect(() => {
        // This effect runs whenever the 'player' data changes
        if (chartRef.current) {
            // If a chart already exists, destroy it before creating a new one
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            // Create the new performance graph
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
                        tension: 0.4, // Makes the line smooth
                        pointBackgroundColor: '#fff',
                        pointBorderColor: '#C62828'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { 
                            beginAtZero: true, 
                            ticks: { color: '#B0BEC5' }, 
                            grid: { color: 'rgba(255, 255, 255, 0.1)' } 
                        },
                        x: { 
                            ticks: { color: '#B0BEC5' }, 
                            grid: { color: 'rgba(255, 255, 255, 0.1)' } 
                        }
                    },
                    plugins: { 
                        legend: { display: false } 
                    }
                }
            });
        }

        // Cleanup function to destroy the chart when the modal is closed
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [player]); // Re-run this effect only when the 'player' prop changes

    return (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2 id="modalPlayerName" style={{ margin: 0 }}>{player.name}</h2>
                        <p id="modalPlayerInfo" style={{ margin: 0 }}>
                            {player.role.replace('admin', 'Elder').replace('coLeader', 'Co-Leader')} - TH{player.townHallLevel}
                        </p>
                    </div>
                    <button id="modalCloseButton" className="modal-close" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <div className="modal-profile">
                        <h3>Profile Details</h3>
                        <ul>
                            <li><div><Home size={18} /><span>Town Hall Level</span></div><strong>{player.townHallLevel}</strong></li>
                            <li><div><Trophy size={18} /><span>Trophies</span></div><strong>{player.trophies}</strong></li>
                            <li><div><Star size={18} /><span>War Stars</span></div><strong>{player.warStars}</strong></li>
                            <li><div><ArrowDownUp size={18} /><span>Donations</span></div><strong>{player.donations}</strong></li>
                        </ul>
                    </div>
                    <div className="modal-graph">
                        <h3>War Performance Over Time</h3>
                        <canvas ref={chartRef}></canvas>
                    </div>
                </div>
            </div>
        </div>
    );
};
