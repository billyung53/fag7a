import React, { useState, useEffect } from 'react';
import './QuestionModal.css';

function QuestionModal({ isOpen, onClose, category, value, onComplete }) {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    if (isOpen && category && value) {
      fetchQuestion();
      setTimeLeft(30);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  }, [isOpen, category, value]);

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

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const difficulty = getDifficulty(value);
      const apiUrl = getApiUrl(category, difficulty);
      
      if (!apiUrl) {
        throw new Error('API URL not found');
      }

      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const questionData = data.results[0];
        setQuestion(questionData);
        
        // Shuffle answers
        const allAnswers = [...questionData.incorrect_answers, questionData.correct_answer];
        const shuffledAnswers = allAnswers.sort(() => Math.random() - 0.5);
        setAnswers(shuffledAnswers);
      } else {
        throw new Error('No questions found');
      }
    } catch (error) {
      console.error('Failed to fetch question:', error);
      setQuestion({ error: 'Failed to load question' });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerClick = (answer) => {
    if (selectedAnswer || showResult) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    const isCorrect = answer === question.correct_answer;
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <span className="close-btn" onClick={onClose}>&times;</span>
        
        <div className="question-header">
          <h3>{category} - ${value}</h3>
          <div className="timer">{timeLeft}s</div>
        </div>

        {loading ? (
          <div className="loading">Loading question...</div>
        ) : question?.error ? (
          <div className="error">{question.error}</div>
        ) : (
          <>
            <div className="question">
              {decodeHtml(question.question)}
            </div>
            
            <div className="answers">
              {answers.map((answer, index) => (
                <button
                  key={index}
                  className={`answer-btn ${
                    showResult 
                      ? answer === question.correct_answer 
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
                {selectedAnswer === question.correct_answer 
                  ? 'Correct!' 
                  : selectedAnswer 
                    ? 'Incorrect!' 
                    : 'Time\'s up!'
                }
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default QuestionModal;
