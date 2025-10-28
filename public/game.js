const gameState = JSON.parse(sessionStorage.getItem('gameState'));

if (!gameState) {
  console.error('[VCVQ] No game state found, redirecting to index');
  window.location.href = 'index.html';
}

const { topic, players, questions, language, numQuestions } = gameState;
let currentQuestionIndex = 0;
let currentPlayerIndex = gameState.currentPlayer || 0;
let playerAnswers = {}; // Tracks which players have answered the current question

// Player colors - now supports 5 players
const playerColors = ['#3b82f6', '#ef4444', '#10b981', '#a855f7', '#f59e0b'];

console.log(`[VCVQ] Game initialized - Topic: ${topic}, Players: ${players.length}, Questions: ${questions.length}, Language: ${language}`);

function init() {
  document.getElementById('topic').textContent = `${t('topicLabel', language)}: ${topic}`;
  renderScoreboard();
  renderQuestion();
}

function renderScoreboard() {
  const scoreboard = document.getElementById('scoreboard');
  scoreboard.innerHTML = players.map((player, idx) => `
    <div class="player-score ${idx === currentPlayerIndex ? 'active' : ''}" 
         style="border-color: ${playerColors[idx]}">
      <div class="player-number" style="background: ${playerColors[idx]}">${player.id}</div>
      <div class="player-info">
        <div class="player-name">${player.name}</div>
        <div class="player-points">${player.score} ${t('points', language)}</div>
      </div>
    </div>
  `).join('');
}

function renderQuestion() {
  if (currentQuestionIndex >= questions.length) {
    console.log('[VCVQ] All questions answered, ending game');
    endGame();
    return;
  }

  const question = questions[currentQuestionIndex];
  const currentPlayer = players[currentPlayerIndex];
  
  console.log(`[VCVQ] Question ${currentQuestionIndex + 1}/${questions.length}, Player ${currentPlayer.id} (${currentPlayer.name})`);

  document.getElementById('questionNumber').textContent = 
    `${t('question', language)} ${currentQuestionIndex + 1}/${questions.length}`;
  document.getElementById('questionText').textContent = question.question;
  
  const playerToken = document.getElementById('playerToken');
  playerToken.textContent = currentPlayer.id;
  playerToken.style.background = playerColors[currentPlayerIndex];
  playerToken.setAttribute('draggable', 'true');
  playerToken.style.opacity = '1';
  
  document.getElementById('turnIndicator').textContent = 
    `${currentPlayer.name}${t('turn', language)}`;

  const answersGrid = document.getElementById('answersGrid');
  answersGrid.innerHTML = question.options.map((option, idx) => `
    <div class="answer-box" data-index="${idx}">
      <div class="answer-text">${option}</div>
    </div>
  `).join('');

  setupInteractions();
  
  document.getElementById('feedback').style.display = 'none';
}

function setupInteractions() {
  const playerToken = document.getElementById('playerToken');
  const answerBoxes = document.querySelectorAll('.answer-box');

  // Drag and drop functionality
  playerToken.addEventListener('dragstart', (e) => {
    e.dataTransfer.effectAllowed = 'move';
    playerToken.classList.add('dragging');
    console.log('[VCVQ] Started dragging player token');
  });

  playerToken.addEventListener('dragend', () => {
    playerToken.classList.remove('dragging');
  });

  answerBoxes.forEach(box => {
    // Allow dropping on the whole answer box
    box.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      box.classList.add('drag-over');
    });

    box.addEventListener('dragleave', () => {
      box.classList.remove('drag-over');
    });

    box.addEventListener('drop', (e) => {
      e.preventDefault();
      box.classList.remove('drag-over');
      
      const selectedIndex = parseInt(box.dataset.index);
      console.log(`[VCVQ] Player ${currentPlayerIndex + 1} dropped on answer ${selectedIndex}`);
      handleAnswer(selectedIndex);
    });

    // Click functionality - click on answer box to select
    box.addEventListener('click', () => {
      const selectedIndex = parseInt(box.dataset.index);
      console.log(`[VCVQ] Player ${currentPlayerIndex + 1} clicked answer ${selectedIndex}`);
      handleAnswer(selectedIndex);
    });
  });
}

