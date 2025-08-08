// components/GameLayout/GameLayout.js
import React from 'react';
import './GameLayout.css';

function GameLayout({ children }) {
  return (
    <div className="game-layout">
      {children}
    </div>
  );
}

export default GameLayout;
