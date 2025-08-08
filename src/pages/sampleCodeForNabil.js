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





// css


// .game-layout {
//   display: flex;
//   align-items: center; /* Vertically center everything */
//   justify-content: center;
//   gap: 20px; /* Increased gap to accommodate larger grid */
//   margin: 10px auto;
//   max-width: 2000px; /* Increased to accommodate larger grid */
//   min-height: 80vh; /* Ensure vertical centering */
// }

// /* Hide game content on mobile portrait when rotation prompt is shown */
// @media screen and (max-width: 768px) and (orientation: portrait) {
//   .game-layout {
//     display: none;
//   }
// }

// .team-score {
//   text-align: center;
//   color: white;
//   padding: 20px;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   gap: 15px;
//   min-width: 150px;
//   max-width: 200px;
//   align-self: center; /* Ensure team scores are centered vertically */
// }

// .team-score .score-circle {
//   width: 100px;
//   height: 100px;
//   border-radius: 50%;
//   background: rgba(255, 255, 255, 0.5);
//   backdrop-filter: blur(10px);
//   border: 3px solid transparent;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   transition: all 0.3s ease;
//   font-size: 2.5rem;
//   font-weight: 900;
//   font-family: 'Montserrat', sans-serif;
//   text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
// }

// .team-score.active .score-circle {
//   border-color: #FFF;
//   background: #ff6d4d;
//   transform: scale(1.05);
//   box-shadow: 0 10px 25px rgba(255, 109, 77, 0.4);
//   animation: bounce 1.5s ease-in-out infinite;
// }

// @keyframes bounce {
//   0%, 100% { transform: scale(1.05) translateY(0); }
//   50% { transform: scale(1.05) translateY(-10px); }
// }

// .team-score h3 {
//   margin: 0;
//   font-family: 'Montserrat', sans-serif;
//   font-weight: 700;
//   font-size: 1.2rem;
//   text-transform: uppercase;
//   letter-spacing: 1px;
//   word-break: break-word;
//   color: #333;
// }

// .team-score.left {
//   order: 1;
// }

// .team-score.right {
//   order: 3;
// }

// .jeopardy-grid {
//   order: 2;
//   flex: 1;
//   max-width: 1000px; /* Significantly increased for better readability */
//   min-width: 900px; /* Set minimum width to ensure it doesn't get too cramped */
//   margin: 0;
//   display: flex;
//   flex-direction: column;
//   justify-content: center; /* Center the grid vertically */
// }

// .category-row, .value-row {
//   display: grid;
//   grid-template-columns: repeat(5, 1fr);
//   gap: 10px; /* Increased gap for better spacing */
//   margin-bottom: 8px; /* Increased margin for better separation */
//   width: 100%;
// }

// .category-header {
//   background: #ff6d4d;
//   color: #fff;
//   font-family: 'Montserrat', sans-serif;
//   font-weight: 700;
//   font-size: 1.1rem; /* Slightly increased font size for better readability */
//   text-align: center;
//   padding: 15px 16px; /* Increased horizontal padding */
//   border: 2px solid #fff;
//   border-radius: 8px;
//   min-height: 90px;
//   max-height: 90px; /* Match JeopardyButton height */
//   width: 100%;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
//   box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
//   text-transform: uppercase;
//   letter-spacing: 0.5px;
//   box-sizing: border-box; /* Include padding and border in width calculation */
//   overflow: hidden; /* Prevent text overflow */
//   word-break: break-word;
//   hyphens: auto;
//   cursor: pointer;
//   transition: all 0.3s ease;
// }

// .category-header:hover {
//   background: #ff5722;
//   transform: translateY(-2px);
//   box-shadow: 0 5px 12px rgba(0, 0, 0, 0.4);
// }

// .category-header.selected {
//   background: #ff6d4d;
//   border: 4px solid #fff;
//   cursor: default;
// }

// .category-header.selected:hover {
//   background: #ff6d4d;
//   transform: none;
//   box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
// }

