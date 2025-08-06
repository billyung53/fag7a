import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import JeopardyButton from '../components/JeopardyButton';
import RotationPrompt from '../components/RotationPrompt';
import FloatingPeaches from '../components/FloatingPeaches';
import LoadingScreen from '../components/LoadingScreen';
import useOrientation from '../hooks/useOrientation';
import './HelloPage.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://fiveo5a.onrender.com';

function HelloPage() {
  const location = useLocation();
  const { selectedCategories, teamNames } = location.state || {};
  const { isPortrait, isMobile } = useOrientation();
  
  const [usedButtons, setUsedButtons] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [currentTeam, setCurrentTeam] = useState(1); // 1 or 2
  
  // New state for 3-step process
  const [gameStep, setGameStep] = useState(1); // 1: category, 2: value, 3: question
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);
  const [selectedValueIndex, setSelectedValueIndex] = useState(null);
  
  // Question display state (replaces modal)
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const [apiResults, setApiResults] = useState([]);
  const hasFetchedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Show rotation prompt for mobile devices in portrait orientation
  const showRotationPrompt = isMobile && isPortrait;

  // Console log the passed data
  useEffect(() => {
    console.log('Team Names:', teamNames);
  }, [selectedCategories, teamNames]);

  // Fetch categories by IDs from backend
  useEffect(() => {
    const fetchCategoriesByIds = async () => {
      if (selectedCategories && selectedCategories.length > 0 && !hasFetchedRef.current) {
        hasFetchedRef.current = true; // Mark as fetched to prevent duplicates
        setIsLoading(true);
        setLoadingProgress(0);
        
        try {
          // Simulate progress updates - slower and more gradual
          const progressInterval = setInterval(() => {
            setLoadingProgress(prev => {
              if (prev >= 85) {
                clearInterval(progressInterval);
                return prev;
              }
              return prev + Math.random() * 4; // Slower increment (0-5% instead of 0-15%)
            });
          }, 500); // Update every 1 second instead of 300ms

          // Extract just the ID values from the category objects
          const idsParam = selectedCategories.map(category => category.id).join(',');
          console.log("idparams", idsParam);
          
          const response = await fetch(`${BACKEND_URL}/categories/by-ids?ids=${idsParam}`);
          const result = await response.json();
          
          // Complete the progress
          setLoadingProgress(100);
          
          // Wait a moment to show 100% before hiding loading
          setTimeout(() => {
            setApiResults(result || []);
            setIsLoading(false);
            clearInterval(progressInterval);
          }, 500);
          
          console.log('Categories API Response:', result);
          
          if (result.success) {
            console.log('Found IDs:', result.foundIds);
            console.log('Missing IDs:', result.missingIds);
          } else {
            console.error('API Error:', result.error);
          }
        } catch (error) {
          console.error('Error fetching categories:', error);
          hasFetchedRef.current = false; // Reset on error to allow retry
          setIsLoading(false);
        }
      }
    };

    fetchCategoriesByIds();
  }, [selectedCategories]);

  const categories = [
    'General Knowledge',
    'Geography', 
    'Computers',
    'Gaming',
    'Random'
  ];

  const values = [100, 200, 300, 400, 500];

  // Step 1: Handle category selection
  const handleCategorySelect = (categoryIndex) => {
    setSelectedCategoryIndex(categoryIndex);
    setGameStep(2);
  };

  // Step 2: Handle value selection
  const handleValueSelect = (value, valueIndex) => {
    const buttonId = `${selectedCategoryIndex}-${valueIndex}`;
    
    if (usedButtons.has(buttonId)) return;
    
    setSelectedValue(value);
    setSelectedValueIndex(valueIndex);
    
    // Get the actual question data from the organized questions
    const questionData = questionsData[selectedCategoryIndex]?.[valueIndex];
    
    if (!questionData) {
      console.error('No question data found for category', selectedCategoryIndex, 'value', valueIndex);
      return;
    }
    
    setCurrentQuestion({
      ...questionData,
      categoryIndex: selectedCategoryIndex,
      valueIndex: valueIndex,
      // Combine correct and incorrect answers and shuffle them
      allAnswers: [questionData.correct_answer, ...questionData.incorrect_answers].sort(() => Math.random() - 0.5)
    });
    
    // Debug logging
    console.log('Question Data:', questionData);
    console.log('All Answers:', [questionData.correct_answer, ...questionData.incorrect_answers]);
    
    // Initialize question display state
    setTimeLeft(30);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameStep(3);
  };

  const handleButtonClick = (value, categoryIndex, valueIndex) => {
    // This is now handled by the new step-based system
    // Keeping for compatibility but routing to value selection
    if (gameStep === 2) {
      handleValueSelect(value, valueIndex);
    }
  };

  // Timer effect for question step
  useEffect(() => {
    if (gameStep === 3 && timeLeft > 0 && !selectedAnswer && !showResult) {
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
  }, [gameStep, timeLeft, selectedAnswer, showResult]);

  // Handle answer selection
  const handleAnswerClick = (answer) => {
    if (selectedAnswer || showResult) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    const isCorrect = answer === currentQuestion.correct_answer;
    setTimeout(() => {
      handleQuestionComplete(isCorrect, answer);
    }, 2000);
  };

  // Handle time up
  const handleTimeUp = () => {
    if (showResult) return;
    
    setShowResult(true);
    setTimeout(() => {
      handleQuestionComplete(false, null);
    }, 2000);
  };

  // Decode HTML entities
  const decodeHtml = (html) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  const handleQuestionComplete = (isCorrect, selectedAnswer) => {
    const buttonId = `${currentQuestion.categoryIndex}-${currentQuestion.valueIndex}`;
    setUsedButtons(prev => new Set([...prev, buttonId]));
    
    // Add score if correct
    if (isCorrect) {
      if (currentTeam === 1) {
        setTeam1Score(prev => prev + currentQuestion.value);
      } else {
        setTeam2Score(prev => prev + currentQuestion.value);
      }
    }
    
    // Switch to the other team
    setCurrentTeam(prev => prev === 1 ? 2 : 1);
    
    // Reset the game steps for next turn
    setGameStep(1);
    setSelectedCategoryIndex(null);
    setSelectedValue(null);
    setSelectedValueIndex(null);
    setCurrentQuestion(null);
    setTimeLeft(30);
    setSelectedAnswer(null);
    setShowResult(false);
    
    console.log(`Question completed: ${isCorrect ? 'Correct' : 'Incorrect'}`);
    console.log(`Category: ${currentQuestion.categoryTitle}, Value: $${currentQuestion.value}`);
    console.log(`Question: ${currentQuestion.question}`);
    console.log(`Correct Answer: ${currentQuestion.correct_answer}`);
    if (selectedAnswer) {
      console.log(`Selected: ${selectedAnswer}`);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentQuestion(null);
    // Reset steps when modal is closed
    setGameStep(1);
    setSelectedCategoryIndex(null);
    setSelectedValue(null);
    setSelectedValueIndex(null);
    setTimeLeft(30);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  // Helper function to go back a step
  const handleBackStep = () => {
    if (gameStep === 2) {
      setGameStep(1);
      setSelectedCategoryIndex(null);
    } else if (gameStep === 3) {
      setGameStep(2);
      setSelectedValue(null);
      setSelectedValueIndex(null);
      setCurrentQuestion(null);
      setTimeLeft(30);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const isButtonUsed = (categoryIndex, valueIndex) => {
    const buttonId = `${categoryIndex}-${valueIndex}`;
    return usedButtons.has(buttonId);
  };

  const categoryTitles = apiResults.categories?.map(cat => cat.title) || [];
  const ApiIDs = apiResults.categories?.map(cat => cat.api_id) || [];

  // Organize questions by category and value
  const organizeQuestions = () => {
    if (!apiResults.categories) return {};
    
    const organizedQuestions = {};
    
    apiResults.categories.forEach((category, categoryIndex) => {
      organizedQuestions[categoryIndex] = {};
      
      if (category.questions && category.questions.length > 0) {
        // Assign questions to value slots (0-4 corresponding to $100-$500)
        category.questions.forEach((question, questionIndex) => {
          if (questionIndex < 5) { // Only use first 5 questions
            organizedQuestions[categoryIndex][questionIndex] = {
              ...question,
              value: values[questionIndex],
              categoryTitle: category.title
            };
          }
        });
      }
    });
    
    return organizedQuestions;
  };

  const questionsData = organizeQuestions();

  console.log('API IDs:', ApiIDs);
  console.log('Organized Questions:', questionsData);

  

  return (
    <div className="container">
      {/* Show Loading Screen OR Main Content */}
      {isLoading ? (
        <LoadingScreen isVisible={isLoading} progress={loadingProgress} />
      ) : (
        <>
          {/* Floating Peaches Background Animation */}
          <FloatingPeaches />
          
          {/* Rotation Prompt for Mobile Portrait */}
          {showRotationPrompt && <RotationPrompt />}
          
          {/* Main Game Layout */}
          <div className="game-layout">
            {/* Left Team Score - Always Visible */}
            <div className={`team-score left ${currentTeam === 1 ? 'active' : ''}`}>
              <div className="score-circle">{team1Score}</div>
              <h3>{teamNames?.team1}</h3>
            </div>
            
            {/* Jeopardy Grid - Changes based on step */}
            <div className="jeopardy-grid">              

              {/* Step 1: Category Selection */}
              {gameStep === 1 && (
                <div className="category-row">
                  {categoryTitles.map((category, index) => (
                    <div 
                      key={index} 
                      className="category-header clickable"
                      onClick={() => handleCategorySelect(index)}
                    >
                      <div className="category-title">{category}</div>
                      <div className="category-dots">
                        {values.map((_, valueIndex) => (
                          <div 
                            key={valueIndex}
                            className={`category-dot ${isButtonUsed(index, valueIndex) ? 'used' : ''}`}
                          ></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 2: Value Selection */}
              {gameStep === 2 && selectedCategoryIndex !== null && (
                <>
                  {/* Back Button */}
                  <div className="back-button-container">
                    <button className="back-button" onClick={handleBackStep}>
                      Back
                    </button>
                  </div>
                  
                  {/* Show selected category */}
                  <div className="selected-category-display">
                    <div className="category-header selected">
                      <div className="category-title">{categoryTitles[selectedCategoryIndex]}</div>
                      <div className="category-dots">
                        {values.map((_, valueIndex) => (
                          <div 
                            key={valueIndex}
                            className={`category-dot ${isButtonUsed(selectedCategoryIndex, valueIndex) ? 'used' : ''}`}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Show value buttons for selected category */}
                  <div className="value-row">
                    {values.map((value, valueIndex) => (
                      <JeopardyButton
                        key={`${selectedCategoryIndex}-${valueIndex}`}
                        value={value}
                        onClick={() => handleValueSelect(value, valueIndex)}
                        isUsed={isButtonUsed(selectedCategoryIndex, valueIndex)}
                        hasQuestion={!!questionsData[selectedCategoryIndex]?.[valueIndex]}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Step 3: Question Display - Inline */}
              {gameStep === 3 && currentQuestion && (
                <div className="question-display-container">
                  {/* Timer */}
                  <div className="timer-container">
                    <div className={`question-timer ${timeLeft <= 10 ? 'timer-warning' : ''} ${timeLeft <= 5 ? 'timer-urgent' : ''}`}>
                      {timeLeft}
                    </div>
                  </div>
                  
                  {/* Question Header */}
                  <div className="question-header">
                    <h3>{currentQuestion.categoryTitle} - {currentQuestion.value}</h3>
                  </div>

                  {/* Question Text */}
                  <div className="question">
                    {decodeHtml(currentQuestion.question)}
                  </div>
                  
                  {/* Answer Buttons */}
                  <div className="answers">
                    {currentQuestion.allAnswers && currentQuestion.allAnswers.length > 0 ? (
                      currentQuestion.allAnswers.map((answer, index) => (
                        <button
                          key={index}
                          className={`answer-btn ${
                            showResult 
                              ? answer === currentQuestion.correct_answer 
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
                      ))
                    ) : (
                      <div style={{color: 'red', gridColumn: '1 / -1'}}>No answers available</div>
                    )}
                  </div>

                  {/* Result Display */}
                  {/* {showResult && (
                    // <div className="result">
                    //   {selectedAnswer === currentQuestion.correct_answer 
                    //     ? 'Correct!' 
                    //     : selectedAnswer 
                    //       ? 'Incorrect!' 
                    //       : 'Time\'s up!'
                    //   }
                    // </div>
                  )} */}
                </div>
              )}
            </div>
            
            {/* Right Team Score - Always Visible */}
            <div className={`team-score right ${currentTeam === 2 ? 'active' : ''}`}>
              <div className="score-circle">{team2Score}</div>
              <h3>{teamNames?.team2}</h3>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default HelloPage;
