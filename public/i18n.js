// Internationalization strings for VCVQ
const translations = {
  sv: {
    // Landing page
    title: 'Vibe Coded Vibe Quiz',
    subtitle: 'Flerspelar Quiz för Bilen',
    language: 'Språk',
    topic: 'Frågeämne',
    topicPlaceholder: 'Ange ett ämne (t.ex. Vetenskap, Filmer, Sport)',
    numberOfPlayers: 'Antal spelare',
    numberOfQuestions: 'Antal frågor',
    numberOfAnswers: 'Antal svar per fråga',
    playerNames: 'Spelarnamn',
    player: 'Spelare',
    startQuiz: 'Starta Quiz',
    generatingQuiz: 'Genererar frågor...',
    enterTopic: 'Ange ett ämne!',
    generateFailed: 'Misslyckades att generera quiz. Försök igen.',
    
    // Player positions
    position1: 'Förare',
    position2: 'Fram passagerare',
    position3: 'Vänster bak',
    position4: 'Höger bak',
    position5: 'Mitten bak',
    
    // Game page
    topicLabel: 'Ämne',
    question: 'Fråga',
    points: 'poäng',
    turn: 's tur',
    correct: '✓ Rätt!',
    incorrect: '✗ Fel',
    winner: 'vinner',
    tie: 'Oavgjort',
    playAgain: 'Spela Igen',
    newGameSetup: 'Ny Spelkonfiguration',
    
    // Answer options
    answers: 'svar'
  },
  en: {
    // Landing page
    title: 'Vibe Coded Vibe Quiz',
    subtitle: 'Car-Friendly Multiplayer Quiz Game',
    language: 'Language',
    topic: 'Quiz Topic',
    topicPlaceholder: 'Enter any topic (e.g., Science, Movies, Sports)',
    numberOfPlayers: 'Number of Players',
    numberOfQuestions: 'Number of Questions',
    numberOfAnswers: 'Number of Answers per Question',
    playerNames: 'Player Names',
    player: 'Player',
    startQuiz: 'Start Quiz',
    generatingQuiz: 'Generating quiz questions...',
    enterTopic: 'Please enter a topic!',
    generateFailed: 'Failed to generate quiz. Please try again.',
    
    // Player positions
    position1: 'Driver',
    position2: 'Front Passenger',
    position3: 'Left Back Passenger',
    position4: 'Right Back Passenger',
    position5: 'Middle Back Passenger',
    
    // Game page
    topicLabel: 'Topic',
    question: 'Question',
    points: 'points',
    turn: "'s turn",
    correct: '✓ Correct!',
    incorrect: '✗ Incorrect',
    winner: 'wins',
    tie: 'Tie',
    playAgain: 'Play Again',
    newGameSetup: 'New Game Setup',
    
    // Answer options
    answers: 'answers'
  }
};

function t(key, lang = 'en') {
  return translations[lang]?.[key] || translations.en[key] || key;
}

