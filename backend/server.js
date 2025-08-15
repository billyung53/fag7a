const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "https://your-netlify-app.netlify.app"],
    methods: ["GET", "POST"]
  }
});

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://fvcfsnkhqxwenaqkngen.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2Y2ZzbmtocXh3ZW5hcWtuZ2VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNTc0MzIsImV4cCI6MjA2OTczMzQzMn0.JAtGWJsVk-6Q5_zLtsN7QJpkjZxRCKmINbrVcKu-7Hw';
const supabase = createClient(supabaseUrl, supabaseKey);

const BACKDOOR_PASSWORD = 'admin123';

const adminOTP = '9929';

app.use(cors());
app.use(express.json());

// Simple endpoint to retrieve current admin OTP.
// NOTE: For production move this secret to an environment variable and secure the endpoint.
app.get('/admin/otp', (req, res) => {
  try {
    return res.json({ success: true, otp: adminOTP });
  } catch (err) {
    console.error('Error serving /admin/otp:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Admin full data dump (categories, questions, referal, referal_usage)
// WARNING: This exposes potentially sensitive data. Protect or remove before production.
app.get('/admin/full-dump', async (req, res) => {
  try {
    const started = Date.now();
    const [categoriesRes, questionsRes, referralRes, referralUsageRes] = await Promise.all([
      supabase.from('categories').select('*'),
      supabase.from('questions').select('*'),
      supabase.from('referal').select('*'),
      supabase.from('referal_usage').select('*')
    ]);

    const buildSection = (label, result) => ({
      count: Array.isArray(result.data) ? result.data.length : 0,
      error: result.error ? result.error.message : null,
      data: result.data || []
    });

    const payload = {
      success: true,
      generatedAt: new Date().toISOString(),
      durationMs: Date.now() - started,
      categories: buildSection('categories', categoriesRes),
      questions: buildSection('questions', questionsRes),
      referal: buildSection('referal', referralRes),
      referal_usage: buildSection('referal_usage', referralUsageRes)
    };

    // If any section had an error, set top-level partial flag
    if (payload.categories.error || payload.questions.error || payload.referal.error || payload.referal_usage.error) {
      payload.partial = true;
    }

    return res.json(payload);
  } catch (err) {
    console.error('Error in /admin/full-dump:', err);
    return res.status(500).json({ success: false, error: 'Server error', details: err.message });
  }
});

// API endpoint to verify referral codes
app.post('/verify-referral', async (req, res) => {
  try {
    const { code } = req.body;
    console.log('Verifying referral code:', code);
    // Check backdoor first
    if (code === BACKDOOR_PASSWORD) {
      console.log('Backdoor password used');
      return res.json({ valid: true, isBackdoor: true });
    }
    
    console.log('Checking Supabase table "referal" for code:', code);
    const { data, error } = await supabase
      .from('referal') 
      .select('*')
      .eq('code', code)
      .eq('is_active', true);

    console.log('Supabase response - Data:', data, 'Error:', error);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ valid: false, error: 'Database error' });
    }

    if (data && data.length > 0) {
      console.log('Valid referral code found:', data[0]);
      
      // Log the usage in referal_usage table
      try {
        const { data: usageData, error: usageError } = await supabase
          .from('referal_usage')
          .insert([
            { 
              code: code,
              // created_at: new Date().toISOString()
            }
          ])
          .select();
        
        if (usageError) {
          console.error('Error logging referral usage:', usageError);
          // Continue anyway, don't fail the authentication
        } else {
          console.log('Referral usage logged successfully:', usageData);
        }
      } catch (logError) {
        console.error('Exception while logging referral usage:', logError);
        // Continue anyway, don't fail the authentication
      }
      
      return res.json({ valid: true, isBackdoor: false, referralData: data[0] });
    } else {
      console.log('No matching active referral code found');
      return res.json({ valid: false });
    }
  } catch (error) {
    console.error('Error verifying referral code:', error);
    res.status(500).json({ valid: false, error: 'Server error' });
  }
});

// API endpoint to get all categories
app.get('/categories', async (req, res) => {
  try {
    console.log('Fetching all categories from Supabase table "categories"');
    
    const { data, error } = await supabase
      .from('categories')
      .select('id, title, type, api_id, is_active, created_at, lang, images')
      .eq('is_active', true)
      .order('id', { ascending: true }); // Optional: order by id

    console.log('Supabase response - Data:', data, 'Error:', error);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Database error', details: error.message });
    }

    console.log(`Successfully fetched ${data ? data.length : 0} categories`);
    return res.json({ 
      success: true, 
      categories: data || [],
      count: data ? data.length : 0
    });
    
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});











// API endpoint to get specific categories by IDs
app.get('/categories/by-ids', async (req, res) => {
  try {
    const { ids } = req.query;
    
    if (!ids) {
      return res.status(400).json({ 
        error: 'Missing required parameter', 
        message: 'Please provide "ids" parameter (comma-separated list of category IDs)' 
      });
    }

    // Parse the comma-separated IDs and convert to numbers
    let categoryIds;
    try {
      categoryIds = ids.split(',').map(id => {
        const numId = parseInt(id.trim());
        if (isNaN(numId)) {
          throw new Error(`Invalid ID: ${id}`);
        }
        return numId;
      });
    } catch (parseError) {
      return res.status(400).json({ 
        error: 'Invalid ID format', 
        message: 'IDs must be numeric values separated by commas (e.g., "1,2,3")' 
      });
    }

    
    const { data, error } = await supabase
      .from('categories')
      .select('id, title, type, api_id, is_active, created_at, lang')
      .in('id', categoryIds)
      .eq('is_active', true)
      .order('id', { ascending: true });

    // console.log('Supabase response - Data:', data, 'Error:', error);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Database error', details: error.message });
    }

    const foundIds = data ? data.map(cat => cat.id) : [];
    const missingIds = categoryIds.filter(id => !foundIds.includes(id));

    const catType = data ? data.map(cat => cat.type) : [];
    console.log('Category Type:', catType);

    // Helper function to add delay between API calls
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Process categories and fetch questions for API categories
    for (const category of data) {
      switch (category.type) {
        case 'api':
          // Process API categories - fetch questions from Open Trivia DB
          console.log(`API category: ${category.title}, api_id: ${category.api_id}`);
          
          try {
            // First, try to get all 5 questions in a single call for better performance
            const singleUrl = `https://opentdb.com/api.php?amount=5&category=${category.api_id}&type=multiple`;
            console.log(`Fetching 5 questions from: ${singleUrl}`);
            
            let response = await fetch(singleUrl);
            let triviaData = await response.json();
            
            if (triviaData.response_code === 0 && triviaData.results && triviaData.results.length >= 5) {
              // Success with single call - much faster!
              category.questions = triviaData.results.slice(0, 5);
              console.log(`✅ Successfully fetched ${category.questions.length} questions for ${category.title} in single call`);
            } else if (triviaData.response_code === 1) {
              // Not enough questions available for 5, try fallback approach
              console.log(`⚠️  Not enough questions for 5 in ${category.title}, trying individual difficulty calls...`);
              
              const apiUrls = [
                `https://opentdb.com/api.php?amount=2&category=${category.api_id}&difficulty=easy&type=multiple`,
                `https://opentdb.com/api.php?amount=2&category=${category.api_id}&difficulty=medium&type=multiple`,
                `https://opentdb.com/api.php?amount=1&category=${category.api_id}&difficulty=hard&type=multiple`
              ];

              category.questions = [];

              for (let i = 0; i < apiUrls.length; i++) {
                const url = apiUrls[i];
                console.log(`Fetching questions from: ${url}`);
                
                try {
                  response = await fetch(url);
                  triviaData = await response.json();
                  
                  if (triviaData.response_code === 0 && triviaData.results) {
                    category.questions.push(...triviaData.results);
                    console.log(`Successfully fetched ${triviaData.results.length} questions for ${category.title}`);
                  } else if (triviaData.response_code === 1) {
                    console.warn(`⚠️  No questions available for this difficulty in ${category.title}`);
                  } else if (triviaData.response_code === 5) {
                    console.warn(`⚠️  Rate limit hit for ${category.title}, waiting 6 seconds...`);
                    await delay(6000); // Wait 6 seconds for rate limit
                    // Retry the same request
                    response = await fetch(url);
                    triviaData = await response.json();
                    if (triviaData.response_code === 0 && triviaData.results) {
                      category.questions.push(...triviaData.results);
                      console.log(`✅ Retry successful: fetched ${triviaData.results.length} questions for ${category.title}`);
                    }
                  } else {
                    console.warn(`API returned error code ${triviaData.response_code} for ${category.title}:`, triviaData);
                  }
                } catch (fetchError) {
                  console.error(`Error fetching from ${url}:`, fetchError.message);
                }

                // Wait 6 seconds between requests to respect rate limit
                if (i < apiUrls.length - 1) {
                  console.log('Waiting 6 seconds before next API call to respect rate limit...');
                  await delay(6000);
                }
              }
            } else if (triviaData.response_code === 5) {
              console.warn(`⚠️  Rate limit hit on initial call for ${category.title}, waiting and retrying...`);
              await delay(6000);
              // Retry the single call
              response = await fetch(singleUrl);
              triviaData = await response.json();
              if (triviaData.response_code === 0 && triviaData.results) {
                category.questions = triviaData.results.slice(0, 5);
                console.log(`✅ Retry successful: fetched ${category.questions.length} questions for ${category.title}`);
              } else {
                // If retry fails, fall back to individual calls
                console.log(`⚠️  Retry failed, falling back to individual difficulty calls...`);
                category.questions = [];
                // ... (fallback logic would go here if needed)
              }
            } else {
              console.warn(`API returned error code ${triviaData.response_code} for ${category.title}:`, triviaData);
              category.questions = [];
            }

            console.log(`Total questions fetched for ${category.title}: ${category.questions.length}`);
            
          } catch (error) {
            console.error(`Error processing API category ${category.title}:`, error);
            category.questions = []; // Set empty array if failed
          }
          break;
          
        case 'custom':
          // Process custom categories - fetch questions from Supabase 'questions' table
          console.log(`Custom category: ${category.title}, ID: ${category.id}`);
          
          try {
            // Fetch 2 easy, 2 medium, and 1 hard question from the database
            const difficulties = [
              { difficulty: 'easy', count: 2 },
              { difficulty: 'medium', count: 2 },
              { difficulty: 'hard', count: 1 }
            ];

            category.questions = [];

            for (const diffLevel of difficulties) {
              console.log(`Fetching ${diffLevel.count} ${diffLevel.difficulty} questions for category ${category.id}`);
              
              const { data: questions } = await supabase
                .from('questions')
                .select('*')
                .eq('category', category.id)
                .eq('difficulty', diffLevel.difficulty);

              const selectedQuestions = questions
                .sort(() => Math.random() - 0.5)
                .slice(0, diffLevel.count);

              // Transform database format to match API format
              const transformedQuestions = selectedQuestions.map(q => ({
                question: q.title,
                correct_answer: q.correct,
                incorrect_answers: [q.incorrect1, q.incorrect2, q.incorrect3].filter(ans => ans && ans.trim() !== ''),
                difficulty: q.difficulty,
                category: category.title,
                type: q.type || 'multiple'
              }));

              category.questions.push(...transformedQuestions);
              console.log(`✅ Successfully fetched ${selectedQuestions.length} ${diffLevel.difficulty} questions for ${category.title}`);
            }

            console.log(`Total custom questions fetched for ${category.title}: ${category.questions.length}`);
            
          } catch (error) {
            console.error(`Error processing custom category ${category.title}:`, error);
            category.questions = []; // Set empty array if failed
          }
          break;
          
        default:
          console.log(`Unknown type: ${category.type}`);
      }

      // Add delay between categories to respect rate limiting
      await delay(6000); // 6 seconds between categories to be safe
    }

    // Generate final summary of all fetched questions
    console.log('\n==================== FINAL QUESTION FETCH SUMMARY ====================');
    let totalQuestions = 0;
    let apiCategoriesProcessed = 0;
    let customCategories = 0;
    let failedCategories = 0;

    data.forEach(category => {
      if (category.type === 'api') {
        apiCategoriesProcessed++;
        const questionCount = category.questions ? category.questions.length : 0;
        totalQuestions += questionCount;
        
        if (questionCount === 0) {
          failedCategories++;
          console.log(`❌ ${category.title} (API ID: ${category.api_id}): 0 questions (FAILED)`);
        } else {
          console.log(`✅ ${category.title} (API ID: ${category.api_id}): ${questionCount} questions`);
        }
      } else if (category.type === 'custom') {
        customCategories++;
        const questionCount = category.questions ? category.questions.length : 0;
        totalQuestions += questionCount;
        
        if (questionCount === 0) {
          failedCategories++;
          console.log(`❌ ${category.title} (Custom ID: ${category.id}): 0 questions (FAILED)`);
        } else {
          console.log(`📝 ${category.title} (Custom ID: ${category.id}): ${questionCount} questions`);
        }
      }
    });

    console.log('─'.repeat(70));
    console.log(`📊 SUMMARY:`);
    console.log(`   • Total categories processed: ${data.length}`);
    console.log(`   • API categories: ${apiCategoriesProcessed}`);
    console.log(`   • Custom categories: ${customCategories}`);
    console.log(`   • Failed fetches: ${failedCategories}`);
    console.log(`   • Total questions fetched: ${totalQuestions}`);
    console.log(`   • Expected questions per category: 5`);
    console.log(`   • Success rate: ${data.length > 0 ? Math.round(((data.length - failedCategories) / data.length) * 100) : 0}%`);
    console.log('='.repeat(70));
    console.log('');

    
    console.log(`Successfully fetched ${data ? data.length : 0} categories`);
    if (missingIds.length > 0) {
      console.log(`Warning: Categories not found for IDs: [${missingIds.join(', ')}]`);
    }
    
    return res.json({ 
      success: true, 
      categories: data || [],
      count: data ? data.length : 0,
      catTypes: catType,
      // requestedIds: categoryIds,
      // foundIds: foundIds,
      // missingIds: missingIds
    });
    
  } catch (error) {
    console.error('Error fetching categories by IDs:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});




















// Testing/wake-up API endpoint
app.get('/wake-up', async (req, res) => {
  try {
    console.log('Wake-up endpoint called - testing database connection');
    
    // Perform a simple database query to wake up the connection
    const { data, error } = await supabase
      .from('categories')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Wake-up database test failed:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Database connection failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }

    console.log('Wake-up successful - database connection active');
    return res.json({ 
      success: true, 
      message: 'Server and database are active',
      timestamp: new Date().toISOString(),
      status: 'awake'
    });
    
  } catch (error) {
    console.error('Wake-up endpoint error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during wake-up',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});


















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
