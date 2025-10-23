const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Cache for the latest model name
let latestModelName = null;

async function getLatestModel() {
  if (latestModelName) {
    return latestModelName;
  }

  try {
    // Try common model names in order of preference
    const modelNames = [
      'gemini-2.5-flash-lite',
      'gemini-2.0-flash-lite',
      'gemini-1.5-flash',
      'gemini-pro',
      'gemini-1.0-pro'
    ];

    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        // Test if the model works by making a simple request
        await model.generateContent("test");
        latestModelName = modelName;
        console.log(`Using Gemini model: ${modelName}`);
        return modelName;
      } catch (error) {
        console.log(`Model ${modelName} not available, trying next...`);
        continue;
      }
    }
    
    throw new Error('No compatible Gemini model found');
  } catch (error) {
    console.error('Error finding compatible model:', error);
    // Fallback to a basic model name
    latestModelName = 'gemini-1.5-pro';
    return latestModelName;
  }
}

async function generateQuizQuestions(topic, language = 'swedish', questionCount = 10) {
  try {
    const modelName = await getLatestModel();
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const languageInstruction = language === 'swedish' 
      ? 'All questions and answers should be in Swedish.'
      : 'All questions and answers should be in English.';

    const prompt = `
Generate exactly ${questionCount} multiple-choice quiz questions about "${topic}".
${languageInstruction}

Each question must have:
- A clear, engaging question
- Exactly 6 answer options (A, B, C, D, E, F)
- Only 1 correct answer
- The correct answer should be marked with "CORRECT:" at the end

Format the response as JSON with this exact structure:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D", "Option E", "Option F"],
      "correctAnswer": 0
    }
  ]
}

Make sure the questions are varied in difficulty and cover different aspects of the topic.
The correctAnswer should be the index (0-5) of the correct option.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response - try multiple approaches
    let jsonString = null;
    
    // First try: look for JSON object
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    } else {
      // Second try: look for JSON array
      const arrayMatch = text.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        jsonString = `{"questions": ${arrayMatch[0]}}`;
      }
    }
    
    if (!jsonString) {
      console.error('No JSON found in response. Full response:', text);
      throw new Error('No valid JSON found in response');
    }
    
    let quizData;
    try {
      // Clean up the JSON string to handle potential encoding issues
      const cleanedJson = jsonString
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
        
      quizData = JSON.parse(cleanedJson);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('JSON string that failed to parse:', jsonString);
      console.error('Cleaned JSON string:', jsonString.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').replace(/\s+/g, ' ').trim());
      throw new Error('Failed to parse JSON response');
    }
    
    // Validate the structure
    if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length !== questionCount) {
      throw new Error('Invalid quiz structure');
    }
    
    // Validate each question
    for (let i = 0; i < quizData.questions.length; i++) {
      const q = quizData.questions[i];
      if (!q.question || !q.options || !Array.isArray(q.options) || q.options.length !== 6) {
        throw new Error(`Invalid question structure at index ${i}`);
      }
      if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 5) {
        throw new Error(`Invalid correctAnswer at index ${i}`);
      }
    }
    
    return quizData.questions;
  } catch (error) {
    console.error('Error generating quiz questions:', error);
    throw new Error('Failed to generate quiz questions');
  }
}

module.exports = {
  generateQuizQuestions,
  getLatestModel
};
