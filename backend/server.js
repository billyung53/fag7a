const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "https://your-netlify-app.netlify.app"],
    methods: ["GET", "POST"]
  }
});

app.use(cors());

// Game sessions storage (in memory)
const gameSessions = new Map();

// Generate random 6-digit session code
function generateSessionCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Send a ping every 25 seconds to keep connection alive
  const pingInterval = setInterval(() => {
    socket.emit('ping');
  }, 25000);

  // Clean up interval on disconnect
  socket.on('disconnect', () => {
    clearInterval(pingInterval);
  });

  // Host creates a session
  socket.on('create-session', (hostPassword) => {
    if (hostPassword === '9929') { // Simple password check
      const sessionCode = generateSessionCode();
      const gameSession = {
        id: sessionCode,
        hostId: socket.id,
        teams: [],
        gameState: 'waiting', // waiting, lobby, playing, question, results
        currentQuestion: null,
        usedButtons: [], // Changed from Set to Array
        currentTeam: 0,
        timer: 0,
        scores: { team1: 0, team2: 0 },
        hostDisconnected: false
      };
      
      gameSessions.set(sessionCode, gameSession);
      socket.join(sessionCode);
      
      console.log(`Session created: ${sessionCode}. Total sessions: ${gameSessions.size}`);
      console.log(`Current sessions:`, Array.from(gameSessions.keys()));
      
      socket.emit('session-created', { sessionCode, gameSession });
      console.log(`Session created: ${sessionCode}`);
    } else {
      socket.emit('invalid-password');
    }
  });

  // Host reconnects to existing session
  socket.on('reconnect-host', ({ sessionCode }) => {
    const session = gameSessions.get(sessionCode);
    if (session && session.hostDisconnected) {
      console.log(`Host reconnecting to session ${sessionCode}`);
      session.hostId = socket.id;
      session.hostDisconnected = false;
      session.disconnectTime = null;
      socket.join(sessionCode);
      socket.emit('session-reconnected', { sessionCode, gameSession: session });
    }
  });

  // Team joins a session
  socket.on('join-session', ({ sessionCode, teamName }) => {
    console.log(`Attempting to join session: ${sessionCode} with team name: ${teamName}`);
    console.log(`Current sessions:`, Array.from(gameSessions.keys()));
    
    const session = gameSessions.get(sessionCode);
    console.log(`Session found:`, session ? `Yes (${session.teams.length} teams)` : 'No');
    
    if (!session) {
      console.log(`Session ${sessionCode} not found, emitting invalid-session`);
      socket.emit('invalid-session');
      return;
    }

    // Check if this socket is already in the session
    const existingTeam = session.teams.find(team => team.id === socket.id);
    if (existingTeam) {
      console.log(`Socket ${socket.id} already joined as ${existingTeam.name}, rejoining`);
      socket.emit('session-updated', { session });
      return;
    }

    if (session.teams.length >= 2) {
      console.log(`Session ${sessionCode} is full, emitting session-full`);
      socket.emit('session-full');
      return;
    }

    const team = {
      id: socket.id,
      name: teamName,
      teamNumber: session.teams.length + 1
    };

    session.teams.push(team);
    socket.join(sessionCode);
    
    // If 2 teams joined, move to lobby
    if (session.teams.length === 2) {
      session.gameState = 'lobby';
    }

    // Send updated session to ALL participants (host + teams)
    io.to(sessionCode).emit('session-updated', { session });
    console.log(`Team ${teamName} joined session ${sessionCode}, broadcast to all participants`);
  });

  // Host starts the game
  socket.on('start-game', ({ sessionCode, firstTeam }) => {
    const session = gameSessions.get(sessionCode);
    if (session && session.hostId === socket.id) {
      session.gameState = 'playing';
      session.currentTeam = firstTeam;
      
      // Broadcast to ALL participants with complete state
      io.to(sessionCode).emit('session-updated', { session });
      console.log(`Game started in session ${sessionCode}, broadcast to all participants`);
    }
  });

  // Host selects a question
  socket.on('select-question', ({ sessionCode, questionData }) => {
    const session = gameSessions.get(sessionCode);
    if (session && session.hostId === socket.id) {
      session.currentQuestion = questionData;
      session.gameState = 'question';
      session.timer = 30;
      
      const buttonId = `${questionData.categoryIndex}-${questionData.valueIndex}`;
      if (!session.usedButtons.includes(buttonId)) {
        session.usedButtons.push(buttonId);
      }

      // Start timer and broadcast updates
      const countdown = setInterval(() => {
        session.timer--;
        io.to(sessionCode).emit('timer-update', { timer: session.timer, session });
        
        if (session.timer <= 0) {
          clearInterval(countdown);
          session.gameState = 'time-up';
          session.currentQuestion = null;
          
          // Broadcast time up to all participants
          io.to(sessionCode).emit('session-updated', { session });
          
          // Auto-transition back to playing after 3 seconds
          setTimeout(() => {
            session.gameState = 'playing';
            session.currentTeam = session.currentTeam === 1 ? 2 : 1;
            io.to(sessionCode).emit('session-updated', { session });
          }, 3000);
        }
      }, 1000);

      // Broadcast question start to all participants
      io.to(sessionCode).emit('session-updated', { session });
      console.log(`Question started for session ${sessionCode}, sent to ${session.teams.length} teams`);
    }
  });

  // Team submits an answer
  socket.on('submit-answer', ({ sessionCode, answer }) => {
    const session = gameSessions.get(sessionCode);
    if (!session || session.gameState !== 'question') return;

    const team = session.teams.find(t => t.id === socket.id);
    if (!team) return;

    const isCorrect = answer === session.currentQuestion.correct_answer;
    const points = isCorrect ? session.currentQuestion.value : 0;
    
    if (isCorrect) {
      const teamKey = `team${team.teamNumber}`;
      session.scores[teamKey] += points;
    }

    session.gameState = 'answer-result';
    session.lastAnswer = {
      team,
      answer,
      isCorrect,
      points,
      correctAnswer: session.currentQuestion.correct_answer
    };

    // Clear the current question after answer
    session.currentQuestion = null;
    
    // Broadcast result to all participants
    io.to(sessionCode).emit('session-updated', { session });

    // Auto-transition back to playing after 3 seconds
    setTimeout(() => {
      session.gameState = 'playing';
      session.currentTeam = session.currentTeam === 1 ? 2 : 1;
      session.lastAnswer = null;
      io.to(sessionCode).emit('session-updated', { session });
    }, 3000);

    console.log(`Answer submitted by ${team.name}: ${answer} (${isCorrect ? 'Correct' : 'Incorrect'})`);
  });

  // Reset for next question (remove this as it's now automatic)
  socket.on('next-question', ({ sessionCode }) => {
    const session = gameSessions.get(sessionCode);
    if (session && session.hostId === socket.id) {
      session.gameState = 'playing';
      session.currentQuestion = null;
      session.lastAnswer = null;
      io.to(sessionCode).emit('session-updated', { session });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Find which session this user was part of
    let userSession = null;
    let userSessionCode = null;
    
    for (const [sessionCode, session] of gameSessions.entries()) {
      // Check if this is the host
      if (session.hostId === socket.id) {
        console.log(`Host disconnected for session ${sessionCode}, setting grace period`);
        
        // Set a grace period instead of immediate deletion
        session.hostDisconnected = true;
        session.disconnectTime = Date.now();
        
        // Give host 30 seconds to reconnect before cleaning up
        setTimeout(() => {
          const currentSession = gameSessions.get(sessionCode);
          if (currentSession && currentSession.hostDisconnected && currentSession.disconnectTime === session.disconnectTime) {
            console.log(`Grace period expired for session ${sessionCode}, deleting`);
            io.to(sessionCode).emit('host-disconnected');
            gameSessions.delete(sessionCode);
          }
        }, 30000); // 30 second grace period
        
        userSession = session;
        userSessionCode = sessionCode;
        break;
      }
      
      // Check if this is a team member
      const teamIndex = session.teams.findIndex(team => team.id === socket.id);
      if (teamIndex !== -1) {
        console.log(`Team member disconnected from session ${sessionCode}`);
        session.teams.splice(teamIndex, 1);
        userSession = session;
        userSessionCode = sessionCode;
        
        // Don't delete sessions just because teams disconnect
        // Keep the session alive as long as the host exists and isn't disconnected
        console.log(`Session ${sessionCode} now has ${session.teams.length} teams remaining`);
        break;
      }
    }
    
    console.log(`Remaining sessions after disconnect:`, Array.from(gameSessions.keys()));
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
