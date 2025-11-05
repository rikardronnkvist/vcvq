// HTML escaping function to prevent XSS
function escapeHtml(text) {
  if (text == null) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replaceAll(/[&<>"']/g, m => map[m]);
}

let gameState;
try {
  const gameStateStr = sessionStorage.getItem('gameState');
  if (!gameStateStr) {
    console.error('[VCVQ] No game state found, redirecting to index');
    globalThis.location.href = 'index.html';
    throw new Error('No game state'); // Prevent further execution
  }
  gameState = JSON.parse(gameStateStr);
} catch (error) {
  console.error('[VCVQ] Error parsing game state:', error);
  sessionStorage.removeItem('gameState');
  globalThis.location.href = 'index.html';
  throw error; // Prevent further execution
}

if (!gameState) {
  console.error('[VCVQ] No game state found, redirecting to index');
  globalThis.location.href = 'index.html';
}

const { topic, players, questions, language, numQuestions } = gameState;
let currentQuestionIndex = 0;
let currentPlayerIndex = gameState.currentPlayer || 0;
const initialStartingPlayer = gameState.currentPlayer || 0; // Track the random starting player
let playerAnswers = {}; // Tracks which players have answered the current question
let answerShuffles = {}; // Maps question index to shuffled order: { originalIndex: shuffledIndex }

// Player colors - vibrant retro theme matching logo
const playerColors = ['#FF2E97', '#00D9FF', '#FFD700', '#FF8C00', '#9B59B6'];

console.log(`[VCVQ] Game initialized - Topic: ${topic}, Players: ${players.length}, Questions: ${questions.length}, Language: ${language}`);

function init() {
  renderScoreboard();
  renderQuestion();
  
  // Set up end game button
  const endGameBtn = document.getElementById('endGameBtn');
  endGameBtn.textContent = t('endGame', language);
  endGameBtn.addEventListener('click', () => {
    if (confirm(t('confirmEndGame', language))) {
      console.log('[VCVQ] Game ended early by user');
      endGame();
    }
  });
  
  // Set up game over button
  document.getElementById('restartBtn').textContent = t('playAgain', language);
}

function renderScoreboard() {
  const scoreboard = document.getElementById('scoreboard');
  scoreboard.innerHTML = players.map((player, idx) => `
    <div class="player-score ${idx === currentPlayerIndex ? 'active' : ''}" 
         style="border-color: ${playerColors[idx]}">
      <div class="player-number" style="background: ${playerColors[idx]}">${player.id}</div>
      <div class="player-info">
        <div class="player-name">${escapeHtml(player.name)}</div>
        <div class="player-points">${player.score} ${escapeHtml(t('points', language))}</div>
      </div>
    </div>
  `).join('');
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
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

  // Create shuffled order for this question (if not already created)
  if (!answerShuffles[currentQuestionIndex]) {
    const originalIndices = question.options.map((_, idx) => idx);
    const shuffledIndices = shuffleArray(originalIndices);
    
    // Create mapping: originalIndex -> shuffledIndex
    answerShuffles[currentQuestionIndex] = {};
    for (const [shuffledIdx, originalIdx] of shuffledIndices.entries()) {
      answerShuffles[currentQuestionIndex][originalIdx] = shuffledIdx;
    }
    
    console.log(`[VCVQ] Shuffled answer order for question ${currentQuestionIndex + 1}:`, shuffledIndices);
  }

  // Get shuffled order
  const shuffleMap = answerShuffles[currentQuestionIndex];
  const shuffledOptions = question.options.map((option, originalIdx) => ({
    text: option,
    originalIndex: originalIdx,
    shuffledIndex: shuffleMap[originalIdx]
  })).sort((a, b) => a.shuffledIndex - b.shuffledIndex);

  const answersGrid = document.getElementById('answersGrid');
  answersGrid.innerHTML = shuffledOptions.map((item, displayIdx) => `
    <div class="answer-box" data-index="${item.originalIndex}" data-display-index="${displayIdx}">
      <div class="answer-number">${displayIdx + 1}</div>
      <div class="answer-text">${escapeHtml(item.text)}</div>
    </div>
  `).join('');

  setupInteractions();
  
  // Update player badges if any players have already answered
  updatePlayerBadgesOnAnswer();
  
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

  for (const box of answerBoxes) {
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
      
      const selectedIndex = Number.parseInt(box.dataset.index);
      console.log(`[VCVQ] Player ${currentPlayerIndex + 1} dropped on answer ${selectedIndex}`);
      handleAnswer(selectedIndex);
    });

    // Click functionality - click on answer box to select
    box.addEventListener('click', () => {
      const selectedIndex = Number.parseInt(box.dataset.index);
      console.log(`[VCVQ] Player ${currentPlayerIndex + 1} clicked answer ${selectedIndex}`);
      handleAnswer(selectedIndex);
    });
  }
}

