const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const os = require('node:os');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const helmet = require('helmet');
const cors = require('cors');
const { t, getPositions } = require('./public/i18n.js');
const {
  sanitizeLog,
  sanitizePromptInput,
  isValidVisitorId,
  generateVisitorId,
  getClientIp
} = require('./utils/security.js');

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

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts (needed for inline script tags)
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for dynamic styling
      imgSrc: ["'self'", "data:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false // Allow static assets
}));

// CORS configuration
// Default to same-origin only for security. Set ALLOWED_ORIGINS env var for cross-origin access.
app.use((req, res, next) => {
  cors({
    origin: (origin, callback) => {
      // Requests without Origin header (same-origin navigation, direct requests) are allowed
      if (!origin) {
        return callback(null, true);
      }
      
      // If ALLOWED_ORIGINS is set, validate against the whitelist first
      if (process.env.ALLOWED_ORIGINS) {
        const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        // Origin not in whitelist, deny
        return callback(new Error('Not allowed by CORS'));
      }
      
      // No ALLOWED_ORIGINS configured: allow localhost origins and check if same-origin
      try {
        const originUrl = new URL(origin);
        const hostname = originUrl.hostname.toLowerCase();
        
        // Allow localhost variants
        if (hostname === 'localhost' || 
            hostname === '127.0.0.1' || 
            hostname === '[::1]' ||
            hostname === '::1') {
          return callback(null, true);
        }
        
        // Check if origin matches request host (same-origin)
        const requestHost = req.get('host');
        if (requestHost) {
          const requestHostname = requestHost.split(':')[0].toLowerCase();
          if (hostname === requestHostname) {
            return callback(null, true);
          }
        }
      } catch (error) {
        // Invalid URL format, deny the request
        console.debug('[VCVQ] CORS: Invalid URL format for origin:', sanitizeLog(origin, 100));
        return callback(null, false);
      }
      
      // For non-localhost/non-same-origin requests, require explicit ALLOWED_ORIGINS configuration
      return callback(new Error('CORS: ALLOWED_ORIGINS must be configured for cross-origin requests'));
    },
    credentials: true
  })(req, res, next);
});

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

// Get container/host information
const HOSTNAME = os.hostname();

// Visitor tracking - store first visit info
const visitorInfo = new Map(); // Map<sessionId, {firstVisit: timestamp, ip, userAgent, resolution}>

app.use(express.json({ limit: '1mb' })); // Limit payload size

// Helper function to determine if we should log IP
function shouldLogClientIp() {
  // If running behind multiple proxies where we only get internal IPs,
  // we can disable IP logging to avoid noise
  return false; // Set to true if you want IP logging
}

// Log user agent for page requests
app.use((req, res, next) => {
  // Only log for HTML page requests, not static assets
  if (req.path === '/' || req.path === '/index.html' || req.path === '/game.html') {
    // This will be handled by the client info endpoint, so we can skip detailed logging here
    // Just pass through
  }
  next();
});

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

// Helper function to build visitor log message
function buildVisitorLogMessage(options) {
  const { prefix, visitorId, page, userAgent, clientIp, resolution, viewport, logIp } = options;
  const sanitizedPrefix = sanitizeLog(prefix);
  const sanitizedVisitorId = sanitizeLog(visitorId);
  const ipStr = logIp ? ` | IP: ${sanitizeLog(clientIp)}` : '';
  const sanitizedPage = sanitizeLog(page);
  const sanitizedUserAgent = sanitizeLog(userAgent, 150);
  
  let resolutionStr = '';
  if (resolution && viewport) {
    const sanitizedWidth = sanitizeLog(resolution.width, 10);
    const sanitizedHeight = sanitizeLog(resolution.height, 10);
    const sanitizedVpWidth = sanitizeLog(viewport.width, 10);
    const sanitizedVpHeight = sanitizeLog(viewport.height, 10);
    resolutionStr = ` | Resolution: ${sanitizedWidth}x${sanitizedHeight} | Viewport: ${sanitizedVpWidth}x${sanitizedVpHeight}`;
  } else if (resolution) {
    const sanitizedWidth = sanitizeLog(resolution.width, 10);
    const sanitizedHeight = sanitizeLog(resolution.height, 10);
    resolutionStr = ` | Resolution: ${sanitizedWidth}x${sanitizedHeight}`;
  }
  
  return `[VCVQ] ${sanitizedPrefix} | ID: ${sanitizedVisitorId} | Page: ${sanitizedPage}${ipStr}${resolutionStr} | User-Agent: ${sanitizedUserAgent}`;
}

