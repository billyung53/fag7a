import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './TeamPage.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://fiveo5a.onrender.com';

function TeamPage() {
  const [socket, setSocket] = useState(null);
  const [phase, setPhase] = useState('enter-code'); // enter-code, enter-name, lobby, playing
  const [sessionCode, setSessionCode] = useState('');
  const [teamName, setTeamName] = useState('');
  const [gameSession, setGameSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [myTeam, setMyTeam] = useState(null);
  const [isJoining, setIsJoining] = useState(false); // Loading state
  const [shuffledAnswers, setShuffledAnswers] = useState([]); // Store shuffled answers

  useEffect(() => {
    // Only create socket if one doesn't exist
    if (!socket) {
      const newSocket = io(BACKEND_URL, {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
        forceNew: false // Changed to false to reuse connection
      });
      setSocket(newSocket);

    newSocket.on('invalid-session', () => {
      setIsJoining(false);
      alert('Invalid session code!');
    });

    newSocket.on('session-full', () => {
      setIsJoining(false);
      alert('Session is full!');
    });

    // Use unified session-updated event for all state changes
    newSocket.on('session-updated', ({ session }) => {
      console.log('Session updated:', session.gameState, 'Current team:', session.currentTeam, 'My team:', myTeam?.teamNumber);
      setGameSession(session);
      
      // Check if we just joined and need to set our team
      const ourTeam = session.teams.find(team => team.id === newSocket.id);
      if (ourTeam && !myTeam) {
        setMyTeam(ourTeam);
        setIsJoining(false); // Stop loading when successfully joined
      }
      
      // Handle state transitions
      if (session.gameState === 'lobby' && phase !== 'lobby') {
        setPhase('lobby');
      } else if (session.gameState === 'playing' && phase !== 'playing') {
        setPhase('playing');
        setCurrentQuestion(null);
        setSelectedAnswer(null);
        setShowResult(false);
        setShuffledAnswers([]); // Clear shuffled answers
      } else if (session.gameState === 'question') {
        // Always set the current question when state is 'question'
        console.log('Question state detected, setting question:', session.currentQuestion);
        
        // Only shuffle answers if this is a new question
        if (!currentQuestion || currentQuestion.question !== session.currentQuestion.question) {
          setCurrentQuestion(session.currentQuestion);
          // Shuffle answers once when question changes
          const answers = [...session.currentQuestion.incorrect_answers, session.currentQuestion.correct_answer];
          setShuffledAnswers(answers.sort(() => Math.random() - 0.5));
        }
        
        setSelectedAnswer(null);
        setShowResult(false);
      } else if (session.gameState === 'answer-result') {
        // Show results for the team that answered
        if (session.lastAnswer && session.lastAnswer.team.id === newSocket.id) {
          setShowResult(true);
          setSelectedAnswer(session.lastAnswer.answer);
        }
      } else if (session.gameState === 'time-up') {
        // Time ran out
        setCurrentQuestion(null);
        setShowResult(false);
        setShuffledAnswers([]); // Clear shuffled answers
      }
    });

    // Keep timer update separate for smooth countdown
    newSocket.on('timer-update', ({ timer, session }) => {
      setGameSession(prev => ({ ...prev, timer }));
    });

    newSocket.on('host-disconnected', () => {
      alert('Host disconnected. Game ended.');
      setPhase('enter-code');
    });

    // Respond to server ping to keep connection alive
    newSocket.on('ping', () => {
      newSocket.emit('pong');
    });

    // Connection debugging
    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected to server after', attemptNumber, 'attempts');
      // Only rejoin if we were already in a session and not in the joining process
      if (sessionCode && teamName && myTeam && (phase === 'lobby' || phase === 'playing')) {
        console.log('Rejoining session after reconnect');
        newSocket.emit('join-session', { sessionCode: sessionCode.toUpperCase(), teamName });
      }
    });

      return () => newSocket.close();
    }
  }, []); // Remove myTeam from dependencies to prevent reconnections

  const handleJoinSession = () => {
    if (sessionCode.length === 6) {
      setPhase('enter-name');
    } else {
      alert('Please enter a valid 6-character session code');
    }
  };

  const handleSetTeamName = () => {
    if (teamName.trim() && !isJoining) {
      setIsJoining(true);
      socket.emit('join-session', { sessionCode: sessionCode.toUpperCase(), teamName });
      
      // Add timeout to reset loading state in case of network issues
      setTimeout(() => {
        if (isJoining) {
          setIsJoining(false);
          console.log('Join timeout - resetting loading state');
        }
      }, 10000); // 10 second timeout
    } else if (!teamName.trim()) {
      alert('Please enter a team name');
    }
  };

  const handleAnswerSelect = (answer) => {
    if (selectedAnswer || showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer) {
      socket.emit('submit-answer', { sessionCode: sessionCode.toUpperCase(), answer: selectedAnswer });
    }
  };

  const decodeHtml = (html) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  // Enter Session Code
  if (phase === 'enter-code') {
    return (
      <div className="mobile-container">
        <div className="mobile-screen">
          <h1>Join Game</h1>
          <p>Enter the 6-character session code</p>
          <input
            type="text"
            maxLength="6"
            placeholder="ABC123"
            value={sessionCode}
            onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
            className="session-input"
          />
          <button onClick={handleJoinSession} className="join-button">
            Join Session
          </button>
        </div>
      </div>
    );
  }

  // Enter Team Name
  if (phase === 'enter-name') {
    return (
      <div className="mobile-container">
        <div className="mobile-screen">
          <h1>Team Name</h1>
          <p>Enter your team name</p>
          <input
            type="text"
            maxLength="20"
            placeholder="Team Awesome"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="team-input"
          />
          <button 
            onClick={handleSetTeamName} 
            className={`set-name-button ${isJoining ? 'loading' : ''}`}
            disabled={isJoining}
          >
            {isJoining ? (
              <span>
                <span className="loading-spinner"></span>
                Joining...
              </span>
            ) : (
              'Set Team Name'
            )}
          </button>
        </div>
      </div>
    );
  }

  // Lobby - Waiting for game to start
  if (phase === 'lobby') {
    return (
      <div className="mobile-container">
        <div className="mobile-screen">
          <h1>Lobby</h1>
          <div className="team-info">
            <h3>You are: {myTeam?.name}</h3>
            <p>Team {myTeam?.teamNumber}</p>
          </div>
          
          <div className="teams-list">
            <h4>Teams in game:</h4>
            {gameSession?.teams.map((team, index) => (
              <div key={team.id} className={`team-item ${team.id === myTeam?.id ? 'my-team' : ''}`}>
                Team {index + 1}: {team.name}
              </div>
            ))}
          </div>
          
          <div className="waiting-message">
            <p>Waiting for host to start the game...</p>
            <div className="loading-dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Playing - Game in progress
  if (phase === 'playing') {
    const isMyTurn = gameSession?.currentTeam === myTeam?.teamNumber;
    
    return (
      <div className="mobile-container">
        <div className="mobile-screen">
          <div className="game-header">
            <h2>{myTeam?.name}</h2>
            <div className="scores">
              {gameSession?.teams.map((team, index) => (
                <div key={team.id} className="score-item">
                  {team.name}: ${gameSession.scores[`team${index + 1}`]}
                </div>
              ))}
            </div>
          </div>

          {!isMyTurn && !currentQuestion && (
            <div className="waiting-turn">
              <h3>Other team's turn</h3>
              <p>Wait for {gameSession?.teams.find(t => t.teamNumber === gameSession.currentTeam)?.name} to select a question</p>
              <div className="loading-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </div>
            </div>
          )}

          {isMyTurn && !currentQuestion && (
            <div className="turn-indicator">
              <h3>Your Turn!</h3>
              <p>Host is selecting a question for you...</p>
              <div className="loading-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </div>
            </div>
          )}

          {/* Show question to the team whose turn it is */}
          {currentQuestion && isMyTurn && (
            <div className="question-screen">
              <div className="question-header">
                <div className="timer">{gameSession?.timer}s</div>
                <div className="question-value">${currentQuestion.value}</div>
              </div>

              <div className="question-text">
                {decodeHtml(currentQuestion.question)}
              </div>

              <div className="answer-options">
                {shuffledAnswers.map((answer, index) => (
                  <button
                    key={index}
                    className={`answer-option ${selectedAnswer === answer ? 'selected' : ''}`}
                    onClick={() => handleAnswerSelect(answer)}
                    disabled={showResult}
                  >
                    {decodeHtml(answer)}
                  </button>
                ))}
              </div>

              {selectedAnswer && !showResult && (
                <button onClick={handleSubmitAnswer} className="submit-answer-button">
                  Submit Answer
                </button>
              )}

              {showResult && (
                <div className="result-screen">
                  <div className={`result-indicator ${selectedAnswer === currentQuestion.correct_answer ? 'correct' : 'incorrect'}`}>
                    {selectedAnswer === currentQuestion.correct_answer ? '✓ Correct!' : '✗ Incorrect!'}
                  </div>
                  {selectedAnswer !== currentQuestion.correct_answer && (
                    <div className="correct-answer">
                      Correct answer: {decodeHtml(currentQuestion.correct_answer)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Show question to the other team (read-only) */}
          {currentQuestion && !isMyTurn && (
            <div className="question-screen readonly">
              <div className="question-header">
                <div className="timer">{gameSession?.timer}s</div>
                <div className="question-value">${currentQuestion.value}</div>
              </div>

              <div className="turn-info">
                <h3>{gameSession?.teams.find(t => t.teamNumber === gameSession.currentTeam)?.name}'s Turn</h3>
              </div>

              <div className="question-text">
                {decodeHtml(currentQuestion.question)}
              </div>

              <div className="answer-options readonly">
                {shuffledAnswers.map((answer, index) => (
                  <div key={index} className="answer-option readonly">
                    {decodeHtml(answer)}
                  </div>
                ))}
              </div>

              <div className="waiting-answer">
                <p>Waiting for {gameSession?.teams.find(t => t.teamNumber === gameSession.currentTeam)?.name} to answer...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <div>Loading...</div>;
}

export default TeamPage;
