// components/HelloPage/QuestionText.js
import React from 'react';

function QuestionText({ question }) {
  // Decode HTML entities
  const decodeHtml = (html) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  return (
    <div className="question">
      {decodeHtml(question)}
    </div>
  );
}

export default QuestionText;