// Helper function to create and store new visitor
function createNewVisitor(visitorId, clientIp, userAgent, resolution) {
  const now = new Date().toISOString();
  visitorInfo.set(visitorId, {
    firstVisit: now,
    ip: clientIp,
    userAgent,
    resolution: resolution ? `${resolution.width}x${resolution.height}` : 'Unknown'
  });
}

// Helper function to handle first visit
function handleFirstVisit(clientIp, userAgent, page, resolution, viewport, logIp, prefix = 'First visit') {
  const newVisitorId = generateVisitorId();
  createNewVisitor(newVisitorId, clientIp, userAgent, resolution);
  const logMessage = buildVisitorLogMessage({ 
    prefix, 
    visitorId: newVisitorId, 
    page, 
    userAgent, 
    clientIp, 
    resolution, 
    viewport, 
    logIp 
  });
  console.log(logMessage);
  return newVisitorId;
}

// Helper function to handle returning visitor
function handleReturningVisitor(visitorId, page, userAgent) {
  const sanitizedVisitorId = sanitizeLog(visitorId);
  const sanitizedPage = sanitizeLog(page);
  const sanitizedUserAgent = sanitizeLog(userAgent, 150);
  console.log(`[VCVQ] Visitor: ${sanitizedVisitorId} | Page: ${sanitizedPage} | User-Agent: ${sanitizedUserAgent}`);
}

// Client info logging endpoint (no rate limiting, minimal payload)
app.post('/api/log-client-info', express.json({ limit: '1kb' }), (req, res) => {
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const { resolution, viewport, page, visitorId } = req.body || {};
  const clientIp = getClientIp(req);
  const logIp = shouldLogClientIp();
  
  // Validate visitorId if provided
  if (visitorId && !isValidVisitorId(visitorId)) {
    return res.status(400).json({ error: 'Invalid visitor ID format' });
  }
  
  // Handle first visit (no visitorId)
  if (!visitorId) {
    const newVisitorId = handleFirstVisit(clientIp, userAgent, page, resolution, viewport, logIp);
    return res.status(200).json({ status: 'ok', visitorId: newVisitorId });
  }
  
  // Handle returning visitor
  const visitor = visitorInfo.get(visitorId);
  if (visitor) {
    handleReturningVisitor(visitorId, page, userAgent);
    return res.status(200).json({ status: 'ok' });
  }
  
  // Visitor ID not found (server restarted), treat as first visit
  const newVisitorId = handleFirstVisit(clientIp, userAgent, page, resolution, viewport, logIp, 'First visit (ID expired)');
  return res.status(200).json({ status: 'ok', visitorId: newVisitorId });
});

