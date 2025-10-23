const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { generateQuizQuestions } = require('./services/quizService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3030;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store active games
const games = new Map();

// API Routes
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { topic, language = 'swedish', questionCount = 10 } = req.body;
    
    console.log('Received request:', { topic, language, questionCount });
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const questions = await generateQuizQuestions(topic, language, questionCount);
    res.json({ questions });
  } catch (error) {
    console.error('Error generating quiz:', error);
    console.error('Error details:', error.message);
    
    // Check if it's an API key issue
    let errorMessage = 'Failed to generate quiz questions';
    let details = error.message;
    
    if (error.message.includes('API key') || error.message.includes('GEMINI_API_KEY')) {
      errorMessage = 'API configuration error';
      details = 'Please check your GEMINI_API_KEY configuration. Make sure you have a valid .env file with your Google Gemini API key.';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: details
    });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-game', (gameId) => {
    socket.join(gameId);
    console.log(`User ${socket.id} joined game ${gameId}`);
  });

  socket.on('start-game', (data) => {
    const { gameId, players, questions } = data;
    
    // Initialize game state
    const gameState = {
      id: gameId,
      players: players.map((player, index) => ({
        ...player,
        id: index + 1,
        score: 0,
        color: ['#3B82F6', '#EF4444', '#10B981', '#8B5CF6'][index] // blue, red, green, purple
      })),
      questions,
      currentQuestionIndex: 0,
      currentPlayerIndex: Math.floor(Math.random() * players.length),
      gameStatus: 'playing',
      answers: new Map()
    };

    games.set(gameId, gameState);
    
    // Emit game started event
    io.to(gameId).emit('game-started', {
      gameState,
      currentQuestion: questions[0],
      currentPlayer: gameState.players[gameState.currentPlayerIndex]
    });
  });

  socket.on('submit-answer', (data) => {
    const { gameId, playerId, answerIndex } = data;
    const game = games.get(gameId);
    
    if (!game || game.gameStatus !== 'playing') return;

    const currentQuestion = game.questions[game.currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    
    // Update player score
    if (isCorrect) {
      game.players[playerId - 1].score += 1;
    }

    // Store answer
    game.answers.set(`${game.currentQuestionIndex}-${playerId}`, {
      playerId,
      answerIndex,
      isCorrect,
      timestamp: Date.now()
    });

    // Emit answer feedback
    io.to(gameId).emit('answer-feedback', {
      playerId,
      answerIndex,
      isCorrect,
      correctAnswer: currentQuestion.correctAnswer,
      playerScore: game.players[playerId - 1].score
    });

    // Move to next player or next question
    setTimeout(() => {
      if (game.currentPlayerIndex < game.players.length - 1) {
        game.currentPlayerIndex++;
        io.to(gameId).emit('player-turn', {
          currentPlayer: game.players[game.currentPlayerIndex],
          currentQuestion: currentQuestion
        });
      } else {
        // All players answered, move to next question
        game.currentQuestionIndex++;
        game.currentPlayerIndex = 0;
        
        if (game.currentQuestionIndex >= game.questions.length) {
          // Game finished
          game.gameStatus = 'finished';
          const winner = game.players.reduce((prev, current) => 
            (prev.score > current.score) ? prev : current
          );
          
          io.to(gameId).emit('game-finished', {
            finalScores: game.players,
            winner
          });
        } else {
          // Next question
          io.to(gameId).emit('next-question', {
            currentQuestion: game.questions[game.currentQuestionIndex],
            currentPlayer: game.players[game.currentPlayerIndex],
            questionNumber: game.currentQuestionIndex + 1
          });
        }
      }
    }, 2000); // 2-second delay for answer review
  });

  socket.on('submit-all-answers', (data) => {
    const { gameId, answers } = data;
    const game = games.get(gameId);
    
    if (!game || game.gameStatus !== 'playing') return;

    const currentQuestion = game.questions[game.currentQuestionIndex];
    const results = [];
    
    // Process all answers
    answers.forEach(({ playerId, answerIndex }) => {
      const isCorrect = answerIndex === currentQuestion.correctAnswer;
      
      // Update player score
      if (isCorrect) {
        game.players[playerId - 1].score += 1;
      }

      // Store answer
      game.answers.set(`${game.currentQuestionIndex}-${playerId}`, {
        playerId,
        answerIndex,
        isCorrect,
        timestamp: Date.now()
      });

      results.push({
        playerId,
        answerIndex,
        isCorrect,
        playerScore: game.players[playerId - 1].score
      });
    });

    // Emit results for all players
    io.to(gameId).emit('all-answers-feedback', {
      results,
      correctAnswer: currentQuestion.correctAnswer,
      question: currentQuestion
    });

    // Move to next question after showing results
    setTimeout(() => {
      game.currentQuestionIndex++;
      
      if (game.currentQuestionIndex >= game.questions.length) {
        // Game finished
        game.gameStatus = 'finished';
        const winner = game.players.reduce((prev, current) => 
          (prev.score > current.score) ? prev : current
        );
        
        io.to(gameId).emit('game-finished', {
          finalScores: game.players,
          winner
        });
      } else {
        // Next question
        io.to(gameId).emit('next-question', {
          currentQuestion: game.questions[game.currentQuestionIndex],
          questionNumber: game.currentQuestionIndex + 1
        });
      }
    }, 3000); // 3-second delay for answer review
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`VCVQ server running on port ${PORT}`);
});