// .category-title {
//   flex: 1;
//   display: flex;
//   align-items: center;
//   justify-content: center;
// }

// .category-dots {
//   display: flex;
//   gap: 3px;
//   margin-top: 6px;
//   align-items: center;
//   justify-content: center;
// }

// .category-dot {
//   width: 10px;
//   height: 10px;
//   border-radius: 50%;
//   background-color: #fff;
//   border: 1px solid rgba(255, 255, 255, 0.3);
//   transition: all 0.3s ease;
// }

// .category-dot.used {
//   background-color: #2a2a2a;
//   border-color: #2a2a2a;
// }

// .selected-category-values {
//   margin-top: 20px;
//   width: 100%;
// }

// .selected-category-header {
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   margin-bottom: 15px;
//   padding: 0 10px;
// }

// .selected-category-header h3 {
//   color: #ff6d4d;
//   font-family: 'Montserrat', sans-serif;
//   font-weight: 700;
//   font-size: 1.5rem;
//   text-transform: uppercase;
//   letter-spacing: 1px;
//   margin: 0;
// }

// .back-button {
//   background: #666;
//   color: #fff;
//   border: none;
//   padding: 8px 16px;
//   border-radius: 5px;
//   font-family: 'Montserrat', sans-serif;
//   font-weight: 600;
//   cursor: pointer;
//   transition: all 0.3s ease;
// }

// .back-button:hover {
//   background: #555;
//   transform: translateY(-1px);
// }

// .single-category-values {
//   display: flex;
//   gap: 10px;
//   justify-content: center;
//   flex-wrap: wrap;
// }

// .selected-category-row {
//   display: grid;
//   grid-template-columns: repeat(6, 1fr); /* 1 category header + 5 value buttons */
//   gap: 10px;
//   margin-bottom: 8px;
//   width: 100%;
// }

// .back-button-container {
//   display: flex;
//   justify-content: center;
//   margin-bottom: 15px;
// }

// .back-button {
//   background: #666;
//   color: #fff;
//   border: none;
//   padding: 10px 20px;
//   border-radius: 5px;
//   font-family: 'Montserrat', sans-serif;
//   font-weight: 600;
//   font-size: 0.9rem;
//   cursor: pointer;
//   transition: all 0.3s ease;
// }

// .back-button:hover {
//   background: #555;
//   transform: translateY(-1px);
// }

// .question-context {
//   position: absolute;
//   top: 20px;
//   left: 50%;
//   transform: translateX(-50%);
//   z-index: 20;
//   background: rgba(0, 0, 0, 0.8);
//   padding: 15px;
//   border-radius: 10px;
//   backdrop-filter: blur(10px);
//   border: 1px solid rgba(255, 255, 255, 0.2);
// }

// .selected-category-header-small {
//   display: flex;
//   align-items: center;
//   gap: 15px;
// }

// .category-header.small {
//   min-height: 60px;
//   max-height: 60px;
//   min-width: 150px;
//   font-size: 0.9rem;
//   padding: 10px 12px;
// }

// .selected-jeopardy-button {
//   width: 80px;
// }

// .selected-jeopardy-button .jeopardy-button {
//   min-height: 60px;
//   max-height: 60px;
//   font-size: 1rem;
//   cursor: default;
// }

// /* Mobile Responsive */
// @media (max-width: 768px) {
//   .game-layout {
//     flex-direction: column;
//     gap: 10px;
//     align-items: center;
//     min-height: auto; /* Remove min-height constraint on mobile */
//     max-width: 100%; /* Full width on mobile */
//   }
  
//   .team-score {
//     min-width: 120px;
//     max-width: 300px;
//     padding: 15px;
//     gap: 10px;
//   }
  
//   .team-score .score-circle {
//     width: 80px;
//     height: 80px;
//     font-size: 2rem;
//   }
  
//   .team-score.left {
//     order: 1;
//   }
  
