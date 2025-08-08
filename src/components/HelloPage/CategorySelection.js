// components/HelloPage/CategorySelection.js
import React from 'react';
import { CategoryGrid } from '../CategorySelection';

function CategorySelection({ categoryTitles, values, isButtonUsed, onCategorySelect }) {
  return (
    <CategoryGrid 
      categoryTitles={categoryTitles}
      values={values}
      isButtonUsed={isButtonUsed}
      onCategorySelect={onCategorySelect}
    />
  );
}

export default CategorySelection;