async function tryGenerateWithModels(prompt) {
  let lastError = null;
  let isOverloaded = false;
  
  for (const modelName of MODEL_NAMES) {
    try {
      console.log(`Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = result.response;
      console.log(`Success with model: ${modelName}`);
      return response.text();
    } catch (error) {
      console.log(`Model ${modelName} failed: ${error.message}`);
      // Check if this is an overload/service unavailable error
      if (error.message && (
        error.message.includes('503') || 
        error.message.includes('Service Unavailable') || 
        error.message.includes('overloaded') ||
        error.message.includes('try again later')
      )) {
        isOverloaded = true;
      }
      lastError = error;
      continue;
    }
  }
  
  // If we detected overload errors, throw a special error
  if (isOverloaded) {
    const overloadError = new Error('Service temporarily unavailable');
    overloadError.isOverloaded = true;
    throw overloadError;
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

function validateQuizRequest(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('[VCVQ] Validation errors:', errors.array());
    const isDevelopment = process.env.NODE_ENV === 'development';
    return { 
      valid: false, 
      response: { 
        error: 'Validation failed', 
        ...(isDevelopment && { details: errors.array().map(e => e.msg).join(', ') })
      }
    };
  }
  
  const { visitorId } = req.body;
  if (visitorId && !isValidVisitorId(visitorId)) {
    return { 
      valid: false, 
      response: { error: 'Invalid visitor ID format' }
    };
  }
  
  return { valid: true };
}

function logQuizRequest(topic, language, numQuestions, numAnswers, visitorId) {
  const sanitizedTopic = sanitizeLog(topic);
  const sanitizedLanguage = sanitizeLog(language);
  const sanitizedNumQuestions = sanitizeLog(numQuestions);
  const sanitizedNumAnswers = sanitizeLog(numAnswers);
  const sanitizedVisitorId = sanitizeLog(visitorId);
  const visitorInfoStr = visitorId ? ` | Visitor: ${sanitizedVisitorId}` : '';
  console.log(`[VCVQ] Generating quiz - Topic: ${sanitizedTopic}, Language: ${sanitizedLanguage}, Questions: ${sanitizedNumQuestions}, Answers: ${sanitizedNumAnswers}${visitorInfoStr}`);
}

function buildQuizPrompt(sanitizedTopicForPrompt, language, numQuestions, numAnswers) {
  const langInstruction = t('aiQuizInstruction', language);
  const maxAnswerIndex = numAnswers - 1;
  const exampleOptions = Array.from({ length: numAnswers }, (_, i) => `Option ${i + 1}`);

  return `${langInstruction}

Create exactly ${numQuestions} multiple-choice quiz questions about: ${sanitizedTopicForPrompt}

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
}

function parseAndValidateQuizResponse(text, numQuestions, numAnswers) {
  const cleanedText = text.replaceAll(/```json\n?/g, '').replaceAll(/```\n?/g, '').trim();
  
  let questions;
  try {
    questions = JSON.parse(cleanedText);
  } catch (error) {
    throw new Error(`Invalid JSON response from AI: ${error.message}`);
  }

  if (!Array.isArray(questions) || questions.length !== numQuestions) {
    throw new Error(`Invalid response format: Expected ${numQuestions} questions`);
  }

  const maxAnswerIndex = numAnswers - 1;
  for (const [idx, q] of questions.entries()) {
    if (!q.question || !Array.isArray(q.options) || q.options.length !== numAnswers || 
        typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > maxAnswerIndex) {
      throw new Error(`Invalid question format at index ${idx}`);
    }
  }
  
  return questions;
}

app.post('/api/generate-quiz', strictApiLimiter, validateQuizGeneration, async (req, res) => {
  try {
    const validation = validateQuizRequest(req, res);
    if (!validation.valid) {
      return res.status(400).json(validation.response);
    }

    const { topic, language, numQuestions = 10, numAnswers = 6, visitorId } = req.body;
    
    const sanitizedTopicForPrompt = sanitizePromptInput(topic);
    logQuizRequest(topic, language, numQuestions, numAnswers, visitorId);

    const prompt = buildQuizPrompt(sanitizedTopicForPrompt, language, numQuestions, numAnswers);
    const text = await tryGenerateWithModels(prompt);
    const questions = parseAndValidateQuizResponse(text, numQuestions, numAnswers);

    console.log(`[VCVQ] Successfully generated ${questions.length} questions`);
    res.json({ questions });
  } catch (error) {
    handleGenerationError(error, res);
  }
});

// Input validation middleware for player names
// Helper function to build player names prompt
function buildPlayerNamesPrompt(language, count, topic, positions) {
  const sanitizedTopicForPrompt = topic ? sanitizePromptInput(topic) : '';
  const positionList = positions.slice(0, count);
  
  const topicContext = sanitizedTopicForPrompt 
    ? t('aiPlayerNamesTopicContext', language, sanitizedTopicForPrompt)
    : '';
  
  const langInstruction = t('aiPlayerNamesInstruction', language, count, topicContext);
  const topicRule = topic ? ' AND the quiz topic' : ' or driving context';
  
  return `${langInstruction}
${positionList.map((pos, i) => `${i + 1}. ${pos}`).join('\n')}

IMPORTANT: You must respond ONLY with valid JSON. Do not include any markdown formatting, code blocks, or explanatory text.

Format your response as a JSON array with exactly ${count} strings (one name per position):
["Name1", "Name2", "Name3"]

Rules:
- Names should be funny, memorable, and family-friendly
- Names should relate to the car position${topicRule}
- Keep names short (1-2 words max)
- Make them culturally appropriate for ${t('languageName', language)} speakers
- Be creative and fun!`;
}

// Helper function to parse and validate player names response
function validatePlayerNamesResponse(text, count) {
  const cleanedText = text.replaceAll(/```json\n?/g, '').replaceAll(/```\n?/g, '').trim();
  
  let names;
  try {
    names = JSON.parse(cleanedText);
  } catch (error) {
    throw new Error(`Invalid JSON response from AI: ${error.message}`);
  }
  
  if (!Array.isArray(names) || names.length !== count) {
    throw new Error(`Invalid response format: Expected ${count} names`);
  }
  
  return names;
}

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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('[VCVQ] Validation errors:', errors.array());
      const isDevelopment = process.env.NODE_ENV === 'development';
      return res.status(400).json({ 
        error: 'Validation failed', 
        ...(isDevelopment && { details: errors.array().map(e => e.msg).join(', ') })
      });
    }

    const { language, count, topic, visitorId } = req.body;
    
    if (visitorId && !isValidVisitorId(visitorId)) {
      return res.status(400).json({ error: 'Invalid visitor ID format' });
    }
    
    const sanitizedTopic = sanitizeLog(topic);
    const sanitizedLanguage = sanitizeLog(language);
    const sanitizedCount = sanitizeLog(count);
    const sanitizedVisitorId = sanitizeLog(visitorId);
    const visitorInfoStr = visitorId ? ` | Visitor: ${sanitizedVisitorId}` : '';
    console.log(`[VCVQ] Generating ${sanitizedCount} player names in ${sanitizedLanguage} for topic: ${sanitizedTopic}${visitorInfoStr}`);

    const positions = getPositions(language);
    const prompt = buildPlayerNamesPrompt(language, count, topic, positions);
    const text = await tryGenerateWithModels(prompt);
    const names = validatePlayerNamesResponse(text, count);

    console.log(`[VCVQ] Generated player names:`, names);
    res.json({ names });
  } catch (error) {
    return handleGenerationError(error, res, 'player names');
  }
});

