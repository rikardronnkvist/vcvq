class VCVQGame {
    constructor() {
        this.socket = io();
        this.currentGame = null;
        this.currentPlayer = null;
        this.questions = [];
        this.gameState = null;
        this.selectedPlayerCount = null;
        this.currentLanguage = 'swedish'; // Default to Swedish
        
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
                'turn': 'tur'
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
                'turn': 'turn'
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
            
            // Create players and start game directly
            this.startGame(playerCount);
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

    startGame(playerCount) {
        // Create players with numbers instead of names
        const players = [];
        for (let i = 1; i <= playerCount; i++) {
            players.push({
                name: `Player ${i}`,
                id: i
            });
        }

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
        const questionText = this.translateText('question');
        const ofText = this.translateText('of');
        document.getElementById('question-counter').textContent = `${questionText} ${questionNumber} ${ofText} ${this.questions.length}`;
        
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
        document.getElementById('topic').value = '';
        // Reset to default values
        document.getElementById('player-count').value = '2';
        document.getElementById('question-count').value = '10';
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
