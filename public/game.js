const gameState = JSON.parse(sessionStorage.getItem('gameState'));

if (!gameState) {
  window.location.href = 'index.html';
}

const { topic, players, questions, language } = gameState;
let currentQuestion = gameState.currentQuestion;
let currentPlayerIndex = gameState.currentPlayer;
let isAnswering = false;

const playerColors = ['#3b82f6', '#ef4444', '#10b981', '#a855f7'];

function init() {
  document.getElementById('topic').textContent = `${language === 'sv' ? 'Ämne' : 'Topic'}: ${topic}`;
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
        <div class="player-points">${player.score} ${language === 'sv' ? 'poäng' : 'points'}</div>
      </div>
    </div>
  `).join('');
}

function renderQuestion() {
  if (currentQuestion >= questions.length) {
    endGame();
    return;
  }

  const question = questions[currentQuestion];
  const currentPlayer = players[currentPlayerIndex];

  document.getElementById('questionNumber').textContent = 
    `${language === 'sv' ? 'Fråga' : 'Question'} ${currentQuestion + 1}/10`;
  document.getElementById('questionText').textContent = question.question;
  
  const playerToken = document.getElementById('playerToken');
  playerToken.textContent = currentPlayer.id;
  playerToken.style.background = playerColors[currentPlayerIndex];
  playerToken.setAttribute('draggable', 'true');
  
  document.getElementById('turnIndicator').textContent = 
    `${currentPlayer.name}${language === 'sv' ? 's tur' : "'s turn"}`;

  const answersGrid = document.getElementById('answersGrid');
  answersGrid.innerHTML = question.options.map((option, idx) => `
    <div class="answer-box" data-index="${idx}">
      <div class="answer-text">${option}</div>
      <div class="drop-zone"></div>
    </div>
  `).join('');

  setupDragAndDrop();
  
  document.getElementById('feedback').style.display = 'none';
  isAnswering = false;
}

function setupDragAndDrop() {
  const playerToken = document.getElementById('playerToken');
  const dropZones = document.querySelectorAll('.drop-zone');

  playerToken.addEventListener('dragstart', (e) => {
    if (isAnswering) return;
    e.dataTransfer.effectAllowed = 'move';
    playerToken.classList.add('dragging');
  });

  playerToken.addEventListener('dragend', () => {
    playerToken.classList.remove('dragging');
  });

  dropZones.forEach(zone => {
    zone.addEventListener('dragover', (e) => {
      if (isAnswering) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', () => {
      zone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', (e) => {
      if (isAnswering) return;
      e.preventDefault();
      zone.classList.remove('drag-over');
      
      const answerBox = zone.closest('.answer-box');
      const selectedIndex = parseInt(answerBox.dataset.index);
      
      handleAnswer(selectedIndex);
    });
  });
}

function handleAnswer(selectedIndex) {
  if (isAnswering) return;
  isAnswering = true;

  const question = questions[currentQuestion];
  const isCorrect = selectedIndex === question.correctAnswer;
  const currentPlayer = players[currentPlayerIndex];

  if (isCorrect) {
    currentPlayer.score += 1;
  }

  const answerBoxes = document.querySelectorAll('.answer-box');
  answerBoxes[selectedIndex].classList.add(isCorrect ? 'correct' : 'incorrect');
  
  if (!isCorrect) {
    answerBoxes[question.correctAnswer].classList.add('correct');
  }

  const feedback = document.getElementById('feedback');
  feedback.textContent = isCorrect 
    ? (language === 'sv' ? '✓ Rätt!' : '✓ Correct!') 
    : (language === 'sv' ? '✗ Fel' : '✗ Incorrect');
  feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
  feedback.style.display = 'block';

  setTimeout(() => {
    currentQuestion++;
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    
    if (currentQuestion < questions.length) {
      renderScoreboard();
      renderQuestion();
    } else {
      endGame();
    }
  }, 2000);
}

function endGame() {
  document.querySelector('.game-area').style.display = 'none';
  document.getElementById('gameOver').style.display = 'block';

  const maxScore = Math.max(...players.map(p => p.score));
  const winners = players.filter(p => p.score === maxScore);

  const winnerText = winners.length === 1
    ? `${winners[0].name} ${language === 'sv' ? 'vinner' : 'wins'}! 🎉`
    : `${language === 'sv' ? 'Oavgjort' : 'Tie'}! 🎉`;

  document.getElementById('winnerText').textContent = winnerText;
  
  const finalScores = document.getElementById('finalScores');
  finalScores.innerHTML = players
    .sort((a, b) => b.score - a.score)
    .map((player) => `
      <div class="final-score" style="border-left: 4px solid ${playerColors[player.id - 1]}">
        <span class="player-name">${player.name}</span>
        <span class="score">${player.score}/10</span>
      </div>
    `).join('');
}

document.getElementById('restartBtn')?.addEventListener('click', () => {
  sessionStorage.setItem('restartPlayers', JSON.stringify(players));
  window.location.href = 'index.html';
});

document.getElementById('newGameBtn')?.addEventListener('click', () => {
  sessionStorage.removeItem('gameState');
  sessionStorage.removeItem('restartPlayers');
  window.location.href = 'index.html';
});

window.addEventListener('load', () => {
  const restartPlayers = sessionStorage.getItem('restartPlayers');
  if (restartPlayers && window.location.pathname.includes('index.html')) {
    const players = JSON.parse(restartPlayers);
    document.getElementById('playerCount').value = players.length;
    
    const event = new Event('change');
    document.getElementById('playerCount').dispatchEvent(event);
    
    players.forEach((player, idx) => {
      document.getElementById(`player${idx + 1}`).value = player.name;
    });
    
    sessionStorage.removeItem('restartPlayers');
  }
});

init();