//   .jeopardy-grid {
//     order: 2;
//     width: 100%;
//     max-width: 100%; /* Full width on mobile */
//   }
  
//   .team-score.right {
//     order: 3;
//   }
  
//   .team-score h3 {
//     font-size: 1.1rem;
//   }
  
//   .category-row, .value-row {
//     gap: 6px;
//     margin-bottom: 6px;
//   }
  
//   .selected-category-row {
//     gap: 6px;
//     margin-bottom: 6px;
//   }
  
//   .category-header {
//     font-size: 0.8rem;
//     padding: 12px 6px;
//     min-height: 50px;
//     max-height: 50px; /* Match JeopardyButton height on mobile */
//     letter-spacing: 0.3px;
//   }
  
//   .selected-category-header {
//     flex-direction: column;
//     gap: 10px;
//     text-align: center;
//   }
  
//   .selected-category-header h3 {
//     font-size: 1.2rem;
//   }
  
//   .single-category-values {
//     gap: 8px;
//   }
  
//   .question-context {
//     top: 10px;
//     padding: 10px;
//   }
  
//   .selected-category-header-small {
//     gap: 10px;
//   }
  
//   .category-header.small {
//     min-height: 50px;
//     max-height: 50px;
//     min-width: 120px;
//     font-size: 0.7rem;
//     padding: 8px 10px;
//   }
  
//   .selected-jeopardy-button {
//     width: 60px;
//   }
  
//   .selected-jeopardy-button .jeopardy-button {
//     min-height: 50px;
//     max-height: 50px;
//     font-size: 0.8rem;
//   }
// }

// @media (max-width: 480px) {
//   .game-layout {
//     gap: 15px;
//     margin: 10px auto;
//   }
  
//   .team-score {
//     min-width: 100px;
//     padding: 12px;
//     gap: 8px;
//   }
  
//   .team-score .score-circle {
//     width: 70px;
//     height: 70px;
//     font-size: 1.6rem;
//   }
  
//   .team-score h3 {
//     font-size: 1rem;
//   }
  
//   .category-row, .value-row {
//     gap: 4px;
//     margin-bottom: 4px;
//   }
  
//   .selected-category-row {
//     gap: 4px;
//     margin-bottom: 4px;
//   }
  
//   .category-header {
//     font-size: 0.7rem;
//     padding: 10px 4px;
//     min-height: 45px;
//     max-height: 45px; /* Match JeopardyButton height on small mobile */
//     letter-spacing: 0.2px;
//   }
  
//   .selected-category-header h3 {
//     font-size: 1rem;
//   }
  
//   .back-button {
//     padding: 6px 12px;
//     font-size: 0.8rem;
//   }
  
//   .back-button-container {
//     margin-bottom: 10px;
//   }
  
//   .single-category-values {
//     gap: 6px;
//   }
  
//   .question-context {
//     top: 5px;
//     padding: 8px;
//   }
  
//   .category-header.small {
//     min-height: 45px;
//     max-height: 45px;
//     min-width: 100px;
//     font-size: 0.6rem;
//     padding: 6px 8px;
//   }
  
//   .selected-jeopardy-button {
//     width: 50px;
//   }
  
//   .selected-jeopardy-button .jeopardy-button {
//     min-height: 45px;
//     max-height: 45px;
//     font-size: 0.7rem;
//   }
// }

// @media (max-width: 320px) {
//   .category-header {
//     font-size: 0.6rem;
//     padding: 8px 2px;
//     min-height: 45px;
//     max-height: 45px; /* Match JeopardyButton height */
//   }
// }

// /* Mobile Landscape Optimization - Forces content to fit on screen */
// @media screen and (max-width: 1024px) and (orientation: landscape) {
//   /* Reduced scaling for better readability */
//   .container {
//     transform: scale(0.9); /* Reduced from 0.8 for better readability */
//     transform-origin: top center;
//     width: 111%; /* Compensate for scale */
//     margin: 0 auto;
//     padding: 10px;
//   }
  
