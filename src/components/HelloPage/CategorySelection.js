// components/HelloPage/CategorySelection.js
import React from 'react';

function CategorySelection({ categoryTitles, values, isButtonUsed, onCategorySelect }) {
  return (
    <div className="category-row">
      {categoryTitles.map((category, index) => (
        <div 
          key={index} 
          className="category-header clickable"
          onClick={() => onCategorySelect(index)}
        >
          <div className="category-title">{category}</div>
          <div className="category-dots">
            {values.map((_, valueIndex) => (
              <div 
                key={valueIndex}
                className={`category-dot ${isButtonUsed(index, valueIndex) ? 'used' : ''}`}
              ></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default CategorySelection;
