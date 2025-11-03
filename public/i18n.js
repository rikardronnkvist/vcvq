// Internationalization strings for VCVQ
// Works on both client-side (browser) and server-side (Node.js)
const translations = {
  sv: {
    // Landing page
    title: 'Vibe Coded Vibe Quiz',
    subtitle: 'Flerspelar Quiz för Bilen',
    language: 'Språk',
    languageSelector: 'Språk',
    topic: 'Frågeämne',
    topicPlaceholder: 'Ange ett ämne (t.ex. Vetenskap, Filmer, Sport)',
    randomTopic: '🎲 Slumpa',
    customTopic: '✏️ Eget ämne',
    numberOfPlayers: 'Antal spelare',
    numberOfQuestions: 'Antal frågor',
    numberOfAnswers: 'Svar per fråga',
    playerNames: 'Spelarnamn',
    player: 'Spelare',
    generateNames: '🎲 Generera Namn',
    startQuiz: 'Starta Quiz',
    generatingQuiz: 'Genererar frågor...',
    generatingTopics: 'Genererar ämnen...',
    generatingPlayerNames: 'Genererar spelarnamn...',
    enterTopic: 'Ange ett ämne!',
    generateFailed: 'Misslyckades att generera quiz. Försök igen.',
    serviceOverloaded: 'AI-tjänsten är för närvarande överbelastad. Försök igen om några ögonblick.',
    
    // Player positions
    position1: 'Förare',
    position2: 'Fram passagerare',
    position3: 'Höger bak',
    position4: 'Vänster bak',
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
    endGame: 'Avsluta Spelet',
    confirmEndGame: 'Är du säker på att du vill avsluta spelet?',
    
    // Feedback messages
    allCorrect: '🎉 Alla svarade rätt!',
    noneCorrect: '😅 Ingen svarade rätt!',
    someCorrect: 'svarade rätt',
    
    // UI elements
    logoAlt: 'VCVQ Logotyp',
    
    // Answer options
    answers: 'svar',
    
    // Server-side: AI prompt instructions
    aiQuizInstruction: 'Generera frågor på svenska.',
    aiPlayerNamesInstruction: (count, topicContext) => 
      `Generera exakt ${count} roliga, kreativa namn på svenska för bilpassagerare i dessa positioner:${topicContext}`,
    aiPlayerNamesTopicContext: (topic) => 
      ` Quizämnet är "${topic}", så gör namnen relaterade till både bilpositionen OCH quizämnet.`,
    aiTopicsInstruction: (count) => 
      `Generera ${count} roliga, kreativa och underhållande quizämnen på svenska.`,
    aiCulturalContext: 'Swedish',
    
    // Server-side: Language name for prompts
    languageName: 'Swedish'
  },
  en: {
    // Landing page
    title: 'Vibe Coded Vibe Quiz',
    subtitle: 'Car-Friendly Multiplayer Quiz Game',
    language: 'Language',
    languageSelector: 'Language',
    topic: 'Quiz Topic',
    topicPlaceholder: 'Enter any topic (e.g., Science, Movies, Sports)',
    randomTopic: '🎲 Random',
    customTopic: '✏️ Custom',
    numberOfPlayers: 'Number of Players',
    numberOfQuestions: 'Number of Questions',
    numberOfAnswers: 'Answers per Question',
    playerNames: 'Player Names',
    player: 'Player',
    generateNames: '🎲 Generate Names',
    startQuiz: 'Start Quiz',
    generatingQuiz: 'Generating quiz questions...',
    generatingTopics: 'Generating topics...',
    generatingPlayerNames: 'Generating player names...',
    enterTopic: 'Please enter a topic!',
    generateFailed: 'Failed to generate quiz. Please try again.',
    serviceOverloaded: 'The AI service is currently overloaded. Please try again in a few moments.',
    
    // Player positions
    position1: 'Driver',
    position2: 'Front Passenger',
    position3: 'Right Back Passenger',
    position4: 'Left Back Passenger',
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
    endGame: 'End Game',
    confirmEndGame: 'Are you sure you want to end the game?',
    
    // Feedback messages
    allCorrect: '🎉 Everyone answered correctly!',
    noneCorrect: '😅 No one answered correctly!',
    someCorrect: 'answered correctly',
    
    // UI elements
    logoAlt: 'VCVQ Logo',
    
    // Answer options
    answers: 'answers',
    
    // Server-side: AI prompt instructions
    aiQuizInstruction: 'Generate questions in English.',
    aiPlayerNamesInstruction: (count, topicContext) => 
      `Generate exactly ${count} funny, creative names in English for car passengers in these positions:${topicContext}`,
    aiPlayerNamesTopicContext: (topic) => 
      ` The quiz topic is "${topic}", so make the names relate to both the car position AND the quiz topic.`,
    aiTopicsInstruction: (count) => 
      `Generate ${count} funny, creative, and entertaining quiz topics in English.`,
    aiCulturalContext: 'English',
    
    // Server-side: Language name for prompts
    languageName: 'English'
  }
};

// Helper function to get player positions array
function getPositions(lang = 'en') {
  const langTranslations = translations[lang] || translations.en;
  return [
    langTranslations.position1,
    langTranslations.position2,
    langTranslations.position3,
    langTranslations.position4,
    langTranslations.position5
  ];
}

function t(key, lang = 'en', ...args) {
  const langTranslations = translations[lang] || translations.en;
  const value = langTranslations[key];
  
  // Handle function values (for server-side prompt instructions)
  if (typeof value === 'function') {
    // If called from server-side (Node.js), execute the function with arguments
    if (typeof module !== 'undefined' && module.exports) {
      return value(...args);
    }
    // For client-side, return the key if it's a function
    // Functions should only be called server-side
    return key;
  }
  
  return value || translations.en[key] || key;
}

// Export for Node.js (server-side)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    translations,
    t,
    getPositions
  };
}

