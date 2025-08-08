// components/CategorySelection/CategoryGrid.js
import React from 'react';
import CategoryItem from './CategoryItem';
import './CategoryGrid.css';

function CategoryGrid({ categoryTitles, values, isButtonUsed, onCategorySelect }) {
  return (
    <div className="category-grid">
      {categoryTitles.map((category, index) => (
        <CategoryItem
          key={index}
          category={category}
          values={values}
          isButtonUsed={isButtonUsed}
          onCategorySelect={onCategorySelect}
          categoryIndex={index}
        />
      ))}
    </div>
  );
}

export default CategoryGrid;
