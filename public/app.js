class VCVQGame {
    constructor() {
        this.socket = io();
        this.currentGame = null;
        this.currentPlayer = null;
        this.questions = [];
        this.gameState = null;
        this.selectedPlayerCount = null;
        this.currentLanguage = 'swedish'; // Default to Swedish
        this.playerAnswers = new Map(); // Track which player placed which answer
        this.allPlayersAnswered = false;
        this.activePlayers = new Map(); // Track which players are active
        this.playerSeating = new Map(); // Track player seating positions
        
        // Translation object
        this.translations = {
            swedish: {
                'app-title': '🎯 Vibe Coded Vibe Quiz',
                'app-subtitle': 'Realtids flerspelarquiz',
                'language-label': 'Språk:',
                'topic-label': 'Välj ett ämne för din quiz:',
                'topic-placeholder': 't.ex., Svensk historia, Rymdutforskning, Matlagning...',
                'generate-btn': 'Generera frågor',
                'loading-text': 'Genererar quizfrågor...',
                'player-count-label': 'Antal spelare:',
                'question-count-label': 'Antal frågor:',
                '2-players': '2 Spelare',
                '3-players': '3 Spelare',
                '4-players': '4 Spelare',
                '5-questions': '5 Frågor',
                '10-questions': '10 Frågor',
                '15-questions': '15 Frågor',
                '20-questions': '20 Frågor',
                '25-questions': '25 Frågor',
                'scoreboard': 'Poängtafla',
                'game-finished': '🎉 Spelet är klart!',
                'play-again': 'Spela igen',
                'correct': '✅ Rätt!',
                'incorrect': '❌ Fel',
                'well-done': 'Bra gjort! +1 poäng',
                'correct-answer-was': 'Det rätta svaret var:',
                'points': 'poäng',
                'wins-with': 'vinner med',
                'question': 'Fråga',
                'of': 'av',
                'turn': 'tur',
                'drag-your-number': 'Dra ditt nummer till ett svar:',
                'all-players-placed': 'Alla spelare har placerat sina svar!',
                'waiting-for-players': 'Väntar på att alla spelare ska placera sina svar...',
                'select-players': 'Välj aktiva spelare',
                'start-game': 'Starta spelet',
                'driver': 'Förare',
                'front-passenger': 'Frampassagerare',
                'left-back': 'Vänster bak',
                'right-back': 'Höger bak'
            },
            english: {
                'app-title': '🎯 Vibe Coded Vibe Quiz',
                'app-subtitle': 'Real-time multiplayer quiz game',
                'language-label': 'Language:',
                'topic-label': 'Choose a topic for your quiz:',
                'topic-placeholder': 'e.g., Swedish history, Space exploration, Cooking...',
                'generate-btn': 'Generate Questions',
                'loading-text': 'Generating quiz questions...',
                'player-count-label': 'Number of players:',
                'question-count-label': 'Number of questions:',
                '2-players': '2 Players',
                '3-players': '3 Players',
                '4-players': '4 Players',
                '5-questions': '5 Questions',
                '10-questions': '10 Questions',
                '15-questions': '15 Questions',
                '20-questions': '20 Questions',
                '25-questions': '25 Questions',
                'scoreboard': 'Scoreboard',
                'game-finished': '🎉 Game Finished!',
                'play-again': 'Play Again',
                'correct': '✅ Correct!',
                'incorrect': '❌ Incorrect',
                'well-done': 'Well done! +1 point',
                'correct-answer-was': 'The correct answer was:',
                'points': 'points',
                'wins-with': 'wins with',
                'question': 'Question',
                'of': 'of',
                'turn': 'turn',
                'drag-your-number': 'Drag your number to an answer:',
                'all-players-placed': 'All players have placed their answers!',
                'waiting-for-players': 'Waiting for all players to place their answers...',
                'select-players': 'Select Active Players',
                'start-game': 'Start Game',
                'driver': 'Driver',
                'front-passenger': 'Front Passenger',
                'left-back': 'Left Back',
                'right-back': 'Right Back'
            }
        };
        
        this.initializeEventListeners();
        this.initializeLanguage();
    }

    initializeLanguage() {
        // Set initial language
        document.documentElement.lang = this.currentLanguage === 'swedish' ? 'sv' : 'en';
        this.translatePage();
        
        // Add language change listener
        document.getElementById('language').addEventListener('change', (e) => {
            this.currentLanguage = e.target.value;
            document.documentElement.lang = this.currentLanguage === 'swedish' ? 'sv' : 'en';
            this.translatePage();
        });
    }

    translatePage() {
        // Translate all elements with data-translate attribute
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.translations[this.currentLanguage][key];
            if (translation) {
                element.textContent = translation;
            }
        });

        // Translate placeholders
        document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
            const key = element.getAttribute('data-translate-placeholder');
            const translation = this.translations[this.currentLanguage][key];
            if (translation) {
                element.placeholder = translation;
            }
        });
    }

    translateText(key) {
        return this.translations[this.currentLanguage][key] || key;
    }

    initializeEventListeners() {
        // Landing page
        document.getElementById('generate-btn').addEventListener('click', () => this.generateQuiz());
        document.getElementById('topic').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.generateQuiz();
        });

        // Player selection
        document.getElementById('start-game-btn').addEventListener('click', () => this.startGameWithSeating());

        // Play again
        document.getElementById('play-again-btn').addEventListener('click', () => this.playAgain());

        // Socket events
        this.socket.on('game-started', (data) => this.handleGameStarted(data));
        this.socket.on('player-turn', (data) => this.handlePlayerTurn(data));
        this.socket.on('answer-feedback', (data) => this.handleAnswerFeedback(data));
        this.socket.on('all-answers-feedback', (data) => this.handleAllAnswersFeedback(data));
        this.socket.on('next-question', (data) => this.handleNextQuestion(data));
        this.socket.on('game-finished', (data) => this.handleGameFinished(data));
    }

    async generateQuiz() {
        const topic = document.getElementById('topic').value.trim();
        const language = document.getElementById('language').value;
        const playerCount = parseInt(document.getElementById('player-count').value);
        const questionCount = parseInt(document.getElementById('question-count').value);
        
        if (!topic) {
            const alertMessage = this.currentLanguage === 'swedish' 
                ? 'Vänligen ange ett ämne för din quiz!' 
                : 'Please enter a topic for your quiz!';
            alert(alertMessage);
            return;
        }

        this.showLoading(true);
        
        try {
            const response = await fetch('/api/generate-quiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ topic, language, questionCount })
            });

            if (!response.ok) {
                throw new Error('Failed to generate quiz');
            }

            const data = await response.json();
            this.questions = data.questions;
            
            // Show player selection interface
            this.showPlayerSelection(playerCount);
        } catch (error) {
            console.error('Error generating quiz:', error);
            const errorMessage = this.currentLanguage === 'swedish' 
                ? 'Misslyckades att generera quiz. Försök igen.' 
                : 'Failed to generate quiz. Please try again.';
            alert(errorMessage);
        } finally {
            this.showLoading(false);
        }
    }

    showPlayerSelection(playerCount) {
        // Hide landing page and show player selection
        document.getElementById('landing-page').classList.add('hidden');
        document.getElementById('player-selection').classList.remove('hidden');
        
        // Populate player selection dropdowns
        this.populatePlayerSelection(playerCount);
    }

    populatePlayerSelection(playerCount) {
        const seats = ['driver', 'front-passenger', 'left-back', 'right-back'];
        
        seats.forEach(seat => {
            const select = document.getElementById(`${seat}-player`);
            const checkbox = document.getElementById(`${seat}-active`);
            
            // Clear existing options
            select.innerHTML = '<option value="">Select Player</option>';
            
            // Add player options
            for (let i = 1; i <= playerCount; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `Player ${i}`;
                select.appendChild(option);
            }
            
            // Set default selections
            if (seat === 'driver') {
                select.value = '1';
                checkbox.checked = true;
            } else if (seat === 'front-passenger' && playerCount >= 2) {
                select.value = '2';
                checkbox.checked = true;
            } else if (seat === 'left-back' && playerCount >= 3) {
                select.value = '3';
                checkbox.checked = true;
            } else if (seat === 'right-back' && playerCount >= 4) {
                select.value = '4';
                checkbox.checked = true;
            } else {
                checkbox.checked = false;
            }
            
            // Add event listeners for seat changes
            select.addEventListener('change', () => this.updateSeatSelection());
            checkbox.addEventListener('change', () => this.updateSeatSelection());
        });
        
        this.updateSeatSelection();
    }

    updateSeatSelection() {
        const seats = ['driver', 'front-passenger', 'left-back', 'right-back'];
        
        seats.forEach(seat => {
            const select = document.getElementById(`${seat}-player`);
            const checkbox = document.getElementById(`${seat}-active`);
            const seatElement = document.querySelector(`.seat-selection[data-seat="${seat}"]`);
            
            if (checkbox.checked && select.value) {
                seatElement.classList.remove('inactive');
            } else {
                seatElement.classList.add('inactive');
            }
        });
    }

    startGameWithSeating() {
        // Get active players and their seating
        const activePlayers = [];
        const seats = ['driver', 'front-passenger', 'left-back', 'right-back'];
        
        seats.forEach(seat => {
            const select = document.getElementById(`${seat}-player`);
            const checkbox = document.getElementById(`${seat}-active`);
            
            if (checkbox.checked && select.value) {
                const playerId = parseInt(select.value);
                activePlayers.push({
                    id: playerId,
                    name: `Player ${playerId}`,
                    seat: seat
                });
                
                this.activePlayers.set(playerId, true);
                this.playerSeating.set(playerId, seat);
            }
        });
        
        if (activePlayers.length === 0) {
            const alertMessage = this.currentLanguage === 'swedish' 
                ? 'Välj minst en aktiv spelare!' 
                : 'Please select at least one active player!';
            alert(alertMessage);
            return;
        }
        
        // Start the game with active players
        this.startGame(activePlayers);
    }

    startGame(players) {
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
        // No need to highlight current player since all players answer simultaneously
    }

    handlePlayerTurn(data) {
        this.currentPlayer = data.currentPlayer;
        this.highlightCurrentPlayer();
    }

    handleAnswerFeedback(data) {
        this.showAnswerFeedback(data);
        this.updateScoreboard();
    }

    handleAllAnswersFeedback(data) {
        this.showAllAnswersFeedback(data);
        this.updateScoreboard();
    }

    handleNextQuestion(data) {
        this.displayQuestion(data.currentQuestion, data.questionNumber);
        // No need to highlight current player since all players answer simultaneously
    }

    handleGameFinished(data) {
        this.showGameFinished(data.finalScores, data.winner);
    }

    displayQuestion(question, questionNumber) {
        document.getElementById('question-text').textContent = question.question;
        const questionText = this.translateText('question');
        const ofText = this.translateText('of');
        document.getElementById('question-counter').textContent = `${questionText} ${questionNumber} ${ofText} ${this.questions.length}`;
        
        // Reset player answers for new question
        this.playerAnswers.clear();
        this.allPlayersAnswered = false;
        
        // Create player numbers
        this.createPlayerNumbers();
        
        // Create answer options
        const answerGrid = document.getElementById('answer-options');
        answerGrid.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const answerOption = document.createElement('div');
            answerOption.className = 'answer-option';
            answerOption.textContent = option;
            answerOption.dataset.answerIndex = index;
            
            // Add drop functionality
            this.addDropZone(answerOption);
            
            answerGrid.appendChild(answerOption);
        });
    }

    createPlayerNumbers() {
        const playerNumbersContainer = document.getElementById('player-numbers');
        playerNumbersContainer.innerHTML = '';
        
        if (!this.gameState) return;
        
        this.gameState.players.forEach((player, index) => {
            const playerNumber = document.createElement('div');
            playerNumber.className = `player-number player-${player.id}-bg`;
            playerNumber.textContent = player.id;
            playerNumber.dataset.playerId = player.id;
            playerNumber.draggable = true;
            
            // Add drag functionality
            this.addDragFunctionality(playerNumber);
            
            playerNumbersContainer.appendChild(playerNumber);
        });
    }

    addDragFunctionality(element) {
        element.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.dataset.playerId);
            e.target.classList.add('dragging');
        });

        element.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
        });
    }

    addDropZone(element) {
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
            
            const playerId = parseInt(e.dataTransfer.getData('text/plain'));
            const answerIndex = parseInt(e.target.dataset.answerIndex);
            
            this.placePlayerAnswer(playerId, answerIndex, e.target);
        });
    }

    placePlayerAnswer(playerId, answerIndex, answerElement) {
        // Remove player from any previous answer
        this.removePlayerFromAnswers(playerId);
        
        // Mark player as placed
        const playerElement = document.querySelector(`[data-player-id="${playerId}"]`);
        if (playerElement) {
            playerElement.classList.add('placed');
        }
        
        // Add player to new answer with corner indicator
        this.addPlayerAnswerCorner(answerElement, playerId, answerIndex);
        
        // Store the answer
        this.playerAnswers.set(playerId, answerIndex);
        
        // Check if all players have answered
        this.checkAllPlayersAnswered();
    }

    addPlayerAnswerCorner(answerElement, playerId, answerIndex) {
        const seat = this.playerSeating.get(playerId);
        if (!seat) return;
        
        // Remove any existing corner for this player
        const existingCorner = answerElement.querySelector(`.player-answer-corner[data-player="${playerId}"]`);
        if (existingCorner) {
            existingCorner.remove();
        }
        
        // Create corner indicator
        const corner = document.createElement('div');
        corner.className = `player-answer-corner ${seat}-answer-corner`;
        corner.dataset.player = playerId;
        corner.textContent = playerId;
        
        answerElement.appendChild(corner);
        answerElement.classList.add('has-player');
    }

    removePlayerFromAnswers(playerId) {
        // Remove from any existing answer corner
        const existingCorner = document.querySelector(`.player-answer-corner[data-player="${playerId}"]`);
        if (existingCorner) {
            existingCorner.remove();
        }
        
        // Check if answer element has no more players
        const answerElement = existingCorner?.parentElement;
        if (answerElement) {
            const remainingCorners = answerElement.querySelectorAll('.player-answer-corner');
            if (remainingCorners.length === 0) {
                answerElement.classList.remove('has-player');
            }
        }
        
        // Reset player element
        const playerElement = document.querySelector(`[data-player-id="${playerId}"]`);
        if (playerElement) {
            playerElement.classList.remove('placed');
        }
    }

    getPlayerColor(playerId) {
        const colors = ['#3B82F6', '#EF4444', '#10B981', '#8B5CF6'];
        return colors[playerId - 1] || '#666';
    }

    checkAllPlayersAnswered() {
        if (this.playerAnswers.size === this.gameState.players.length) {
            this.allPlayersAnswered = true;
            this.showAllPlayersPlacedMessage();
            
            // Submit all answers to server
            setTimeout(() => {
                this.submitAllAnswers();
            }, 1000);
        }
    }

    showAllPlayersPlacedMessage() {
        const message = document.createElement('div');
        message.className = 'all-players-message';
        message.textContent = this.translateText('all-players-placed');
        message.style.cssText = `
            text-align: center;
            padding: 15px;
            background: #d4edda;
            color: #155724;
            border: 2px solid #28a745;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: bold;
        `;
        
        const questionContainer = document.getElementById('question-container');
        questionContainer.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 2000);
    }

    submitAllAnswers() {
        if (!this.currentGame || !this.gameState) return;
        
        // Send all player answers to server
        this.socket.emit('submit-all-answers', {
            gameId: this.currentGame,
            answers: Array.from(this.playerAnswers.entries()).map(([playerId, answerIndex]) => ({
                playerId,
                answerIndex
            }))
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
            const correctText = this.translateText('correct');
            const wellDoneText = this.translateText('well-done');
            feedbackContent.innerHTML = `
                <h3>${correctText}</h3>
                <p>${wellDoneText}</p>
            `;
        } else {
            const incorrectText = this.translateText('incorrect');
            const correctAnswerText = this.translateText('correct-answer-was');
            const correctOption = this.gameState.questions[this.gameState.currentQuestionIndex].options[correctAnswer];
            feedbackContent.innerHTML = `
                <h3>${incorrectText}</h3>
                <p>${correctAnswerText} <strong>${correctOption}</strong></p>
            `;
        }
        
        feedbackDiv.classList.remove('hidden');
        
        // Hide feedback after 2 seconds
        setTimeout(() => {
            feedbackDiv.classList.add('hidden');
        }, 2000);
    }

    showAllAnswersFeedback(data) {
        const feedbackDiv = document.getElementById('answer-feedback');
        const feedbackContent = document.getElementById('feedback-content');
        
        const { results, correctAnswer, question } = data;
        const correctOption = question.options[correctAnswer];
        
        // Show correct answer
        const answerOptions = document.querySelectorAll('.answer-option');
        answerOptions.forEach((option, index) => {
            if (index === correctAnswer) {
                option.classList.add('show-correct');
            }
        });
        
        // Create results summary
        const correctPlayers = results.filter(r => r.isCorrect);
        const incorrectPlayers = results.filter(r => !r.isCorrect);
        
        let resultsHTML = `
            <h3>🎯 ${this.translateText('correct-answer-was')} <strong>${correctOption}</strong></h3>
        `;
        
        if (correctPlayers.length > 0) {
            resultsHTML += `<p><strong>✅ ${this.translateText('correct')}:</strong> `;
            resultsHTML += correctPlayers.map(p => `Player ${p.playerId}`).join(', ');
            resultsHTML += `</p>`;
        }
        
        if (incorrectPlayers.length > 0) {
            resultsHTML += `<p><strong>❌ ${this.translateText('incorrect')}:</strong> `;
            resultsHTML += incorrectPlayers.map(p => `Player ${p.playerId}`).join(', ');
            resultsHTML += `</p>`;
        }
        
        feedbackContent.innerHTML = resultsHTML;
        feedbackDiv.className = 'feedback correct';
        feedbackDiv.classList.remove('hidden');
        
        // Hide feedback after 3 seconds
        setTimeout(() => {
            feedbackDiv.classList.add('hidden');
        }, 3000);
    }

    updateScoreboard() {
        if (!this.gameState) return;
        
        // Update car seating layout
        const seats = ['driver', 'front-passenger', 'left-back', 'right-back'];
        
        seats.forEach(seat => {
            const seatElement = document.getElementById(`${seat}-player`);
            if (seatElement) {
                seatElement.innerHTML = '';
                
                // Find player in this seat
                const playerInSeat = this.gameState.players.find(p => this.playerSeating.get(p.id) === seat);
                
                if (playerInSeat && this.activePlayers.get(playerInSeat.id)) {
                    seatElement.innerHTML = `
                        <div class="player-name">${playerInSeat.name}</div>
                        <div class="player-score">${playerInSeat.score}</div>
                    `;
                    
                    // Remove inactive class
                    const carSeat = document.querySelector(`.car-seat[data-seat="${seat}"]`);
                    if (carSeat) {
                        carSeat.classList.remove('inactive');
                    }
                } else {
                    // No player in this seat or player is inactive
                    const carSeat = document.querySelector(`.car-seat[data-seat="${seat}"]`);
                    if (carSeat) {
                        carSeat.classList.add('inactive');
                    }
                }
            }
        });
    }

    highlightCurrentPlayer() {
        if (!this.currentPlayer) return;
        
        const indicator = document.getElementById('current-player-indicator');
        const turnText = this.translateText('turn');
        indicator.innerHTML = `
            <div class="current-player player-${this.currentPlayer.id} player-${this.currentPlayer.id}-bg" style="color: white;">
                ${this.currentPlayer.name} ${turnText}
            </div>
        `;
    }

    showGameFinished(finalScores, winner) {
        this.showPage('game-finished');
        
        const finalScoresDiv = document.getElementById('final-scores');
        const winnerAnnouncement = document.getElementById('winner-announcement');
        
        // Sort players by score
        const sortedPlayers = [...finalScores].sort((a, b) => b.score - a.score);
        const pointsText = this.translateText('points');
        const winsWithText = this.translateText('wins-with');
        
        finalScoresDiv.innerHTML = '';
        sortedPlayers.forEach((player, index) => {
            const scoreItem = document.createElement('div');
            scoreItem.className = `final-score-item ${index === 0 ? 'winner' : ''}`;
            scoreItem.innerHTML = `
                <span class="player-name player-${player.id}">${player.name}</span>
                <span class="player-score">${player.score} ${pointsText}</span>
            `;
            finalScoresDiv.appendChild(scoreItem);
        });
        
        winnerAnnouncement.innerHTML = `🏆 ${winner.name} ${winsWithText} ${winner.score} ${pointsText}!`;
    }

    playAgain() {
        this.showPage('landing-page');
        this.currentGame = null;
        this.currentPlayer = null;
        this.questions = [];
        this.gameState = null;
        this.activePlayers.clear();
        this.playerSeating.clear();
        document.getElementById('topic').value = '';
        // Reset to default values
        document.getElementById('player-count').value = '2';
        document.getElementById('question-count').value = '10';
        
        // Hide player selection
        document.getElementById('player-selection').classList.add('hidden');
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
