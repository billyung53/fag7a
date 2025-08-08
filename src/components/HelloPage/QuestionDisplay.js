// components/HelloPage/QuestionDisplay.js
import React from 'react';
import QuestionTimer from '../QuestionTimer';
import QuestionHeader from './QuestionHeader';
import QuestionText from './QuestionText';
import AnswerButtons from './AnswerButtons';

function QuestionDisplay({ 
  currentQuestion, 
  timeLeft, 
  selectedAnswer, 
  showResult, 
  onAnswerClick 
}) {
  return (
    <div className="question-display-container">
      <QuestionTimer timeLeft={timeLeft} />
      
      <QuestionHeader 
        categoryTitle={currentQuestion.categoryTitle}
        value={currentQuestion.value}
      />

      <QuestionText question={currentQuestion.question} />
      
      <AnswerButtons 
        answers={currentQuestion.allAnswers}
        correctAnswer={currentQuestion.correct_answer}
        selectedAnswer={selectedAnswer}
        showResult={showResult}
        onAnswerClick={onAnswerClick}
      />
    </div>
  );
}

export default QuestionDisplay;
