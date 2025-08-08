// components/BackButton/BackButton.js
import React from 'react';
import './BackButton.css';

function BackButton({ onClick, children = "Back" }) {
  return (
    <div className="back-button-container">
      <button className="back-button" onClick={onClick}>
        {children}
      </button>
    </div>
  );
}

export default BackButton;
