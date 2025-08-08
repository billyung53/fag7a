// components/HelloPage/TeamScorePanel.js
import React from 'react';

function TeamScorePanel({ team, teamName, score, isActive }) {
  return (
    <div className={`team-score ${team} ${isActive ? 'active' : ''}`}>
      <div className="score-circle">{score}</div>
      <h3>{teamName}</h3>
    </div>
  );
}

export default TeamScorePanel;