//   .game-layout {
//     gap: 10px; /* Increased gap */
//     margin: 10px auto;
//     flex-direction: row; /* Keep side-by-side in landscape */
//     max-width: 1600px; /* Increased for larger grid */
//   }
  
//   .jeopardy-grid {
//     min-width: 600px; /* Ensure minimum width in landscape */
//   }
  
//   .team-score {
//     min-width: 120px;
//     max-width: 150px;
//     padding: 12px;
//     gap: 8px;
//   }
  
//   .team-score .score-circle {
//     width: 70px;
//     height: 70px;
//     font-size: 1.5rem;
//   }
  
//   .team-score h3 {
//     font-size: 1rem;
//   }
  
//   .category-header {
//     font-size: 0.7rem;
//     padding: 8px 4px;
//     min-height: 90px;
//     max-height: 90px; /* Match desktop JeopardyButton height */
//   }
// }

// /* Extra small mobile landscape - more aggressive scaling */
// @media screen and (max-width: 768px) and (orientation: landscape) and (max-height: 500px) {
//   .container {
//     transform: scale(0.75); /* Slightly reduced scaling */
//     width: 133%; /* Compensate for smaller scale */
//     padding: 5px;
//   }
  
//   .game-layout {
//     gap: 20px; /* Increased gap */
//     margin: 5px auto;
//   }
  
//   .jeopardy-grid {
//     min-width: 800px; /* Ensure minimum width */
//   }
  
//   .team-score {
//     min-width: 100px;
//     max-width: 120px;
//     padding: 10px;
//     gap: 6px;
//   }
  
//   .team-score .score-circle {
//     width: 60px;
//     height: 60px;
//     font-size: 1.3rem;
//   }
  
//   .team-score h3 {
//     font-size: 0.9rem;
//   }
  
//   .category-row, .value-row {
//     gap: 3px;
//     margin-bottom: 1px;
//   }
  
//   .category-header {
//     font-size: 0.6rem;
//     padding: 6px 2px;
//     min-height: 90px;
//     max-height: 90px; /* Match desktop JeopardyButton height */
//   }
// }

// /* Very small mobile landscape - maximum compression */
// @media screen and (max-width: 480px) and (orientation: landscape) and (max-height: 400px) {
//   .container {
//     transform: scale(0.5);
//     width: 200%; /* Compensate for very small scale */
//     padding: 0;
//   }
  
//   .game-layout {
//     gap: 10px;
//     margin: 0 auto;
//   }
  
//   .team-score {
//     min-width: 80px;
//     max-width: 100px;
//     padding: 8px;
//     gap: 4px;
//   }
  
//   .team-score .score-circle {
//     width: 50px;
//     height: 50px;
//     font-size: 1.1rem;
//   }
  
//   .team-score h3 {
//     font-size: 0.8rem;
//   }
  
//   .category-row, .value-row {
//     gap: 2px;
//     margin-bottom: 2px;
//   }
  
//   .category-header {
//     font-size: 0.5rem;
//     padding: 4px 1px;
//     min-height: 90px;
//     max-height: 90px; /* Match desktop JeopardyButton height */
//   }
// }

// /* Step-based Game Flow Styles */
// .step-indicator {
//   text-align: center;
//   margin-bottom: 20px;
//   padding: 15px;
//   background: rgba(255, 255, 255, 0.1);
//   border-radius: 8px;
//   backdrop-filter: blur(10px);
// }

// .current-team {
//   display: block;
//   font-size: 1.2rem;
//   font-weight: 700;
//   color: #ff6d4d;
//   margin-bottom: 8px;
//   font-family: 'Montserrat', sans-serif;
// }

// .step-text {
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   gap: 15px;
//   font-size: 1rem;
//   color: #333;
//   font-weight: 600;
//   font-family: 'Montserrat', sans-serif;
// }

