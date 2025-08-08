// components/ValueSelection/ValueGrid.js
import React from 'react';
import ValueItem from './ValueItem';
import './ValueGrid.css';

function ValueGrid({ values, selectedCategoryIndex, isButtonUsed, questionsData, onValueSelect }) {
  return (
    <div className="value-grid">
      {values.map((value, valueIndex) => (
        <ValueItem
          key={`${selectedCategoryIndex}-${valueIndex}`}
          value={value}
          onClick={() => onValueSelect(value, valueIndex)}
          isUsed={isButtonUsed(selectedCategoryIndex, valueIndex)}
          hasQuestion={!!questionsData[selectedCategoryIndex]?.[valueIndex]}
        />
      ))}
    </div>
  );
}

export default ValueGrid;
