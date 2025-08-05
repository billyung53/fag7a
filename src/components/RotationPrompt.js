import React from 'react';
import logo from '../assets/logo.png';
import './RotationPrompt.css';

function RotationPrompt() {
  return (
    <div className="rotation-prompt-overlay">
      <div className="rotation-prompt-content">
        <img src={logo} alt="Game Logo" className="rotation-logo" />

        <div className="rotate-icon">
          🔄
        </div>
        <h2>Please Rotate Your Device</h2>
        <p>This game is best experienced in landscape orientation</p>
      </div>
    </div>
  );
}

export default RotationPrompt;