// .back-btn {
//   background: #666;
//   color: white;
//   border: none;
//   padding: 6px 12px;
//   border-radius: 4px;
//   font-size: 0.8rem;
//   font-weight: 600;
//   cursor: pointer;
//   transition: all 0.3s ease;
//   font-family: 'Montserrat', sans-serif;
// }

// .back-btn:hover {
//   background: #555;
//   transform: translateY(-1px);
// }

// .category-header.clickable {
//   cursor: pointer;
//   transition: all 0.3s ease;
// }

// .category-header.clickable:hover {
//   background: #ff5722;
//   transform: translateY(-2px);
//   box-shadow: 0 5px 12px rgba(0, 0, 0, 0.4);
// }

// .selected-category-display {
//   display: flex;
//   justify-content: center;
//   margin-bottom: 20px;
// }

// .category-header.selected {
//   background: #ff6d4d;
//   border: 4px solid #fff;
//   cursor: default;
//   transform: none;
//   max-width: 300px;
// }

// .question-step-display {
//   text-align: center;
//   padding: 40px 20px;
// }

// .selected-info {
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   gap: 20px;
//   margin-bottom: 20px;
//   flex-wrap: wrap;
// }

// .selected-category {
//   background: #ff6d4d;
//   color: white;
//   padding: 12px 20px;
//   border-radius: 8px;
//   font-weight: 600;
//   font-size: 1.1rem;
//   font-family: 'Montserrat', sans-serif;
// }

// .selected-value {
//   background: white;
//   color: #ff6d4d;
//   border: 3px solid #ff6d4d;
//   padding: 12px 20px;
//   border-radius: 8px;
//   font-weight: 600;
//   font-size: 1.1rem;
//   font-family: 'Montserrat', sans-serif;
// }

// .question-loading {
//   font-size: 1.2rem;
//   color: #666;
//   font-style: italic;
//   font-family: 'Montserrat', sans-serif;
// }

// /* Mobile Landscape Optimizations for Step-based Flow */
// @media screen and (max-width: 1024px) and (orientation: landscape) {
//   .step-indicator {
//     margin-bottom: 10px;
//     padding: 8px;
//   }
  
//   .current-team {
//     font-size: 0.9rem;
//     margin-bottom: 4px;
//   }
  
//   .step-text {
//     font-size: 0.8rem;
//     gap: 8px;
//     flex-wrap: wrap;
//   }
  
//   .back-btn {
//     padding: 4px 8px;
//     font-size: 0.7rem;
//   }
  
//   .selected-info {
//     gap: 10px;
//     margin-bottom: 10px;
//   }
  
//   .selected-category, .selected-value {
//     padding: 6px 12px;
//     font-size: 0.8rem;
//   }
  
//   .question-step-display {
//     padding: 20px 10px;
//   }
  
//   .question-loading {
//     font-size: 0.9rem;
//   }
// }

// @media screen and (max-width: 768px) and (orientation: landscape) {
//   .step-indicator {
//     margin-bottom: 8px;
//     padding: 6px;
//   }
  
//   .current-team {
//     font-size: 0.8rem;
//     margin-bottom: 3px;
//   }
  
//   .step-text {
//     font-size: 0.7rem;
//     gap: 6px;
//   }
  
//   .back-btn {
//     padding: 3px 6px;
//     font-size: 0.6rem;
//   }
  
//   .selected-info {
//     gap: 8px;
//     margin-bottom: 8px;
//   }
  
//   .selected-category, .selected-value {
//     padding: 4px 8px;
//     font-size: 0.7rem;
//   }
  
//   .question-step-display {
//     padding: 15px 8px;
//   }
  
//   .question-loading {
//     font-size: 0.8rem;
//   }
// }

// /* Back Button Styles for Step 2 */
// .back-button-container {
//   width: 100%;
//   display: flex;
//   justify-content: flex-start;
//   margin-bottom: 20px;
// }

