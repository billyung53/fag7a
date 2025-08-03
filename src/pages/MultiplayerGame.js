import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import logo from '../assets/logo.png';
import JeopardyButton from '../components/JeopardyButton';
import QuestionModal from '../components/QuestionModal';
import './MultiplayerGame.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://fiveo5a.onrender.com';

function MultiplayerGame() {
  const [socket, setSocket] = useState(null);
  const [gamePhase, setGamePhase] = useState('password'); // password, create-session, host-dashboard
  const [password, setPassword] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [gameSession, setGameSession] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  const categories = [
    'General Knowledge',
    'Geography', 
    'Computers',
    'Gaming',
    'Random'
  ];

  const values = [100, 200, 300, 400, 500];

  useEffect(() => {
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    newSocket.on('session-created', ({ sessionCode, gameSession }) => {
      setSessionCode(sessionCode);
      setGameSession(gameSession);
      setGamePhase('host-dashboard');
    });

    newSocket.on('invalid-password', () => {
      alert('Invalid password! Please try again.');
    });

    // Use unified session-updated event for all state changes
    newSocket.on('session-updated', ({ session }) => {
      console.log('Session updated:', session.gameState);
      setGameSession(session);
      
      // Handle different game states
      if (session.gameState === 'question') {
        setShowQuestionModal(true);
      } else if (session.gameState === 'answer-result' || session.gameState === 'time-up') {
        setShowQuestionModal(false);
      } else if (session.gameState === 'playing') {
        setShowQuestionModal(false);
      }
    });

    // Keep timer update separate for smooth countdown
    newSocket.on('timer-update', ({ timer, session }) => {
      setGameSession(prev => ({ ...prev, timer }));
    });

    return () => newSocket.close();
  }, []);

  const handlePasswordSubmit = () => {
    if (password.length === 4) {
      socket.emit('create-session', password);
    } else {
      alert('Please enter a 4-digit password');
    }
  };

  const handleStartSession = () => {
    setGamePhase('create-session');
  };

  const handleStartGame = (firstTeam) => {
    socket.emit('start-game', { sessionCode, firstTeam });
  };

  const handleQuestionSelect = async (value, categoryIndex, valueIndex) => {
    const buttonId = `${categoryIndex}-${valueIndex}`;
    if (gameSession.usedButtons.includes(buttonId)) return;

    // Fetch question from API
    const questionData = await fetchQuestion(categoryIndex, value);
    socket.emit('select-question', {
      sessionCode,
      questionData: {
        ...questionData,
        value,
        categoryIndex,
        valueIndex
      }
    });
  };

  const fetchQuestion = async (categoryIndex, value) => {
    const difficulty = value <= 200 ? 'easy' : value <= 400 ? 'medium' : 'hard';
    const apis = {
      0: { // General Knowledge
        easy: 'https://opentdb.com/api.php?amount=1&category=9&difficulty=easy&type=multiple',
        medium: 'https://opentdb.com/api.php?amount=1&category=9&difficulty=medium&type=multiple',
        hard: 'https://opentdb.com/api.php?amount=1&category=9&difficulty=hard&type=multiple'
      },
      1: { // Geography
        easy: 'https://opentdb.com/api.php?amount=1&category=22&difficulty=easy&type=multiple',
        medium: 'https://opentdb.com/api.php?amount=1&category=22&difficulty=medium&type=multiple',
        hard: 'https://opentdb.com/api.php?amount=1&category=22&difficulty=hard&type=multiple'
      },
      2: { // Computers
        easy: 'https://opentdb.com/api.php?amount=1&category=18&difficulty=easy&type=multiple',
        medium: 'https://opentdb.com/api.php?amount=1&category=18&difficulty=medium&type=multiple',
        hard: 'https://opentdb.com/api.php?amount=1&category=18&difficulty=hard&type=multiple'
      },
      3: { // Gaming
        easy: 'https://opentdb.com/api.php?amount=1&category=15&difficulty=easy&type=multiple',
        medium: 'https://opentdb.com/api.php?amount=1&category=15&difficulty=medium&type=multiple',
        hard: 'https://opentdb.com/api.php?amount=1&category=15&difficulty=hard&type=multiple'
      },
      4: { // Random
        easy: 'https://opentdb.com/api.php?amount=1&category=31&difficulty=easy&type=multiple',
        medium: 'https://opentdb.com/api.php?amount=1&category=28&difficulty=medium&type=multiple',
        hard: 'https://opentdb.com/api.php?amount=1&category=23&difficulty=hard&type=multiple'
      }
    };

    try {
      const response = await fetch(apis[categoryIndex][difficulty]);
      const data = await response.json();
      return data.results[0];
    } catch (error) {
      console.error('Failed to fetch question:', error);
      return null;
    }
  };

  // Password Phase
  if (gamePhase === 'password') {
    return (
      <div className="container">
        <img src={logo} alt="Logo" className="logo" />
        <div className="password-screen">
          <h1>Host Access</h1>
          <p>Enter 4-digit password to continue</p>
          <input
            type="password"
            maxLength="4"
            placeholder="••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="password-input"
          />
          <button onClick={handlePasswordSubmit} className="submit-button">
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Create Session Phase
  if (gamePhase === 'create-session') {
    return (
      <div className="container">
        <img src={logo} alt="Logo" className="logo" />
        <div className="create-session-screen">
          <h1>Ready to Host</h1>
          <p>Click the button below to start a new game session</p>
          <button onClick={handleStartSession} className="start-session-button">
            Start Session
          </button>
        </div>
      </div>
    );
  }

  // Host Dashboard
  if (gamePhase === 'host-dashboard' && gameSession) {
    return (
      <div className="container">
        <img src={logo} alt="Logo" className="logo" />
        
        <div className="host-dashboard">
          <div className="session-info">
            <h2>Game Session</h2>
            <div className="session-code">
              <span>Session Code:</span>
              <div className="code-display">{sessionCode}</div>
            </div>
          </div>

          {gameSession.gameState === 'waiting' && (
            <div className="waiting-screen">
              <h3>Waiting for teams to join...</h3>
              <p>Teams joined: {gameSession.teams.length}/2</p>
              <div className="join-link">
                <p>Share this link with teams:</p>
                <div className="link-display">
                  {window.location.origin}/join
                </div>
              </div>
            </div>
          )}

          {gameSession.gameState === 'lobby' && (
            <div className="lobby-screen">
              <h3>Teams Ready!</h3>
              <div className="teams-display">
                {gameSession.teams.map((team, index) => (
                  <div key={team.id} className="team-card">
                    <div className="team-name">Team {index + 1}: {team.name}</div>
                  </div>
                ))}
              </div>
              <div className="start-game-controls">
                <h4>Select first team to pick:</h4>
                <div className="team-buttons">
                  {gameSession.teams.map((team, index) => (
                    <button
                      key={team.id}
                      onClick={() => handleStartGame(index + 1)}
                      className="team-select-button"
                    >
                      {team.name} goes first
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {gameSession.gameState === 'playing' && (
            <div className="game-screen">
              <div className="game-status">
                <div className="current-team">
                  Current Team: {gameSession.teams[gameSession.currentTeam - 1]?.name}
                </div>
                <div className="scores">
                  <div className="score">
                    {gameSession.teams[0]?.name}: ${gameSession.scores.team1}
                  </div>
                  <div className="score">
                    {gameSession.teams[1]?.name}: ${gameSession.scores.team2}
                  </div>
                </div>
              </div>

              <div className="jeopardy-grid">
                <div className="category-row">
                  {categories.map((category, index) => (
                    <div key={index} className="category-header">
                      {category}
                    </div>
                  ))}
                </div>
                
                {values.map((value, valueIndex) => (
                  <div key={value} className="value-row">
                    {categories.map((_, categoryIndex) => {
                      const buttonId = `${categoryIndex}-${valueIndex}`;
                      const isUsed = gameSession.usedButtons.includes(buttonId);
                      return (
                        <JeopardyButton
                          key={`${categoryIndex}-${valueIndex}`}
                          value={value}
                          onClick={() => handleQuestionSelect(value, categoryIndex, valueIndex)}
                          isUsed={isUsed}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {gameSession.gameState === 'question' && showQuestionModal && (
            <div className="question-overlay">
              <div className="question-display">
                <h3>Question for {gameSession.teams[gameSession.currentTeam - 1]?.name}</h3>
                <div className="timer-display">{gameSession.timer}s</div>
                {gameSession.currentQuestion && (
                  <div className="question-content">
                    <div className="question-text">
                      {gameSession.currentQuestion.question}
                    </div>
                    <div className="question-options">
                      {[
                        gameSession.currentQuestion.correct_answer,
                        ...gameSession.currentQuestion.incorrect_answers
                      ].sort().map((option, index) => (
                        <div key={index} className="option-display">
                          {String.fromCharCode(65 + index)}) {option}
                        </div>
                      ))}
                    </div>
                    <div className="question-value">
                      Value: ${gameSession.currentQuestion.value}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {(gameSession.gameState === 'answer-result' || gameSession.gameState === 'time-up') && (
            <div className="results-overlay">
              <div className="results-display">
                <h3>
                  {gameSession.gameState === 'time-up' ? 'Time\'s Up!' : 'Answer Result'}
                </h3>
                
                {gameSession.lastAnswer && gameSession.gameState === 'answer-result' && (
                  <div className="answer-result">
                    <div className={`result-indicator ${gameSession.lastAnswer.isCorrect ? 'correct' : 'incorrect'}`}>
                      {gameSession.lastAnswer.team.name}: {gameSession.lastAnswer.isCorrect ? '✓ Correct!' : '✗ Incorrect!'}
                    </div>
                    <div className="answer-details">
                      <p>Answer: {gameSession.lastAnswer.answer}</p>
                      {!gameSession.lastAnswer.isCorrect && (
                        <p>Correct Answer: {gameSession.lastAnswer.correctAnswer}</p>
                      )}
                      <p>Points: ${gameSession.lastAnswer.points}</p>
                    </div>
                  </div>
                )}
                
                <div className="scores-update">
                  <div className="score">
                    {gameSession.teams[0]?.name}: ${gameSession.scores.team1}
                  </div>
                  <div className="score">
                    {gameSession.teams[1]?.name}: ${gameSession.scores.team2}
                  </div>
                </div>
                
                <div className="next-team">
                  Next: {gameSession.teams[gameSession.currentTeam - 1]?.name}
                </div>
                
                <p className="auto-continue">Auto-continuing in 3 seconds...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <div>Loading...</div>;
}

export default MultiplayerGame;
