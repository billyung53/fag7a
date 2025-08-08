// components/GameGrid/GameGrid.js
import React from 'react';
import './GameGrid.css';

function GameGrid({ children }) {
  return (
    <div className="game-grid">
      {children}
    </div>
  );
}

export default GameGrid;
