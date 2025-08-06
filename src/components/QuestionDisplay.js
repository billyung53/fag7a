import React, { useState, useEffect } from 'react';
import './QuestionDisplay.css';

function QuestionDisplay({ 
  isVisible, 
  category, 
  value, 
  question, 
  answers, 
  correctAnswer, 
  onComplete, 
  onNext,
}) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [questionAnswered, setQuestionAnswered] = useState(false);

  // Test back button - set to false to disable
  const ENABLE_TEST_BACK = true;

  useEffect(() => {
    if (isVisible) {
      setTimeLeft(30);
      setSelectedAnswer(null);
      setShowResult(false);
      setQuestionAnswered(false);
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible && timeLeft > 0 && !selectedAnswer && !questionAnswered) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isVisible, timeLeft, selectedAnswer, questionAnswered]);

  const getTimerClasses = (timeLeft) => {
    let classes = 'question-timer';
    
    if (timeLeft > 20) {
      classes += ' timer-green';
    } else if (timeLeft > 10) {
      classes += ' timer-yellow';
    } else {
      classes += ' timer-red';
    }
    
    if (timeLeft <= 10 && timeLeft > 5) {
      classes += ' timer-pulse';
    } else if (timeLeft <= 5) {
      classes += ' timer-urgent-pulse';
    }
    
    return classes;
  };

  const handleAnswerClick = (answer) => {
    if (selectedAnswer || showResult || questionAnswered) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    setQuestionAnswered(true);
    
    const isCorrect = answer === correctAnswer;
    onComplete(isCorrect, answer);
  };

  const handleTimeUp = () => {
    if (questionAnswered) return;
    
    setShowResult(true);
    setQuestionAnswered(true);
    onComplete(false, null);
  };

  const handleNext = () => {
    onNext();
  };

  const handleTestBack = () => {
    // Test function to go back - for testing purposes only
    if (ENABLE_TEST_BACK) {
      onNext();
    }
  };

  const decodeHtml = (html) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  if (!isVisible) return null;

  return (
    <div className="question-display">
      {ENABLE_TEST_BACK && (
        <button className="test-back-button" onClick={handleTestBack}>
          ← Test Back
        </button>
      )}


      {/* Header with Category and Value */}
      <div className="question-header">
        <div className="category-badge">{category}</div>
        <div className="value-badge">{value}</div>
      </div>

      {/* Timer */}
      <div className="timer-container">
        <div className={`timer ${timeLeft <= 10 ? 'timer-warning' : ''}`}>
          {timeLeft}
        </div>
      </div>

      {/* Question Content */}
      <div className="question-content">
        {question ? (
          <>
            <div className="question-text">
              {decodeHtml(question)}
            </div>
            
            <div className="answers-grid">
              {answers.map((answer, index) => (
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
                  onClick={() => handleAnswerClick(answer)}
                  disabled={showResult}
                >
                  {decodeHtml(answer)}
                </button>
              ))}
            </div>

            {showResult && (
              <div className="result-section">
                <button className="next-team-button" onClick={handleNext}>
                  Next Team
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="question-error">No question available</div>
        )}
      </div>
    </div>
  );
}

export default QuestionDisplay;