// Helper function to build topic generation prompt
function buildTopicPrompt(language, count) {
  const langInstruction = t('aiTopicsInstruction', language, count);
  const responseFormat = count === 1 
    ? '{\n  "topic": "Your funny topic here"\n}'
    : '{\n  "topics": ["Topic 1", "Topic 2", "Topic 3"]\n}';
  
  const pluralRules = count > 1 
    ? '- All topics should be different and diverse\n- Cover different categories'
    : '';
  
  return `${langInstruction}

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
${pluralRules}

Examples of good topics: "Movie Villains", "Space Oddities", "Swedish Meatballs", "80s Music", "Famous Mustaches"`;
}

// Helper function to parse and validate topic response
function validateTopicResponse(text, count) {
  const cleanedText = text.replaceAll(/```json\n?/g, '').replaceAll(/```\n?/g, '').trim();
  
  let data;
  try {
    data = JSON.parse(cleanedText);
  } catch (error) {
    throw new Error(`Invalid JSON response from AI: ${error.message}`);
  }
  
  if (count === 1) {
    if (!data.topic || typeof data.topic !== 'string') {
      throw new Error('Invalid response format: Expected topic string');
    }
    return { topic: data.topic };
  }
  
  if (!Array.isArray(data.topics) || data.topics.length !== count) {
    throw new Error(`Invalid response format: Expected ${count} topics`);
  }
  return { topics: data.topics };
}

// Helper function to handle AI generation errors
function handleGenerationError(error, res, context) {
  const sanitizedContext = sanitizeLog(context);
  const sanitizedError = error instanceof Error ? sanitizeLog(error.message, 300) : sanitizeLog(String(error), 300);
  console.error(`[VCVQ] Error generating ${sanitizedContext}: ${sanitizedError}`);
  
  if (error.isOverloaded) {
    return res.status(503).json({ 
      error: 'Service temporarily unavailable',
      errorCode: 'OVERLOADED',
      message: 'The AI service is currently overloaded. Please try again in a few moments.'
    });
  }
  
  const isDevelopment = process.env.NODE_ENV === 'development';
  return res.status(500).json({ 
    error: `Failed to generate ${context}`,
    ...(isDevelopment && { details: error.message })
  });
}

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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('[VCVQ] Validation errors:', errors.array());
      const isDevelopment = process.env.NODE_ENV === 'development';
      return res.status(400).json({ 
        error: 'Validation failed', 
        ...(isDevelopment && { details: errors.array().map(e => e.msg).join(', ') })
      });
    }

    const { language, count = 1, visitorId } = req.body;
    
    if (visitorId && !isValidVisitorId(visitorId)) {
      return res.status(400).json({ error: 'Invalid visitor ID format' });
    }
    
    const sanitizedLanguage = sanitizeLog(language);
    const sanitizedCount = sanitizeLog(count);
    const sanitizedVisitorId = sanitizeLog(visitorId);
    const visitorInfoStr = visitorId ? ` | Visitor: ${sanitizedVisitorId}` : '';
    console.log(`[VCVQ] Generating ${sanitizedCount} random funny topic(s) in ${sanitizedLanguage}${visitorInfoStr}`);
    
    const prompt = buildTopicPrompt(language, count);
    const text = await tryGenerateWithModels(prompt);
    const result = validateTopicResponse(text, count);
    
    if (count === 1) {
      console.log(`[VCVQ] Generated topic: ${sanitizeLog(result.topic)}`);
    } else {
      console.log(`[VCVQ] Generated topics:`, result.topics);
    }
    
    res.json(result);
  } catch (error) {
    return handleGenerationError(error, res, 'topic');
  }
});

app.listen(PORT, () => {
  console.log(`[VCVQ] Server running on http://localhost:${PORT} | Container: ${HOSTNAME}`);
});
