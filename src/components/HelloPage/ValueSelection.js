// components/HelloPage/ValueSelection.js
import React from 'react';
import { CategoryItem } from '../CategorySelection';
import { ValueGrid } from '../ValueSelection';
import BackButton from '../BackButton';
import './ValueSelection.css';

function ValueSelection({ 
  selectedCategoryIndex, 
  categoryTitle, 
  values, 
  isButtonUsed, 
  questionsData, 
  onValueSelect, 
  onBackStep
}) {
  return (
    <div className="value-selection-container">
      <div className="category-and-back-row">
        <BackButton onClick={onBackStep}>
          Back
        </BackButton>
        
        <div className="selected-category-display">
          <CategoryItem
            category={categoryTitle}
            values={values}
            isButtonUsed={isButtonUsed}
            onCategorySelect={() => {}} // No-op since it's just for display
            categoryIndex={selectedCategoryIndex}
          />
        </div>
      </div>
      
      <ValueGrid
        values={values}
        selectedCategoryIndex={selectedCategoryIndex}
        isButtonUsed={isButtonUsed}
        questionsData={questionsData}
        onValueSelect={onValueSelect}
      />
    </div>
  );
}

export default ValueSelection;