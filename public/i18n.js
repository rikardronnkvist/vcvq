const STRINGS = {
  sv: {
    topicLabel: 'Ämne (valfritt)',
    playersLabel: 'Antal spelare',
    createGame: 'Skapa spel',
    joinGame: 'Gå med i spel',
    start: 'Starta',
    restart: 'Starta om',
    room: 'Rum',
    topic: 'Ämne',
    score: 'Poäng',
    winners: 'Vinnare'
  },
  en: {
    topicLabel: 'Topic (optional)',
    playersLabel: 'Number of players',
    createGame: 'Create game',
    joinGame: 'Join game',
    start: 'Start',
    restart: 'Restart',
    room: 'Room',
    topic: 'Topic',
    score: 'Score',
    winners: 'Winner(s)'
  }
};
function translate(lang, key){
  return (STRINGS[lang] && STRINGS[lang][key]) || (STRINGS['en'][key]) || key;
}
function setLanguage(lang){
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    el.textContent = translate(lang, key);
  });
  const tagline = document.getElementById('tagline');
  if (tagline){
    tagline.textContent = lang==='sv' ? 'AI-frågesport för bilen – 2–4 spelare, dra och släpp för att svara.' : 'AI-powered car-friendly quiz – 2–4 players, drag & drop to answer.';
  }
}