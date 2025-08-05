import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import JeopardyButton from '../components/JeopardyButton';
import QuestionModal from '../components/QuestionModal';
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

  const handleButtonClick = (value, categoryIndex, valueIndex) => {
    const buttonId = `${categoryIndex}-${valueIndex}`;
    
    if (usedButtons.has(buttonId)) return;
    
    // Get the actual question data from the organized questions
    const questionData = questionsData[categoryIndex]?.[valueIndex];
    
    if (!questionData) {
      console.error('No question data found for category', categoryIndex, 'value', valueIndex);
      return;
    }
    
    setCurrentQuestion({
      ...questionData,
      categoryIndex: categoryIndex,
      valueIndex: valueIndex,
      // Combine correct and incorrect answers and shuffle them
      allAnswers: [questionData.correct_answer, ...questionData.incorrect_answers].sort(() => Math.random() - 0.5)
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

  // // Fetch sample questions from OpenTDB API for each category
  // useEffect(() => {
  //   const fetchQuestionsForCategories = async () => {
  //     if (ApiIDs.length > 0) {
  //       try {
  //         for (const apiId of ApiIDs) {
  //           console.log(`Fetching question for category ID: ${apiId}`);
  //           const response = await fetch(`https://opentdb.com/api.php?amount=1&category=${apiId}&difficulty=easy&type=multiple`);
  //           const data = await response.json();
  //           console.log(`OpenTDB API Response for category ${apiId}:`, data);
  //         }
  //       } catch (error) {
  //         console.error('Error fetching from OpenTDB API:', error);
  //       }
  //     }
  //   };

  //   fetchQuestionsForCategories();
  // }, [ApiIDs]); // Dependency on ApiIDs so it runs when categories are loaded

  

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
            {/* Left Team Score */}
            <div className={`team-score left ${currentTeam === 1 ? 'active' : ''}`}>
              <div className="score-circle">{team1Score}</div>
              <h3>{teamNames?.team1}</h3>
            </div>
            
            {/* Jeopardy Grid */}
            <div className="jeopardy-grid">
              {/* Category Headers */}
              <div className="category-row">
                {categoryTitles.map((category, index) => (
                  <div key={index} className="category-header">
                    {category}
                  </div>
                ))}
              </div>
              
              {/* Value Rows */}
              {values.map((value, valueIndex) => (
                <div key={value} className="value-row">
                  {categoryTitles.map((_, categoryIndex) => (
                    <JeopardyButton
                      key={`${categoryIndex}-${valueIndex}`}
                      value={value}
                      onClick={() => handleButtonClick(value, categoryIndex, valueIndex)}
                      isUsed={isButtonUsed(categoryIndex, valueIndex)}
                      hasQuestion={!!questionsData[categoryIndex]?.[valueIndex]}
                    />
                  ))}
                </div>
              ))}
            </div>
            
            {/* Right Team Score */}
            <div className={`team-score right ${currentTeam === 2 ? 'active' : ''}`}>
              <div className="score-circle">{team2Score}</div>
              <h3>{teamNames?.team2}</h3>
            </div>
          </div>
          
          <QuestionModal
            isOpen={showModal}
            onClose={handleCloseModal}
            question={currentQuestion?.question}
            category={currentQuestion?.categoryTitle}
            value={currentQuestion?.value}
            answers={currentQuestion?.allAnswers}
            correctAnswer={currentQuestion?.correct_answer}
            onComplete={handleQuestionComplete}
          />
        </>
      )}
    </div>
  );
}

export default HelloPage;