// .back-button {
//   background: transparent;
//   border: 2px solid #ff6d4d;
//   color: #ff6d4d;
//   padding: 10px 20px;
//   border-radius: 8px;
//   font-size: 1rem;
//   font-weight: 600;
//   cursor: pointer;
//   transition: all 0.3s ease;
//   font-family: 'Montserrat', sans-serif;
//   display: flex;
//   align-items: center;
//   gap: 8px;
// }

// .back-button:hover {
//   background: #ff6d4d;
//   color: white;
//   transform: translateY(-2px);
//   box-shadow: 0 4px 12px rgba(255, 109, 77, 0.3);
// }

// /* Inline Question Display Styles - Using QuestionModal Design System */
// .question-display-container {
//   width: 100%;
//   max-width: 800px;
//   margin: 0 auto;
//   padding: 10px;
//   text-align: center;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: space-between;
//   gap: 12px;
//   font-family: 'Montserrat', sans-serif;
//   height: 100%;
//   max-height: calc(150vh - 70px); /* Reduced from 160px to give more space */
//   overflow: hidden;
//   box-sizing: border-box;
// }

// .question-display-container .timer-container {
//   display: flex;
//   justify-content: center;
//   align-items: center;
// }

// .question-display-container .question-timer {
//   width: 80px;
//   height: 80px;
//   border-radius: 50%;
//   background: linear-gradient(135deg, #4CAF50, #45a049);
//   color: white;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   font-size: 2rem;
//   font-weight: bold;
//   box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
//   transition: all 0.3s ease;
// }

// .question-display-container .question-timer.timer-warning {
//   background: linear-gradient(135deg, #FF9800, #F57C00);
//   box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
//   animation: pulse-warning 1s ease-in-out infinite;
// }

// .question-display-container .question-timer.timer-urgent {
//   background: linear-gradient(135deg, #f44336, #d32f2f);
//   box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
//   animation: pulse-urgent 0.5s ease-in-out infinite;
// }

// @keyframes pulse-warning {
//   0%, 100% { transform: scale(1); }
//   50% { transform: scale(1.05); }
// }

// @keyframes pulse-urgent {
//   0%, 100% { transform: scale(1); }
//   50% { transform: scale(1.1); }
// }

// .question-display-container .question-header {
//   margin: 0;
// }

// .question-display-container .question-header h3 {
//   font-size: 1.8rem;
//   color: #ff6d4d;
//   margin: 0;
//   font-weight: 700;
//   text-transform: uppercase;
//   letter-spacing: 1px;
// }

// .question-display-container .question {
//   font-size: 1.4rem;
//   color: #333;
//   line-height: 1.6;
//   font-weight: 500;
//   max-width: 600px;
//   margin: 0 auto;
//   flex: 1;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   text-align: center;
//   overflow-wrap: break-word;
//   word-wrap: break-word;
//   hyphens: auto;
//   max-height: none;
//   overflow: visible;
// }

// .question-display-container .answers {
//   display: grid;
//   grid-template-columns: 1fr 1fr;
//   gap: 15px;
//   width: 100%;
//   max-width: 600px;
//   flex-shrink: 0;
//   margin: 0 auto;
//   box-sizing: border-box;
// }

// .question-display-container .answer-btn {
//   background: white;
//   border: 3px solid #ff6d4d;
//   color: #333;
//   padding: 15px 10px;
//   border-radius: 10px;
//   font-size: 1rem;
//   font-weight: 600;
//   cursor: pointer;
//   transition: all 0.3s ease;
//   min-height: 90px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   text-align: center;
//   line-height: 1.3;
//   font-family: 'Montserrat', sans-serif;
//   overflow-wrap: break-word;
//   word-wrap: break-word;
//   hyphens: auto;
//   box-sizing: border-box;
//   width: 100%;
// }

// .question-display-container .answer-btn:hover:not(:disabled) {
//   background: #ff6d4d;
//   color: white;
//   transform: translateY(-2px);
//   box-shadow: 0 5px 15px rgba(255, 109, 77, 0.3);
// }