function handleAnswer(selectedIndex) {
  const question = questions[currentQuestionIndex];
  const currentPlayer = players[currentPlayerIndex];
  
  // Store the answer
  if (!playerAnswers[currentQuestionIndex]) {
    playerAnswers[currentQuestionIndex] = {};
  }
  playerAnswers[currentQuestionIndex][currentPlayerIndex] = selectedIndex;

  const isCorrect = selectedIndex === question.correctAnswer;
  
  console.log(`[VCVQ] Player ${currentPlayer.name} answered ${isCorrect ? 'correctly' : 'incorrectly'}`);
  
  if (isCorrect) {
    currentPlayer.score += 1;
  }

  // Hide the token
  document.getElementById('playerToken').style.opacity = '0';

  // Check if all players have answered this question
  const playersAnswered = Object.keys(playerAnswers[currentQuestionIndex] || {}).length;
  const allPlayersAnswered = playersAnswered === players.length;

  console.log(`[VCVQ] ${playersAnswered}/${players.length} players have answered`);

  if (allPlayersAnswered) {
    // All players have answered, show feedback
    showFeedback();
  } else {
    // Move to next player
    setTimeout(() => {
      currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
      renderScoreboard();
      renderQuestion();
    }, 1000);
  }
}

function showFeedback() {
  const question = questions[currentQuestionIndex];
  const answerBoxes = document.querySelectorAll('.answer-box');
  
  console.log('[VCVQ] Showing feedback for all player answers');
  
  // Highlight correct answer
  answerBoxes[question.correctAnswer].classList.add('correct');
  
  // Show which answers were selected (if incorrect)
  Object.entries(playerAnswers[currentQuestionIndex]).forEach(([playerIdx, answerIdx]) => {
    if (answerIdx !== question.correctAnswer) {
      answerBoxes[answerIdx].classList.add('incorrect');
    }
  });

  // Count correct answers
  const correctCount = Object.entries(playerAnswers[currentQuestionIndex])
    .filter(([_, answerIdx]) => answerIdx === question.correctAnswer)
    .length;

  const feedback = document.getElementById('feedback');
  if (correctCount === players.length) {
    feedback.textContent = language === 'sv' 
      ? '🎉 Alla svarade rätt!' 
      : '🎉 Everyone answered correctly!';
    feedback.className = 'feedback correct';
  } else if (correctCount === 0) {
    feedback.textContent = language === 'sv' 
      ? '😅 Ingen svarade rätt!' 
      : '😅 No one answered correctly!';
    feedback.className = 'feedback incorrect';
  } else {
    feedback.textContent = language === 'sv' 
      ? `${correctCount}/${players.length} svarade rätt` 
      : `${correctCount}/${players.length} answered correctly`;
    feedback.className = 'feedback';
    feedback.style.background = '#f3f4f6';
    feedback.style.color = '#333';
  }
  feedback.style.display = 'block';

  // Wait 5 seconds before moving to next question
  setTimeout(() => {
    currentQuestionIndex++;
    
    // Determine next starting player (rotate)
    const startingPlayerForQuestion = currentQuestionIndex % players.length;
    currentPlayerIndex = startingPlayerForQuestion;
    
    console.log(`[VCVQ] Moving to next question, starting with player ${currentPlayerIndex + 1}`);
    
    if (currentQuestionIndex < questions.length) {
      renderScoreboard();
      renderQuestion();
    } else {
      endGame();
    }
  }, 5000);
}

function endGame() {
  console.log('[VCVQ] Game ended');
  document.querySelector('.game-area').style.display = 'none';
  document.getElementById('gameOver').style.display = 'block';

  const maxScore = Math.max(...players.map(p => p.score));
  const winners = players.filter(p => p.score === maxScore);

  const winnerText = winners.length === 1
    ? `${winners[0].name} ${t('winner', language)}! 🎉`
    : `${t('tie', language)}! 🎉`;

  console.log(`[VCVQ] Winner(s): ${winners.map(w => w.name).join(', ')}`);

  document.getElementById('winnerText').textContent = winnerText;
  
  const finalScores = document.getElementById('finalScores');
  finalScores.innerHTML = players
    .sort((a, b) => b.score - a.score)
    .map((player) => `
      <div class="final-score" style="border-left: 4px solid ${playerColors[player.id - 1]}">
        <span class="player-name">${player.name}</span>
        <span class="score">${player.score}/${questions.length}</span>
      </div>
    `).join('');
}

document.getElementById('restartBtn')?.addEventListener('click', () => {
  console.log('[VCVQ] Restarting game with same settings');
  const restartData = {
    players: players,
    topic: topic,
    language: language,
    numQuestions: numQuestions,
    numAnswers: questions[0]?.options.length || 6
  };
  sessionStorage.setItem('restartSettings', JSON.stringify(restartData));
  window.location.href = 'index.html';
});

document.getElementById('newGameBtn')?.addEventListener('click', () => {
  console.log('[VCVQ] Starting new game setup');
  sessionStorage.removeItem('gameState');
  sessionStorage.removeItem('restartPlayers');
  sessionStorage.removeItem('restartSettings');
  window.location.href = 'index.html';
});

console.log('[VCVQ] Initializing game');
init();