function disableInteractions() {
  const playerToken = document.getElementById('playerToken');
  const answerBoxes = document.querySelectorAll('.answer-box');
  
  // Disable dragging
  playerToken.setAttribute('draggable', 'false');
  playerToken.style.opacity = '0';
  playerToken.style.cursor = 'default';
  
  // Disable interactions on answer boxes
  for (const box of answerBoxes) {
    box.style.pointerEvents = 'none';
    box.style.cursor = 'default';
  }
  
  console.log('[VCVQ] Interactions disabled - all players have answered');
}

function clearPlayerBadges(answerBoxes) {
  for (const box of answerBoxes) {
    const existingBadges = box.querySelectorAll('.player-badge');
    for (const badge of existingBadges) {
      badge.remove();
    }
  }
}

function groupPlayersByAnswer(currentAnswers) {
  const answerGroups = {};
  for (const [playerIdx, originalAnswerIdx] of Object.entries(currentAnswers)) {
    if (!answerGroups[originalAnswerIdx]) {
      answerGroups[originalAnswerIdx] = [];
    }
    answerGroups[originalAnswerIdx].push(Number.parseInt(playerIdx));
  }
  return answerGroups;
}

function positionPlayerBadge(badge, playerNumber) {
  const positions = {
    1: { top: '8px', left: '8px', right: 'auto', bottom: 'auto' },
    3: { bottom: '8px', right: '8px', top: 'auto', left: 'auto' },
    4: { bottom: '8px', left: '8px', top: 'auto', right: 'auto' },
    5: { bottom: '8px', left: '50%', top: 'auto', right: 'auto', transform: 'translateX(-50%)' }
  };
  
  const position = positions[playerNumber] || { top: '8px', right: '8px', left: 'auto', bottom: 'auto' };
  Object.assign(badge.style, position);
}

function createPlayerBadge(playerIndex) {
  const badge = document.createElement('div');
  badge.className = 'player-badge';
  badge.textContent = playerIndex + 1;
  badge.style.background = playerColors[playerIndex];
  positionPlayerBadge(badge, playerIndex + 1);
  return badge;
}

function updatePlayerBadgesOnAnswer() {
  const answerBoxes = document.querySelectorAll('.answer-box');
  const shuffleMap = answerShuffles[currentQuestionIndex];
  
  clearPlayerBadges(answerBoxes);
  
  const currentAnswers = playerAnswers[currentQuestionIndex] || {};
  const answerGroups = groupPlayersByAnswer(currentAnswers);
  
  // Add badges for each player's answer, stacked
  for (const [originalAnswerIdx, playerIndices] of Object.entries(answerGroups)) {
    const originalIndex = Number.parseInt(originalAnswerIdx);
    const displayIndex = shuffleMap[originalIndex];
    const answerBox = Array.from(answerBoxes).find(box => 
      Number.parseInt(box.dataset.displayIndex) === displayIndex
    );
    
    if (answerBox) {
      for (const playerIndex of playerIndices) {
        answerBox.appendChild(createPlayerBadge(playerIndex));
      }
    }
  }
}

