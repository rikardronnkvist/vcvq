const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3030;
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('ERROR: GEMINI_API_KEY environment variable is not set');
  process.exit(1);
}

// Trust proxy when behind reverse proxy (Docker, nginx, load balancer, etc.)
// This is required for accurate rate limiting by IP address
app.set('trust proxy', 1); // Trust first proxy

const genAI = new GoogleGenerativeAI(API_KEY);

// Rate limiting configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const strictApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // More strict limit for AI generation endpoints
  message: 'Too many quiz generation requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Model names in order of preference
const MODEL_NAMES = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-flash-latest',
  'gemini-2.5-pro',
  'gemini-pro-latest'
];

app.use(express.json({ limit: '1mb' })); // Limit payload size
app.use(express.static('public'));

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Health check endpoint (no rate limiting)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'vcvq',
    version: '1.0.0'
  });
});

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

// Input validation middleware for quiz generation
const validateQuizGeneration = [
  body('topic')
    .trim()
    .notEmpty().withMessage('Topic is required')
    .isLength({ min: 1, max: 200 }).withMessage('Topic must be between 1 and 200 characters')
    .escape(),
  body('language')
    .isIn(['sv', 'en']).withMessage('Language must be either "sv" or "en"'),
  body('numQuestions')
    .optional()
    .isInt({ min: 5, max: 50 }).withMessage('Number of questions must be between 5 and 50'),
  body('numAnswers')
    .optional()
    .isInt({ min: 4, max: 8 }).withMessage('Number of answers must be between 4 and 8')
];

app.post('/api/generate-quiz', strictApiLimiter, validateQuizGeneration, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('[VCVQ] Validation errors:', errors.array());
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array().map(e => e.msg).join(', ')
      });
    }

    const { topic, language, numQuestions = 10, numAnswers = 6 } = req.body;
    
    console.log(`[VCVQ] Generating quiz - Topic: ${topic}, Language: ${language}, Questions: ${numQuestions}, Answers: ${numAnswers}`);

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
    // Don't expose detailed error messages in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    res.status(500).json({ 
      error: 'Failed to generate quiz',
      ...(isDevelopment && { details: error.message })
    });
  }
});

// Input validation middleware for player names
const validatePlayerNames = [
  body('language')
    .isIn(['sv', 'en']).withMessage('Language must be either "sv" or "en"'),
  body('count')
    .isInt({ min: 2, max: 5 }).withMessage('Count must be between 2 and 5'),
  body('topic')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Topic must not exceed 200 characters')
    .escape()
];

app.post('/api/generate-player-names', strictApiLimiter, validatePlayerNames, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('[VCVQ] Validation errors:', errors.array());
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array().map(e => e.msg).join(', ')
      });
    }

    const { language, count, topic } = req.body;
    
    console.log(`[VCVQ] Generating ${count} player names in ${language} for topic: ${topic}`);

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
    const isDevelopment = process.env.NODE_ENV === 'development';
    res.status(500).json({ 
      error: 'Failed to generate player names',
      ...(isDevelopment && { details: error.message })
    });
  }
});

// Input validation middleware for topic generation
const validateTopicGeneration = [
  body('language')
    .isIn(['sv', 'en']).withMessage('Language must be either "sv" or "en"'),
  body('count')
    .optional()
    .isInt({ min: 1, max: 20 }).withMessage('Count must be between 1 and 20')
];

app.post('/api/generate-topic', strictApiLimiter, validateTopicGeneration, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('[VCVQ] Validation errors:', errors.array());
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array().map(e => e.msg).join(', ')
      });
    }

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
- Make ${count > 1 ? 'them' : 'it'} interesting and engaging
- Can be about pop culture, science, history, geography, entertainment, sports, etc.
- Be creative and unexpected!
- Each topic should be maximum 5 words
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
    const isDevelopment = process.env.NODE_ENV === 'development';
    res.status(500).json({ 
      error: 'Failed to generate topic',
      ...(isDevelopment && { details: error.message })
    });
  }
});

app.listen(PORT, () => {
  console.log(`[VCVQ] Server running on http://localhost:${PORT}`);
});
