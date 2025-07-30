import React, { useState } from 'react';
import logo from '../assets/logo.png';
import JeopardyButton from '../components/JeopardyButton';
import QuestionModal from '../components/QuestionModal';
import './HelloPage.css';

function HelloPage() {
  const [usedButtons, setUsedButtons] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [currentTeam, setCurrentTeam] = useState(1); // 1 or 2

  const categories = [
    'General Knowledge',
    'Geography', 
    'Computers',
    'Gaming',
    'Random'
  ];

  const values = [100, 200, 300, 400, 500];

  const handleButtonClick = (value, categoryIndex, valueIndex) => {
    const buttonId = `${categoryIndex}-${valueIndex}`;
    
    if (usedButtons.has(buttonId)) return;
    
    setCurrentQuestion({
      category: categories[categoryIndex],
      value: value,
      categoryIndex: categoryIndex,
      valueIndex: valueIndex
    });
    setShowModal(true);
  };

  const handleQuestionComplete = (isCorrect, selectedAnswer) => {
    const buttonId = `${currentQuestion.categoryIndex}-${currentQuestion.valueIndex}`;
    setUsedButtons(prev => new Set([...prev, buttonId]));
    
    // Add score if correct and switch turns
    if (isCorrect) {
      if (currentTeam === 1) {
        setTeam1Score(prev => prev + currentQuestion.value);
      } else {
        setTeam2Score(prev => prev + currentQuestion.value);
      }
    }
    
    // Switch to the other team
    setCurrentTeam(prev => prev === 1 ? 2 : 1);
    
    console.log(`Question completed: ${isCorrect ? 'Correct' : 'Incorrect'}`);
    console.log(`Category: ${currentQuestion.category}, Value: $${currentQuestion.value}`);
    if (selectedAnswer) {
      console.log(`Selected: ${selectedAnswer}`);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentQuestion(null);
  };

  const isButtonUsed = (categoryIndex, valueIndex) => {
    const buttonId = `${categoryIndex}-${valueIndex}`;
    return usedButtons.has(buttonId);
  };

  return (
    <div className="container">
      {/* Scoring Header */}
      <div className="score-header">
        <div className={`team-score ${currentTeam === 1 ? 'active' : ''}`}>
          <h3>Team 1</h3>
          <div className="score">{team1Score}</div>
        </div>
        
        <img src={logo} alt="Logo" className="logo-center" />
        
        <div className={`team-score ${currentTeam === 2 ? 'active' : ''}`}>
          <h3>Team 2</h3>
          <div className="score">{team2Score}</div>
        </div>
      </div>
      
      <div className="jeopardy-grid">
        {/* Category Headers */}
        <div className="category-row">
          {categories.map((category, index) => (
            <div key={index} className="category-header">
              {category}
            </div>
          ))}
        </div>
        
        {/* Value Rows */}
        {values.map((value, valueIndex) => (
          <div key={value} className="value-row">
            {categories.map((_, categoryIndex) => (
              <JeopardyButton
                key={`${categoryIndex}-${valueIndex}`}
                value={value}
                onClick={() => handleButtonClick(value, categoryIndex, valueIndex)}
                isUsed={isButtonUsed(categoryIndex, valueIndex)}
              />
            ))}
          </div>
        ))}
      </div>
      
      <QuestionModal
        isOpen={showModal}
        onClose={handleCloseModal}
        category={currentQuestion?.category}
        value={currentQuestion?.value}
        onComplete={handleQuestionComplete}
      />
    </div>
  );
}

export default HelloPage;
