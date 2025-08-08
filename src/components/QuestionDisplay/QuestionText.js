// components/QuestionDisplay/QuestionText.js
import React from 'react';
import './QuestionText.css';

function QuestionText({ question }) {
  // Decode HTML entities
  const decodeHtml = (html) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  return (
    <div className="question-text">
      <p className="question-content">{decodeHtml(question)}</p>
    </div>
  );
}

export default React.memo(QuestionText);