// .question-display-container .answer-btn.correct {
//   background: #4CAF50;
//   border-color: #4CAF50;
//   color: white;
//   animation: correct-flash 0.5s ease-in-out;
// }

// .question-display-container .answer-btn.incorrect {
//   background: #f44336;
//   border-color: #f44336;
//   color: white;
//   animation: incorrect-shake 0.5s ease-in-out;
// }

// .question-display-container .answer-btn:disabled {
//   cursor: not-allowed;
//   opacity: 0.7;
// }

// @keyframes correct-flash {
//   0%, 100% { transform: scale(1); }
//   50% { transform: scale(1.05); }
// }

// @keyframes incorrect-shake {
//   0%, 100% { transform: translateX(0); }
//   25% { transform: translateX(-5px); }
//   75% { transform: translateX(5px); }
// }

// .question-display-container .result {
//   font-size: 1.8rem;
//   font-weight: bold;
//   padding: 15px;
//   border-radius: 10px;
//   margin-top: 5px;
//   flex-shrink: 0;
// }

// .question-display-container .result:contains("Correct") {
//   color: #4CAF50;
// }

// .question-display-container .result:contains("Incorrect"), 
// .question-display-container .result:contains("Time's up") {
//   color: #f44336;
// }

// /* Mobile Landscape Optimizations for Inline Question Display */
// @media screen and (max-width: 1024px) and (orientation: landscape) {
//   .back-button-container {
//     margin-bottom: 15px;
//   }
  
//   .back-button {
//     padding: 8px 16px;
//     font-size: 0.9rem;
//   }
  
//   .question-display-container {
//     padding: 8px;
//     gap: 10px;
//     max-height: calc(100vh - 80px); /* Even more space on mobile landscape */
//   }
  
//   .question-display-container .question-timer {
//     width: 60px;
//     height: 60px;
//     font-size: 1.5rem;
//   }
  
//   .question-display-container .question-header h3 {
//     font-size: 1.3rem;
//   }
  
//   .question-display-container .question {
//     font-size: 1.1rem;
//     line-height: 1.4;
//   }
  
//   .question-display-container .answers {
//     gap: 10px;
//   }
  
//   .question-display-container .answer-btn {
//     padding: 10px 8px;
//     font-size: 0.9rem;
//     min-height: 55px;
//   }
  
//   .question-display-container .result {
//     font-size: 1.5rem;
//     padding: 15px;
//   }
// }

// @media screen and (max-width: 768px) and (orientation: landscape) {
//   .back-button-container {
//     margin-bottom: 10px;
//   }
  
//   .back-button {
//     padding: 6px 12px;
//     font-size: 0.8rem;
//   }
  
//   .question-display-container {
//     padding: 6px;
//     gap: 6px;
//     max-height: calc(100vh - 60px); /* Maximum space for smallest mobile screens */
//   }
  
//   .question-display-container .question-timer {
//     width: 50px;
//     height: 50px;
//     font-size: 1.2rem;
//   }
  
//   .question-display-container .question-header h3 {
//     font-size: 1.1rem;
//     margin: 0;
//   }
  
//   .question-display-container .question {
//     font-size: 1rem;
//     line-height: 1.3;
//   }
  
//   .question-display-container .answers {
//     gap: 8px;
//   }
  
//   .question-display-container .answer-btn {
//     padding: 8px 6px;
//     font-size: 0.8rem;
//     min-height: 45px;
//   }
  
//   .question-display-container .result {
//     font-size: 1.3rem;
//     padding: 12px;
//   }
// }

// /* Mobile Portrait Mode - Emergency Fallback */
// @media screen and (max-width: 768px) and (orientation: portrait) {
//   .question-display-container {
//     padding: 10px;
//     gap: 10px;
//     max-height: calc(100vh - 200px);
//   }
  
//   .question-display-container .answer-btn {
//     min-height: 80px;
//     padding: 12px 8px;
//     font-size: 0.9rem;
//   }
// }
