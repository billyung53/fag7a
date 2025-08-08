// components/HelloPage/AnswerButtons.js
import React from 'react';

function AnswerButtons({ 
  answers, 
  correctAnswer, 
  selectedAnswer, 
  showResult, 
  onAnswerClick 
}) {
  // Decode HTML entities
  const decodeHtml = (html) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  return (
    <div className="answers">
      {answers && answers.length > 0 ? (
        answers.map((answer, index) => (
          <button
            key={index}
            className={`answer-btn ${
              showResult 
                ? answer === correctAnswer 
                  ? 'correct' 
                  : answer === selectedAnswer 
                    ? 'incorrect' 
                    : ''
                : ''
            }`}
            onClick={() => onAnswerClick(answer)}
            disabled={showResult}
          >
            {decodeHtml(answer)}
          </button>
        ))
      ) : (
        <div style={{color: 'red', gridColumn: '1 / -1'}}>No answers available</div>
      )}
    </div>
  );
}

export default AnswerButtons;