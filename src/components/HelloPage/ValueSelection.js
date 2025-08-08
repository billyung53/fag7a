// components/HelloPage/ValueSelection.js
import React from 'react';

function ValueSelection({ 
  selectedCategoryIndex, 
  categoryTitle, 
  values, 
  isButtonUsed, 
  questionsData, 
  onValueSelect, 
  onBackStep,
  JeopardyButton 
}) {
  return (
    <>
      <div className="back-button-container">
        <button className="back-button" onClick={onBackStep}>
          Back
        </button>
      </div>
      
      <div className="selected-category-display">
        <div className="category-header selected">
          <div className="category-title">{categoryTitle}</div>
          <div className="category-dots">
            {values.map((_, valueIndex) => (
              <div 
                key={valueIndex}
                className={`category-dot ${isButtonUsed(selectedCategoryIndex, valueIndex) ? 'used' : ''}`}
              ></div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="value-row">
        {values.map((value, valueIndex) => (
          <JeopardyButton
            key={`${selectedCategoryIndex}-${valueIndex}`}
            value={value}
            onClick={() => onValueSelect(value, valueIndex)}
            isUsed={isButtonUsed(selectedCategoryIndex, valueIndex)}
            hasQuestion={!!questionsData[selectedCategoryIndex]?.[valueIndex]}
          />
        ))}
      </div>
    </>
  );
}

export default ValueSelection;