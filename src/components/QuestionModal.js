import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './QuestionModal.css';

function QuestionModal({ isOpen, onClose, category, value, onComplete, question, answers, correctAnswer }) {
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // No need to fetch question as it's passed as props
      setLoading(false);
      setError(null);
      setTimeLeft(30);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && timeLeft > 0 && !selectedAnswer) {
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
  }, [isOpen, timeLeft, selectedAnswer]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, [isOpen]);

  const getDifficulty = (value) => {
    if (value <= 200) return 'easy';
    if (value <= 400) return 'medium';
    return 'hard';
  };

  const getApiUrl = (categoryName, difficulty) => {
    const apis = {
      'General Knowledge': {
        easy: 'https://opentdb.com/api.php?amount=1&category=9&difficulty=easy&type=multiple',
        medium: 'https://opentdb.com/api.php?amount=1&category=9&difficulty=medium&type=multiple',
        hard: 'https://opentdb.com/api.php?amount=1&category=9&difficulty=hard&type=multiple'
      },
      'Geography': {
        easy: 'https://opentdb.com/api.php?amount=1&category=22&difficulty=easy&type=multiple',
        medium: 'https://opentdb.com/api.php?amount=1&category=22&difficulty=medium&type=multiple',
        hard: 'https://opentdb.com/api.php?amount=1&category=22&difficulty=hard&type=multiple'
      },
      'Computers': {
        easy: 'https://opentdb.com/api.php?amount=1&category=18&difficulty=easy&type=multiple',
        medium: 'https://opentdb.com/api.php?amount=1&category=18&difficulty=medium&type=multiple',
        hard: 'https://opentdb.com/api.php?amount=1&category=18&difficulty=hard&type=multiple'
      },
      'Gaming': {
        easy: 'https://opentdb.com/api.php?amount=1&category=15&difficulty=easy&type=multiple',
        medium: 'https://opentdb.com/api.php?amount=1&category=15&difficulty=medium&type=multiple',
        hard: 'https://opentdb.com/api.php?amount=1&category=15&difficulty=hard&type=multiple'
      },
      'Random': {
        easy: 'https://opentdb.com/api.php?amount=1&category=31&difficulty=easy&type=multiple',
        medium: 'https://opentdb.com/api.php?amount=1&category=28&difficulty=medium&type=multiple',
        hard: 'https://opentdb.com/api.php?amount=1&category=23&difficulty=hard&type=multiple'
      }
    };

    return apis[categoryName]?.[difficulty];
  };

  const fetchQuestion = async (retryAttempt = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      const difficulty = getDifficulty(value);
      const apiUrl = getApiUrl(category, difficulty);
      
      if (!apiUrl) {
        throw new Error('Invalid category or difficulty');
      }

      // Add a small delay to respect rate limits
      if (retryAttempt > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 * retryAttempt));
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('RATE_LIMITED');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.response_code === 1) {
        throw new Error('No questions available for this category/difficulty');
      } else if (data.response_code === 2) {
        throw new Error('Invalid parameter in API request');
      } else if (data.response_code === 3 || data.response_code === 4) {
        throw new Error('RATE_LIMITED');
      } else if (data.response_code !== 0) {
        throw new Error(`API Error: Response code ${data.response_code}`);
      }
      
      if (data.results && data.results.length > 0) {
        const questionData = data.results[0];
        setQuestion(questionData);
        
        // Shuffle answers
        const allAnswers = [...questionData.incorrect_answers, questionData.correct_answer];
        const shuffledAnswers = allAnswers.sort(() => Math.random() - 0.5);
        setAnswers(shuffledAnswers);
        setRetryCount(0);
      } else {
        throw new Error('No questions returned from API');
      }
    } catch (error) {
      console.error('Failed to fetch question:', error);
      
      // Handle rate limiting with retry
      if (error.message === 'RATE_LIMITED' && retryAttempt < 3) {
        console.log(`Rate limited, retrying in ${(retryAttempt + 1) * 2} seconds...`);
        setRetryCount(retryAttempt + 1);
        setTimeout(() => {
          fetchQuestion(retryAttempt + 1);
        }, (retryAttempt + 1) * 2000);
        return;
      }
      
      // Handle network errors with retry
      if ((error.name === 'AbortError' || error.message.includes('fetch')) && retryAttempt < 2) {
        console.log(`Network error, retrying in ${(retryAttempt + 1)} seconds...`);
        setRetryCount(retryAttempt + 1);
        setTimeout(() => {
          fetchQuestion(retryAttempt + 1);
        }, (retryAttempt + 1) * 1000);
        return;
      }
      
      // Set error for display
      setError(error.message === 'RATE_LIMITED' 
        ? 'API rate limit reached. Please wait a moment and try again.' 
        : error.message || 'Failed to load question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTimerClasses = (timeLeft) => {
    let classes = 'timer';
    
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
    if (selectedAnswer || showResult) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    const isCorrect = answer === correctAnswer;
    setTimeout(() => {
      onComplete(isCorrect, answer);
      onClose();
    }, 2000);
  };

  const handleTimeUp = () => {
    setShowResult(true);
    setTimeout(() => {
      onComplete(false, null);
      onClose();
    }, 2000);
  };

  const decodeHtml = (html) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <span className="close-btn" onClick={onClose}>&times;</span>
        
        <div className="timer-container">
          <div className={getTimerClasses(timeLeft)}>{timeLeft}</div>
        </div>
        
        <div className="question-header">
          <h3>{category} - {value}</h3>
        </div>

        {question ? (
          <>
            <div className="question">
              {decodeHtml(question)}
            </div>
            
            <div className="answers">
              {answers.map((answer, index) => (
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
                  onClick={() => handleAnswerClick(answer)}
                  disabled={showResult}
                >
                  {decodeHtml(answer)}
                </button>
              ))}
            </div>

            {showResult && (
              <div className="result">
                {selectedAnswer === correctAnswer 
                  ? 'Correct!' 
                  : selectedAnswer 
                    ? 'Incorrect!' 
                    : 'Time\'s up!'
                }
              </div>
            )}
          </>
        ) : (
          <div className="error">No question data available</div>
        )}
      </div>
    </div>
  );

  // Render modal using portal to ensure it's at the top level
  return createPortal(modalContent, document.body);
}

export default QuestionModal;
