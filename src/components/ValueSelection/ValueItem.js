// components/ValueSelection/ValueItem.js
import React from 'react';
import './ValueItem.css';

function ValueItem({ value, onClick, isUsed, hasQuestion }) {
  return (
    <button
      className={`value-item ${isUsed ? 'used' : ''} ${hasQuestion ? 'has-question' : ''}`}
      onClick={onClick}
      disabled={isUsed}
    >
      <div className="value-amount">{value}</div>
    </button>
  );
}

export default ValueItem;
