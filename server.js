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
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
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
    const { topic, language } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const langInstruction = language === 'en' 
      ? 'Generate questions in English.'
      : 'Generera frågor på svenska.';

    const prompt = `${langInstruction}

Create exactly 10 multiple-choice quiz questions about: ${topic}

IMPORTANT: You must respond ONLY with valid JSON. Do not include any markdown formatting, code blocks, or explanatory text.

Format your response as a JSON array with exactly this structure:
[
  {
    "question": "Question text here?",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5", "Option 6"],
    "correctAnswer": 0
  }
]

Rules:
- Exactly 10 questions
- Each question must have exactly 6 answer options
- correctAnswer is the index (0-5) of the correct option
- Only one correct answer per question
- Make questions engaging and appropriate for a car quiz game
- Vary difficulty from easy to challenging`;

    let text = await tryGenerateWithModels(prompt);

    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const questions = JSON.parse(text);

    if (!Array.isArray(questions) || questions.length !== 10) {
      throw new Error('Invalid response format: Expected 10 questions');
    }

    questions.forEach((q, idx) => {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 6 || 
          typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 5) {
        throw new Error(`Invalid question format at index ${idx}`);
      }
    });

    res.json({ questions });
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ 
      error: 'Failed to generate quiz',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`VCVQ Server running on http://localhost:${PORT}`);
});
