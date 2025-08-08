// components/QuestionDisplay/AnswerButtons.js
import React from 'react';
import './AnswerButtons.css';

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
    <div className="answer-buttons-container">
      {answers && answers.length > 0 ? (
        answers.map((answer, index) => (
          <button
            key={index}
            className={`answer-button ${
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
        <div className="no-answers">No answers available</div>
      )}
    </div>
  );
}

export default React.memo(AnswerButtons);
