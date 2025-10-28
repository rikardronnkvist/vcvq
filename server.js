const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3030;
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('ERROR: GEMINI_API_KEY environment variable is not set');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Model names in order of preference
const MODEL_NAMES = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro'
];

app.use(express.json());
app.use(express.static('public'));

async function tryGenerateWithModels(prompt) {
  let lastError = null;
  
  for (const modelName of MODEL_NAMES) {
    try {
      console.log(`Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      console.log(`Success with model: ${modelName}`);
      return response.text();
    } catch (error) {
      console.log(`Model ${modelName} failed: ${error.message}`);
      lastError = error;
      continue;
    }
  }
  
  throw new Error(`All models failed. Last error: ${lastError.message}`);
}

app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { topic, language, numQuestions = 10, numAnswers = 6 } = req.body;
    
    console.log(`[VCVQ] Generating quiz - Topic: ${topic}, Language: ${language}, Questions: ${numQuestions}, Answers: ${numAnswers}`);
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const langInstruction = language === 'en' 
      ? 'Generate questions in English.'
      : 'Generera frågor på svenska.';

    const maxAnswerIndex = numAnswers - 1;
    const exampleOptions = Array.from({ length: numAnswers }, (_, i) => `Option ${i + 1}`);

    const prompt = `${langInstruction}

Create exactly ${numQuestions} multiple-choice quiz questions about: ${topic}

IMPORTANT: You must respond ONLY with valid JSON. Do not include any markdown formatting, code blocks, or explanatory text.

Format your response as a JSON array with exactly this structure:
[
  {
    "question": "Question text here?",
    "options": ${JSON.stringify(exampleOptions)},
    "correctAnswer": 0
  }
]

Rules:
- Exactly ${numQuestions} questions
- Each question must have exactly ${numAnswers} answer options
- correctAnswer is the index (0-${maxAnswerIndex}) of the correct option
- Only one correct answer per question
- Make questions engaging and appropriate for a car quiz game
- Vary difficulty from easy to challenging`;

    let text = await tryGenerateWithModels(prompt);

    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const questions = JSON.parse(text);

    if (!Array.isArray(questions) || questions.length !== numQuestions) {
      throw new Error(`Invalid response format: Expected ${numQuestions} questions`);
    }

    questions.forEach((q, idx) => {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== numAnswers || 
          typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > maxAnswerIndex) {
        throw new Error(`Invalid question format at index ${idx}`);
      }
    });

    console.log(`[VCVQ] Successfully generated ${questions.length} questions`);
    res.json({ questions });
  } catch (error) {
    console.error('[VCVQ] Error generating quiz:', error);
    res.status(500).json({ 
      error: 'Failed to generate quiz',
      details: error.message 
    });
  }
});

app.post('/api/generate-player-names', async (req, res) => {
  try {
    const { language, count, topic } = req.body;
    
    console.log(`[VCVQ] Generating ${count} player names in ${language} for topic: ${topic}`);
    
    if (!count || count < 2 || count > 5) {
      return res.status(400).json({ error: 'Count must be between 2 and 5' });
    }

    const positions = {
      sv: ['Förare', 'Fram passagerare', 'Vänster bak', 'Höger bak', 'Mitten bak'],
      en: ['Driver', 'Front Passenger', 'Left Back Passenger', 'Right Back Passenger', 'Middle Back Passenger']
    };

    const topicContext = topic 
      ? (language === 'en' 
        ? ` The quiz topic is "${topic}", so make the names relate to both the car position AND the quiz topic.`
        : ` Quizämnet är "${topic}", så gör namnen relaterade till både bilpositionen OCH quizämnet.`)
      : '';

    const langInstruction = language === 'en' 
      ? `Generate exactly ${count} funny, creative names in English for car passengers in these positions:${topicContext}`
      : `Generera exakt ${count} roliga, kreativa namn på svenska för bilpassagerare i dessa positioner:${topicContext}`;

    const positionList = positions[language].slice(0, count);
    
    const prompt = `${langInstruction}
${positionList.map((pos, i) => `${i + 1}. ${pos}`).join('\n')}

IMPORTANT: You must respond ONLY with valid JSON. Do not include any markdown formatting, code blocks, or explanatory text.

Format your response as a JSON array with exactly ${count} strings (one name per position):
["Name1", "Name2", "Name3"]

Rules:
- Names should be funny, memorable, and family-friendly
- Names should relate to the car position${topic ? ' AND the quiz topic' : ' or driving context'}
- Keep names short (1-2 words max)
- Make them culturally appropriate for ${language === 'sv' ? 'Swedish' : 'English'} speakers
- Be creative and fun!`;

    let text = await tryGenerateWithModels(prompt);

    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const names = JSON.parse(text);

    if (!Array.isArray(names) || names.length !== count) {
      throw new Error(`Invalid response format: Expected ${count} names`);
    }

    console.log(`[VCVQ] Generated player names:`, names);
    res.json({ names });
  } catch (error) {
    console.error('[VCVQ] Error generating player names:', error);
    res.status(500).json({ 
      error: 'Failed to generate player names',
      details: error.message 
    });
  }
});

app.post('/api/generate-topic', async (req, res) => {
  try {
    const { language, count = 1 } = req.body;
    
    console.log(`[VCVQ] Generating ${count} random funny topic(s) in ${language}`);
    
    const langInstruction = language === 'en' 
      ? `Generate ${count} funny, creative, and entertaining quiz topics in English.`
      : `Generera ${count} roliga, kreativa och underhållande quizämnen på svenska.`;

    const responseFormat = count === 1 
      ? '{\n  "topic": "Your funny topic here"\n}'
      : '{\n  "topics": ["Topic 1", "Topic 2", "Topic 3"]\n}';

    const prompt = `${langInstruction}

IMPORTANT: You must respond ONLY with valid JSON. Do not include any markdown formatting, code blocks, or explanatory text.

Format your response as a JSON object with exactly this structure:
${responseFormat}

Rules:
- Generate ${count} creative and fun quiz topic${count > 1 ? 's' : ''}
- Make ${count > 1 ? 'them' : 'it'} suitable for a car quiz game
- Keep ${count > 1 ? 'them' : 'it'} family-friendly
- Make ${count > 1 ? 'them' : 'it'} interesting and engaging
- Can be about pop culture, science, history, geography, entertainment, sports, etc.
- Be creative and unexpected!
- Each topic should be 2-5 words max
- Make ${count > 1 ? 'them' : 'it'} funny or quirky when possible
${count > 1 ? '- All topics should be different and diverse\n- Cover different categories' : ''}

Examples of good topics: "Movie Villains", "Space Oddities", "Swedish Meatballs", "80s Music", "Famous Mustaches"`;

    let text = await tryGenerateWithModels(prompt);

    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const data = JSON.parse(text);

    if (count === 1) {
      if (!data.topic || typeof data.topic !== 'string') {
        throw new Error('Invalid response format: Expected topic string');
      }
      console.log(`[VCVQ] Generated topic: ${data.topic}`);
      res.json({ topic: data.topic });
    } else {
      if (!Array.isArray(data.topics) || data.topics.length !== count) {
        throw new Error(`Invalid response format: Expected ${count} topics`);
      }
      console.log(`[VCVQ] Generated topics:`, data.topics);
      res.json({ topics: data.topics });
    }
  } catch (error) {
    console.error('[VCVQ] Error generating topic:', error);
    res.status(500).json({ 
      error: 'Failed to generate topic',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`[VCVQ] Server running on http://localhost:${PORT}`);
});
