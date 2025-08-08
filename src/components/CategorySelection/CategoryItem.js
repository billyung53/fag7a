// components/CategorySelection/CategoryItem.js
import React, { useRef, useEffect, useState } from 'react';
import './CategoryItem.css';

function CategoryItem({ category, values, isButtonUsed, onCategorySelect, categoryIndex }) {
  const titleRef = useRef(null);
  const [lineClass, setLineClass] = useState('');

  useEffect(() => {
    if (titleRef.current) {
      const element = titleRef.current;
      const style = window.getComputedStyle(element);
      const lineHeight = parseFloat(style.lineHeight);
      const height = element.offsetHeight;
      const lines = Math.round(height / lineHeight);
      
      // Apply appropriate class based on line count
      if (lines <= 1) {
        setLineClass('single-line');
      } else {
        setLineClass('multi-line');
      }
    }
  }, [category]); // Re-run when category text changes

  return (
    <div 
      className="category-item clickable"
      onClick={() => onCategorySelect(categoryIndex)}
    >
      <div 
        ref={titleRef}
        className={`category-title ${lineClass}`}
      >
        {category}
      </div>
      <div className="category-dots">
        {values.map((_, valueIndex) => (
          <div 
            key={valueIndex}
            className={`category-dot ${isButtonUsed(categoryIndex, valueIndex) ? 'used' : ''}`}
          ></div>
        ))}
      </div>
    </div>
  );
}

export default CategoryItem;
