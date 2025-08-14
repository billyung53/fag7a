import { React, useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Game.css";
import Rotation from "../../components/ui/Rotation/Rotation";
import GameBuilder from "../../components/ui/GameBuilder/GameBuilder";
import QuestionDisplay from "../../components/game/QuestionDisplay/QuestionDisplay";
import peach from "../../assets/peach.png";

// Add this helper ABOVE export default function Game()
function decodeEntities(str = "") {
  if (!str || typeof str !== "string") return str;
  // Fast replacements for common entities first
  const basic = str
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
  // Use a textarea to catch any remaining entities
  if (!basic.includes("&")) return basic;
  const txt = document.createElement("textarea");
  txt.innerHTML = basic;
  return txt.value;
}

export default function Game() {
  const location = useLocation();
  const navigate = useNavigate();
  const [gameData, setGameData] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(null); // Reserved for future error display
  const [isMobilePortrait, setIsMobilePortrait] = useState(false);

  // Game state management
  const [usedButtons, setUsedButtons] = useState(new Set());
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [currentTeam, setCurrentTeam] = useState(1);

  // 3-step process state
  const [gameStep, setGameStep] = useState(1); // 1: Category Selection, 2: Difficulty Selection, 3: Question Display
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(null);
  // Removed selectedValue & selectedValueIndex (value comes from currentQuestion)

  // Question display state
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [quitConfirming, setQuitConfirming] = useState(false);

  const values = useMemo(() => [100, 200, 300, 400, 500], []);

  // Check if device is mobile and in portrait mode
  useEffect(() => {
    const checkOrientation = () => {
      const isMobile = window.innerWidth <= 768; // Mobile breakpoint
      const isPortrait = window.innerHeight > window.innerWidth;
      setIsMobilePortrait(isMobile && isPortrait);
    };

    // Check on mount
    checkOrientation();

    // Listen for orientation/resize changes
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  useEffect(() => {
    // Get the game data from navigation state
    if (location.state && location.state.gameData) {
      setGameData(location.state.gameData);
    } else {
      // If no game data, redirect back to setup
      navigate("/game-setup");
    }
  }, [location.state, navigate]);

  // Fetch questions when gameData is available
  useEffect(() => {
    const fetchQuestions = async () => {
      if (
        !gameData ||
        !gameData.selectedCategories ||
        gameData.selectedCategories.length === 0
      ) {
        return;
      }

      try {
        setLoading(true);

        const BACKEND_URL = "https://fiveo5a.onrender.com";
        const idsParam = gameData.selectedCategories.join(",");
        const response = await fetch(
          `${BACKEND_URL}/categories/by-ids?ids=${idsParam}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // console.log("Fetched questions:", data);
        setQuestions(data);
      } catch (err) {
        console.error("Error fetching questions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [gameData]);

  // Organize questions by category and value - memoize to prevent excessive re-calculations
  const questionsData = useMemo(() => {
    if (!questions?.categories) {
      return {};
    }

    const organizedQuestions = {};

    questions.categories.forEach((category, categoryIndex) => {
      organizedQuestions[categoryIndex] = {};

      if (category.questions && category.questions.length > 0) {
        category.questions.forEach((question, questionIndex) => {
          if (questionIndex < 5) {
            organizedQuestions[categoryIndex][questionIndex] = {
              ...question,
              value: values[questionIndex],
              categoryTitle: category.title,
            };
          }
        });
      }
    });

    return organizedQuestions;
  }, [questions?.categories, values]);

  const categoryTitles = questions?.categories?.map((cat) => cat.title) || [];

  // Step 1: Handle category selection
  const handleCategorySelect = (categoryIndex) => {
    setSelectedCategoryIndex(categoryIndex);
    setGameStep(2);
  };

  // Step 2: Handle value selection
  const handleValueSelect = (value, valueIndex) => {
    const buttonId = `${selectedCategoryIndex}-${valueIndex}`;

    if (usedButtons.has(buttonId)) return;

    const questionData = questionsData[selectedCategoryIndex]?.[valueIndex];

    if (!questionData) {
      console.error(
        "No question data found for category",
        selectedCategoryIndex,
        "value",
        valueIndex
      );
      return;
    }

    // Create shuffled answers once and store them
    const shuffledAnswers = [
      questionData.correct_answer,
      ...questionData.incorrect_answers,
    ].sort(() => Math.random() - 0.5);

    const questionWithAnswers = {
      ...questionData,
      question: decodeEntities(questionData.question),
      correct_answer: decodeEntities(questionData.correct_answer),
      incorrect_answers: questionData.incorrect_answers.map(decodeEntities),
      categoryIndex: selectedCategoryIndex,
      valueIndex,
      allAnswers: shuffledAnswers.map(decodeEntities),
    };

    setCurrentQuestion(questionWithAnswers);
    setTimeLeft(30);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameStep(3);
  };

  // Timer effect for question step
  useEffect(() => {
    if (gameStep === 3 && timeLeft > 0 && !selectedAnswer && !showResult) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (!showResult) setShowResult(true);
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
  };

  // Handle next team button click
  const handleNextTeam = () => {
    const buttonId = `${currentQuestion.categoryIndex}-${currentQuestion.valueIndex}`;
    setUsedButtons((prev) => new Set([...prev, buttonId]));

    const isCorrect = selectedAnswer === currentQuestion.correct_answer;

    if (isCorrect) {
      if (currentTeam === 1) {
        setTeam1Score((prev) => prev + currentQuestion.value);
      } else {
        setTeam2Score((prev) => prev + currentQuestion.value);
      }
    }

    // Check if game should end (all questions answered)
    const totalQuestions = categoryTitles.length * 5;
    const answeredQuestions = usedButtons.size + 1; // +1 for current question

    if (answeredQuestions >= totalQuestions) {
      setGameEnded(true);
      return;
    }

    setCurrentTeam((prev) => (prev === 1 ? 2 : 1));

    setGameStep(1);
    setSelectedCategoryIndex(null);
    setCurrentQuestion(null);
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

  // Handle quit game with confirmation
  const handleQuitGame = () => {
    if (quitConfirming) {
      // Second click - actually quit
      navigate("/game-setup");
    } else {
      // First click - show confirmation
      setQuitConfirming(true);
      // Reset confirmation after 3 seconds
      setTimeout(() => {
        setQuitConfirming(false);
      }, 3000);
    }
  };

  const handleGameBuilderComplete = () => {
    // This callback can be used if you want to do something specific when the loader finishes
    console.log("Game building animation completed");
  };

  if (!gameData) {
    return (
      <div className="test">
        <h1>Loading...</h1>
        <p>Preparing your game...</p>
      </div>
    );
  }

  const { selectedCategories, teamNames } = gameData;
  // console.log(selectedCategories, teamNames);

  // Determine timer color phase for circular timer (only relevant in question step)
  const timerPhase = timeLeft > 20 ? "green" : timeLeft > 10 ? "yellow" : "red";

  // Show GameBuilder component while API is loading
  if (loading) {
    return <GameBuilder onComplete={handleGameBuilderComplete} />;
  }

  // Show rotation component if mobile and portrait (after loading)
  if (isMobilePortrait) {
    return <Rotation />;
  }

  // Game ended screen
  if (gameEnded) {
    const winner =
      team1Score > team2Score ? teamNames?.team1 : teamNames?.team2;
    const winnerScore = team1Score > team2Score ? team1Score : team2Score;

    return (
      <div className="game-ended">
        <div className="game-ended-content">
          <img src={peach} alt="Peach Logo" className="peach-logo" />
          <h1>Game Over</h1>
          <h2>{winner} Won 🏆</h2>
          <p>Final Score: {winnerScore} points</p>
          <button
            className="play-again-btn"
            onClick={() => navigate("/game-setup")}
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="game-layout">
        {/* Game Content */}
        <div className="game-content">
          {gameStep === 1 && (
            <div className="category-selection-game">
              <div className="categories-grid-game">
                {categoryTitles.map((title, index) => (
                  <div
                    key={index}
                    className="category-card-game"
                    onClick={() => handleCategorySelect(index)}
                  >
                    <h3>{title}</h3>
                    <div className="progress-dots">
                      {values.map((_, valueIndex) => (
                        <div
                          key={valueIndex}
                          className={`dot ${
                            isButtonUsed(index, valueIndex) ? "used" : ""
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {gameStep === 2 && selectedCategoryIndex !== null && (
            <div className="difficulty-selection">
              <h2>{categoryTitles[selectedCategoryIndex]}</h2>
              <div className="values-grid">
                {values.map((value, index) => (
                  <button
                    key={index}
                    className={`value-btn ${
                      isButtonUsed(selectedCategoryIndex, index) ? "used" : ""
                    }`}
                    onClick={() => handleValueSelect(value, index)}
                    disabled={isButtonUsed(selectedCategoryIndex, index)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          )}

          {gameStep === 3 && currentQuestion && (
            <QuestionDisplay
              currentQuestion={currentQuestion}
              selectedAnswer={selectedAnswer}
              showResult={showResult}
              onAnswerClick={handleAnswerClick}
            />
          )}
        </div>
      </div>

      {/* Bottom Bar - Similar to GameSetup */}
      <div className="bottom-bar-game">
        <div className="bottom-content-game">
          {/* Team Scores */}
          <div className="team-scores-section">
            <div
              className={`team-score-compact ${
                currentTeam === 1 ? "active" : ""
              }`}
            >
              <h4>{teamNames?.team1 || "Team 1"}</h4>
              <div className="score">{team1Score}</div>
            </div>
            <div
              className={`team-score-compact ${
                currentTeam === 2 ? "active" : ""
              }`}
            >
              <h4>{teamNames?.team2 || "Team 2"}</h4>
              <div className="score">{team2Score}</div>
            </div>
          </div>
          {/* Action / Timer Area */}
          <div className="action-buttons-game">
            {gameStep === 3 ? (
              <>
                <div
                  className={`circular-timer ${timerPhase} ${
                    timeLeft <= 10 ? "pulse" : ""
                  }`}
                >
                  <span>{timeLeft}</span>
                </div>
                {showResult && (
                  <button className="next-team-btn" onClick={handleNextTeam}>
                    Next Team
                  </button>
                )}
              </>
            ) : (
              <>
                {gameStep > 1 && (
                  <button className="back-btn-game" onClick={handleBackStep}>
                    Back
                  </button>
                )}
                <button
                  className={`quit-game-btn ${
                    quitConfirming ? "confirming" : ""
                  }`}
                  onClick={handleQuitGame}
                >
                  {quitConfirming ? "Are you sure?" : "Quit Game"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
