// components/QuestionDisplay/QuestionHeader.js
import React from 'react';
import './QuestionHeader.css';

function QuestionHeader({ categoryTitle, value }) {
  return (
    <div className="question-header">
      {/* <h3 className="question-title">{categoryTitle} - {value}</h3> */}
    </div>
  );
}

export default React.memo(QuestionHeader);