function handleAnswer(selectedIndex) {
  // Check if all players have already answered - if so, ignore this answer
  const playersAnsweredBefore = Object.keys(playerAnswers[currentQuestionIndex] || {}).length;
  if (playersAnsweredBefore >= players.length) {
    console.log('[VCVQ] All players have already answered, ignoring additional answer');
    return;
  }

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

  // Update player badges on answer boxes
  updatePlayerBadgesOnAnswer();

  // Check if all players have answered this question
  const playersAnswered = Object.keys(playerAnswers[currentQuestionIndex] || {}).length;
  const allPlayersAnswered = playersAnswered === players.length;

  console.log(`[VCVQ] ${playersAnswered}/${players.length} players have answered`);

  if (allPlayersAnswered) {
    // All players have answered, disable interactions and show feedback
    disableInteractions();
    showFeedback();
  } else {
    // Move to next player
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    renderScoreboard();
    renderQuestion();
  }
}

function showFeedback() {
  const question = questions[currentQuestionIndex];
  const answerBoxes = document.querySelectorAll('.answer-box');
  const shuffleMap = answerShuffles[currentQuestionIndex];
  
  console.log('[VCVQ] Showing feedback for all player answers');
  
  // Find the answer box for the correct answer (using original index)
  const correctOriginalIndex = question.correctAnswer;
  const correctDisplayIndex = shuffleMap[correctOriginalIndex];
  const correctBox = Array.from(answerBoxes).find(box => 
    Number.parseInt(box.dataset.displayIndex) === correctDisplayIndex
  );
  if (correctBox) {
    correctBox.classList.add('correct');
  }
  
  // Show which answers were selected (if incorrect)
  for (const [, originalAnswerIdx] of Object.entries(playerAnswers[currentQuestionIndex])) {
    if (originalAnswerIdx !== question.correctAnswer) {
      const displayIndex = shuffleMap[originalAnswerIdx];
      const incorrectBox = Array.from(answerBoxes).find(box => 
        Number.parseInt(box.dataset.displayIndex) === displayIndex
      );
      if (incorrectBox) {
        incorrectBox.classList.add('incorrect');
      }
    }
  }

  // Count correct answers
  const correctCount = Object.entries(playerAnswers[currentQuestionIndex])
    .filter(([_, answerIdx]) => answerIdx === question.correctAnswer)
    .length;

  const feedback = document.getElementById('feedback');
  if (correctCount === players.length) {
    feedback.textContent = t('allCorrect', language);
    feedback.className = 'feedback correct';
  } else if (correctCount === 0) {
    feedback.textContent = t('noneCorrect', language);
    feedback.className = 'feedback incorrect';
  } else {
    feedback.textContent = `${correctCount}/${players.length} ${t('someCorrect', language)}`;
    feedback.className = 'feedback';
    feedback.style.background = '#f3f4f6';
    feedback.style.color = '#333';
  }
  feedback.style.display = 'block';

  // Wait 5 seconds before moving to next question
  setTimeout(() => {
    currentQuestionIndex++;
    
    // Determine next starting player (rotate from initial random starting player)
    const startingPlayerForQuestion = (initialStartingPlayer + currentQuestionIndex) % players.length;
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
    ? `${escapeHtml(winners[0].name)} ${escapeHtml(t('winner', language))}! 🎉`
    : `${escapeHtml(t('tie', language))}! 🎉`;

  console.log(`[VCVQ] Winner(s): ${winners.map(w => w.name).join(', ')}`);

  document.getElementById('winnerText').textContent = winnerText;
  
  const finalScores = document.getElementById('finalScores');
  finalScores.innerHTML = players
    .sort((a, b) => b.score - a.score)
    .map((player) => `
      <div class="final-score" style="border-left: 4px solid ${playerColors[player.id - 1]}">
        <span class="player-name">${escapeHtml(player.name)}</span>
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
  globalThis.location.href = 'index.html';
});

console.log('[VCVQ] Initializing game');
init();
