// components/HelloPage/HelloPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import JeopardyButton from '../components/JeopardyButton';
import RotationPrompt from '../components/RotationPrompt';
import FloatingPeaches from '../components/FloatingPeaches';
import LoadingScreen from '../components/LoadingScreen';
import useOrientation from '../hooks/useOrientation';
import TeamScorePanel from '../components/HelloPage/TeamScorePanel';
import CategorySelection from '../components/HelloPage/CategorySelection';
import ValueSelection from '../components/HelloPage/ValueSelection';
import QuestionDisplay from '../components/HelloPage/QuestionDisplay';
import './HelloPage.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://fiveo5a.onrender.com';

function HelloPage() {
  const location = useLocation();
  const { selectedCategories, teamNames } = location.state || {};
  const { isPortrait, isMobile } = useOrientation();
  
  const [usedButtons, setUsedButtons] = useState(new Set());
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [currentTeam, setCurrentTeam] = useState(1);
  
  // New state for 3-step process
  const [gameStep, setGameStep] = useState(1);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);
  const [selectedValueIndex, setSelectedValueIndex] = useState(null);
  
  // Question display state
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const [apiResults, setApiResults] = useState([]);
  const hasFetchedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const showRotationPrompt = isMobile && isPortrait;

  const values = [100, 200, 300, 400, 500];

  // Console log the passed data
  useEffect(() => {
    console.log('Team Names:', teamNames);
  }, [selectedCategories, teamNames]);

  // Fetch categories by IDs from backend
  useEffect(() => {
    const fetchCategoriesByIds = async () => {
      if (selectedCategories && selectedCategories.length > 0 && !hasFetchedRef.current) {
        hasFetchedRef.current = true;
        setIsLoading(true);
        setLoadingProgress(0);
        
        try {
          const progressInterval = setInterval(() => {
            setLoadingProgress(prev => {
              if (prev >= 85) {
                clearInterval(progressInterval);
                return prev;
              }
              return prev + Math.random() * 4;
            });
          }, 500);

          const idsParam = selectedCategories.map(category => category.id).join(',');
          console.log("idparams", idsParam);
          
          const response = await fetch(`${BACKEND_URL}/categories/by-ids?ids=${idsParam}`);
          const result = await response.json();
          
          setLoadingProgress(100);
          
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
          hasFetchedRef.current = false;
          setIsLoading(false);
        }
      }
    };

    fetchCategoriesByIds();
  }, [selectedCategories]);

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
    
    const questionData = questionsData[selectedCategoryIndex]?.[valueIndex];
    
    if (!questionData) {
      console.error('No question data found for category', selectedCategoryIndex, 'value', valueIndex);
      return;
    }
    
    setCurrentQuestion({
      ...questionData,
      categoryIndex: selectedCategoryIndex,
      valueIndex: valueIndex,
      allAnswers: [questionData.correct_answer, ...questionData.incorrect_answers].sort(() => Math.random() - 0.5)
    });
    
    console.log('Question Data:', questionData);
    console.log('All Answers:', [questionData.correct_answer, ...questionData.incorrect_answers]);
    
    setTimeLeft(30);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameStep(3);
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

  const handleQuestionComplete = (isCorrect, selectedAnswer) => {
    const buttonId = `${currentQuestion.categoryIndex}-${currentQuestion.valueIndex}`;
    setUsedButtons(prev => new Set([...prev, buttonId]));
    
    if (isCorrect) {
      if (currentTeam === 1) {
        setTeam1Score(prev => prev + currentQuestion.value);
      } else {
        setTeam2Score(prev => prev + currentQuestion.value);
      }
    }
    
    setCurrentTeam(prev => prev === 1 ? 2 : 1);
    
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

  // Organize questions by category and value
  const organizeQuestions = () => {
    if (!apiResults.categories) return {};
    
    const organizedQuestions = {};
    
    apiResults.categories.forEach((category, categoryIndex) => {
      organizedQuestions[categoryIndex] = {};
      
      if (category.questions && category.questions.length > 0) {
        category.questions.forEach((question, questionIndex) => {
          if (questionIndex < 5) {
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

  return (
    <div className="container">
      {isLoading ? (
        <LoadingScreen isVisible={isLoading} progress={loadingProgress} />
      ) : (
        <>
          <FloatingPeaches />
          
          {showRotationPrompt && <RotationPrompt />}
          
          <div className="game-layout">
            <TeamScorePanel 
              team="left"
              teamName={teamNames?.team1}
              score={team1Score}
              isActive={currentTeam === 1}
            />
            
            <div className="jeopardy-grid">
              {gameStep === 1 && (
                <CategorySelection 
                  categoryTitles={categoryTitles}
                  values={values}
                  isButtonUsed={isButtonUsed}
                  onCategorySelect={handleCategorySelect}
                />
              )}

              {gameStep === 2 && selectedCategoryIndex !== null && (
                <ValueSelection 
                  selectedCategoryIndex={selectedCategoryIndex}
                  categoryTitle={categoryTitles[selectedCategoryIndex]}
                  values={values}
                  isButtonUsed={isButtonUsed}
                  questionsData={questionsData}
                  onValueSelect={handleValueSelect}
                  onBackStep={handleBackStep}
                  JeopardyButton={JeopardyButton}
                />
              )}

              {gameStep === 3 && currentQuestion && (
                <QuestionDisplay 
                  currentQuestion={currentQuestion}
                  timeLeft={timeLeft}
                  selectedAnswer={selectedAnswer}
                  showResult={showResult}
                  onAnswerClick={handleAnswerClick}
                />
              )}
            </div>
            
            <TeamScorePanel 
              team="right"
              teamName={teamNames?.team2}
              score={team2Score}
              isActive={currentTeam === 2}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default HelloPage;