import React from 'react';
import './JeopardyButton.css';

function JeopardyButton({ value, onClick, isUsed }) {
  return (
    <button 
      className={`jeopardy-button ${isUsed ? 'used' : ''}`}
      onClick={() => onClick(value)}
      disabled={isUsed}
    >
      {value}
    </button>
  );
}

export default JeopardyButton;
