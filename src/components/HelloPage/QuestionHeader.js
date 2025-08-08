// components/HelloPage/QuestionHeader.js
import React from 'react';

function QuestionHeader({ categoryTitle, value }) {
  return (
    <div className="question-header">
      <h3>{categoryTitle} - {value}</h3>
    </div>
  );
}


export default QuestionHeader;