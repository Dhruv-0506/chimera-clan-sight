// src/components/PlayerCard.tsx

import { Crown } from 'lucide-react';

export const PlayerCard = ({ player, onClick }) => (
  <div 
    className="player-card"
    onClick={() => onClick(player)}
  >
    <div className="player-info">
      <Crown size={20} title={player.role} />
      <div>
        <h3>{player.name}</h3>
        <span>TH{player.townHallLevel}</span>
      </div>
    </div>
    <div className="player-score">
      <div className="stat-value red-glow">{Math.round(player.averageWarScore)}</div>
      <p>Avg War Score</p>
    </div>
  </div>
);
