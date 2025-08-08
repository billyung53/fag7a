// components/HelloPage/QuestionTimer.js
import React from 'react';

function QuestionTimer({ timeLeft }) {
  return (
    <div className="timer-container">
      <div className={`question-timer ${timeLeft <= 10 ? 'timer-warning' : ''} ${timeLeft <= 5 ? 'timer-urgent' : ''}`}>
        {timeLeft}
      </div>
    </div>
  );
}

export default QuestionTimer;