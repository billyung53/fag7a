// components/TeamScorePanel/TeamScorePanel.js
import React from 'react';
import './TeamScorePanel.css';

function TeamScorePanel({ team, teamName, score, isActive }) {
  return (
    <div className={`team-score-panel ${team} ${isActive ? 'active' : ''}`}>
      <div className="score-circle">{score}</div>
      <div className="team-name">{teamName}</div>
    </div>
  );
}

export default TeamScorePanel;
