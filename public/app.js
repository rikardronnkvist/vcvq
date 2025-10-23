class VCVQGame {
    constructor() {
        this.socket = io();
        this.currentGame = null;
        this.currentPlayer = null;
        this.questions = [];
        this.gameState = null;
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Landing page
        document.getElementById('generate-btn').addEventListener('click', () => this.generateQuiz());
        document.getElementById('topic').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.generateQuiz();
        });

        // Player setup
        document.querySelectorAll('.player-count-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectPlayerCount(e.target.dataset.count));
        });
        document.getElementById('start-game-btn').addEventListener('click', () => this.startGame());

        // Play again
        document.getElementById('play-again-btn').addEventListener('click', () => this.playAgain());

        // Socket events
        this.socket.on('game-started', (data) => this.handleGameStarted(data));
        this.socket.on('player-turn', (data) => this.handlePlayerTurn(data));
        this.socket.on('answer-feedback', (data) => this.handleAnswerFeedback(data));
        this.socket.on('next-question', (data) => this.handleNextQuestion(data));
        this.socket.on('game-finished', (data) => this.handleGameFinished(data));
    }

    async generateQuiz() {
        const topic = document.getElementById('topic').value.trim();
        const language = document.getElementById('language').value;
        
        if (!topic) {
            alert('Please enter a topic for your quiz!');
            return;
        }

        this.showLoading(true);
        
        try {
            const response = await fetch('/api/generate-quiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ topic, language })
            });

            if (!response.ok) {
                throw new Error('Failed to generate quiz');
            }

            const data = await response.json();
            this.questions = data.questions;
            this.showPage('player-setup');
        } catch (error) {
            console.error('Error generating quiz:', error);
            alert('Failed to generate quiz. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    selectPlayerCount(count) {
        // Update UI
        document.querySelectorAll('.player-count-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.querySelector(`[data-count="${count}"]`).classList.add('selected');

        // Show player name inputs
        const playerNamesDiv = document.getElementById('player-names');
        const playerInputsDiv = document.getElementById('player-inputs');
        
        playerInputsDiv.innerHTML = '';
        
        for (let i = 1; i <= count; i++) {
            const playerInput = document.createElement('div');
            playerInput.className = 'player-input';
            playerInput.innerHTML = `
                <label for="player${i}">Player ${i} Name:</label>
                <input type="text" id="player${i}" placeholder="Enter name..." required>
            `;
            playerInputsDiv.appendChild(playerInput);
        }
        
        playerNamesDiv.classList.remove('hidden');
        
        // Add event listeners to inputs
        document.querySelectorAll('#player-inputs input').forEach(input => {
            input.addEventListener('input', () => this.validatePlayerNames());
        });
    }

    validatePlayerNames() {
        const inputs = document.querySelectorAll('#player-inputs input');
        const allFilled = Array.from(inputs).every(input => input.value.trim() !== '');
        document.getElementById('start-game-btn').disabled = !allFilled;
    }

    startGame() {
        const inputs = document.querySelectorAll('#player-inputs input');
        const players = Array.from(inputs).map(input => ({
            name: input.value.trim()
        }));

        const gameId = 'game_' + Date.now();
        this.currentGame = gameId;
        
        this.socket.emit('join-game', gameId);
        this.socket.emit('start-game', {
            gameId,
            players,
            questions: this.questions
        });
    }

    handleGameStarted(data) {
        this.gameState = data.gameState;
        this.currentPlayer = data.currentPlayer;
        this.showPage('game-page');
        this.updateScoreboard();
        this.displayQuestion(data.currentQuestion, 1);
        this.highlightCurrentPlayer();
    }

    handlePlayerTurn(data) {
        this.currentPlayer = data.currentPlayer;
        this.highlightCurrentPlayer();
    }

    handleAnswerFeedback(data) {
        this.showAnswerFeedback(data);
        this.updateScoreboard();
    }

    handleNextQuestion(data) {
        this.displayQuestion(data.currentQuestion, data.questionNumber);
        this.currentPlayer = data.currentPlayer;
        this.highlightCurrentPlayer();
    }

    handleGameFinished(data) {
        this.showGameFinished(data.finalScores, data.winner);
    }

    displayQuestion(question, questionNumber) {
        document.getElementById('question-text').textContent = question.question;
        document.getElementById('question-counter').textContent = `Question ${questionNumber} of ${this.questions.length}`;
        
        const answerGrid = document.getElementById('answer-options');
        answerGrid.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const answerOption = document.createElement('div');
            answerOption.className = 'answer-option';
            answerOption.draggable = true;
            answerOption.textContent = option;
            answerOption.dataset.answerIndex = index;
            
            // Add drag and drop functionality
            this.addDragAndDrop(answerOption);
            
            answerGrid.appendChild(answerOption);
        });
    }

    addDragAndDrop(element) {
        element.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.dataset.answerIndex);
            e.target.classList.add('dragging');
        });

        element.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
        });

        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.target.classList.add('drag-over');
        });

        element.addEventListener('dragleave', (e) => {
            e.target.classList.remove('drag-over');
        });

        element.addEventListener('drop', (e) => {
            e.preventDefault();
            e.target.classList.remove('drag-over');
            
            const answerIndex = parseInt(e.dataTransfer.getData('text/plain'));
            this.submitAnswer(answerIndex);
        });
    }

    submitAnswer(answerIndex) {
        if (this.currentPlayer && this.gameState) {
            this.socket.emit('submit-answer', {
                gameId: this.currentGame,
                playerId: this.currentPlayer.id,
                answerIndex: answerIndex
            });
        }
    }

    showAnswerFeedback(data) {
        const feedbackDiv = document.getElementById('answer-feedback');
        const feedbackContent = document.getElementById('feedback-content');
        
        const isCorrect = data.isCorrect;
        const correctAnswer = data.correctAnswer;
        
        feedbackDiv.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        
        if (isCorrect) {
            feedbackContent.innerHTML = `
                <h3>✅ Correct!</h3>
                <p>Well done! +1 point</p>
            `;
        } else {
            const correctOption = this.gameState.questions[this.gameState.currentQuestionIndex].options[correctAnswer];
            feedbackContent.innerHTML = `
                <h3>❌ Incorrect</h3>
                <p>The correct answer was: <strong>${correctOption}</strong></p>
            `;
        }
        
        feedbackDiv.classList.remove('hidden');
        
        // Hide feedback after 2 seconds
        setTimeout(() => {
            feedbackDiv.classList.add('hidden');
        }, 2000);
    }

    updateScoreboard() {
        if (!this.gameState) return;
        
        const scoreboard = document.getElementById('scoreboard');
        scoreboard.innerHTML = '';
        
        this.gameState.players.forEach((player, index) => {
            const scoreItem = document.createElement('div');
            scoreItem.className = 'score-item';
            scoreItem.innerHTML = `
                <span class="player-name player-${index + 1}">${player.name}</span>
                <span class="player-score">${player.score}</span>
            `;
            scoreboard.appendChild(scoreItem);
        });
    }

    highlightCurrentPlayer() {
        if (!this.currentPlayer) return;
        
        const indicator = document.getElementById('current-player-indicator');
        indicator.innerHTML = `
            <div class="current-player player-${this.currentPlayer.id} player-${this.currentPlayer.id}-bg" style="color: white;">
                ${this.currentPlayer.name}'s Turn
            </div>
        `;
    }

    showGameFinished(finalScores, winner) {
        this.showPage('game-finished');
        
        const finalScoresDiv = document.getElementById('final-scores');
        const winnerAnnouncement = document.getElementById('winner-announcement');
        
        // Sort players by score
        const sortedPlayers = [...finalScores].sort((a, b) => b.score - a.score);
        
        finalScoresDiv.innerHTML = '';
        sortedPlayers.forEach((player, index) => {
            const scoreItem = document.createElement('div');
            scoreItem.className = `final-score-item ${index === 0 ? 'winner' : ''}`;
            scoreItem.innerHTML = `
                <span class="player-name player-${player.id}">${player.name}</span>
                <span class="player-score">${player.score} points</span>
            `;
            finalScoresDiv.appendChild(scoreItem);
        });
        
        winnerAnnouncement.innerHTML = `🏆 ${winner.name} wins with ${winner.score} points!`;
    }

    playAgain() {
        this.showPage('landing-page');
        this.currentGame = null;
        this.currentPlayer = null;
        this.questions = [];
        this.gameState = null;
        document.getElementById('topic').value = '';
        document.getElementById('player-names').classList.add('hidden');
        document.querySelectorAll('.player-count-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
    }

    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        if (show) {
            loading.classList.remove('hidden');
        } else {
            loading.classList.add('hidden');
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new VCVQGame();
});
