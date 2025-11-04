const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const os = require('os');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const helmet = require('helmet');
const cors = require('cors');
const { t, getPositions } = require('./public/i18n.js');

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
        // Invalid URL format, continue to deny
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

// Helper function to generate a short unique ID
function generateVisitorId() {
  return Math.random().toString(36).substring(2, 10);
}

// Helper function to get client IP
function getClientIp(req) {
  // req.ip should be the real client IP if trust proxy is set correctly
  const ip = req.ip || req.socket.remoteAddress;
  
  // If we still get a local IP, try parsing x-forwarded-for manually
  if (ip && (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.16.') || ip === '127.0.0.1')) {
    const xForwardedFor = req.headers['x-forwarded-for'];
    if (xForwardedFor) {
      // Take the first IP in the chain (the real client)
      const forwardedIps = xForwardedFor.split(',').map(ip => ip.trim());
      for (const forwardedIp of forwardedIps) {
        // Skip if it's another local/proxy IP
        if (!forwardedIp.startsWith('192.168.') && !forwardedIp.startsWith('10.') && 
            !forwardedIp.startsWith('172.16.') && forwardedIp !== '127.0.0.1') {
          return forwardedIp;
        }
      }
    }
  }
  
  return ip || 'Unknown';
}

// Helper function to determine if we should log IP
function shouldLogClientIp() {
  // If running behind multiple proxies where we only get internal IPs,
  // we can disable IP logging to avoid noise
  return false; // Set to true if you want IP logging
}

// Helper function to sanitize user input for safe logging (prevents log injection)
// Removes newlines, carriage returns, and other control characters
function sanitizeLog(value, maxLength = 200) {
  if (value == null) return 'unknown';
  const str = String(value);
  // Remove newlines, carriage returns, and other control characters that could be used for log injection
  return str.replace(/[\r\n\t\x00-\x1F\x7F-\x9F]/g, '').substring(0, maxLength);
}

// Helper function to sanitize topic for AI prompts (prevents prompt injection)
// Removes prompt injection attempts and sanitizes the input
function sanitizePromptInput(topic) {
  if (!topic) return '';
  let sanitized = String(topic);
  
  // Remove common prompt injection patterns
  // Remove newlines and carriage returns
  sanitized = sanitized.replace(/[\r\n]/g, ' ');
  // Remove common injection keywords/patterns
  sanitized = sanitized.replace(/\b(ignore|forget|override|system|admin|assistant|instructions|prompt|role|persona)\s+(previous|above|instructions|all|the|this)\b/gi, '');
  // Remove multiple consecutive spaces
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  // Limit length to prevent overly long prompts
  return sanitized.substring(0, 200);
}

// Helper function to validate visitorId format
function isValidVisitorId(visitorId) {
  if (!visitorId || typeof visitorId !== 'string') return false;
  // Visitor ID should be alphanumeric, 8 characters max (as generated)
  return /^[a-z0-9]{1,20}$/i.test(visitorId);
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
  
  // Check if this is a first visit (no visitorId) or returning visitor
  if (!visitorId) {
    // First visit - generate ID and log full info
    const newVisitorId = generateVisitorId();
    const now = new Date().toISOString();
    
    visitorInfo.set(newVisitorId, {
      firstVisit: now,
      ip: clientIp,
      userAgent,
      resolution: resolution ? `${resolution.width}x${resolution.height}` : 'Unknown'
    });
    
    // Log first visit with full details
    const ipStr = logIp ? ` | IP: ${sanitizeLog(clientIp)}` : '';
    const sanitizedPage = sanitizeLog(page);
    const sanitizedUserAgent = sanitizeLog(userAgent, 150);
    if (resolution && viewport) {
      const sanitizedWidth = sanitizeLog(resolution.width, 10);
      const sanitizedHeight = sanitizeLog(resolution.height, 10);
      const sanitizedVpWidth = sanitizeLog(viewport.width, 10);
      const sanitizedVpHeight = sanitizeLog(viewport.height, 10);
      console.log(`[VCVQ] First visit | ID: ${newVisitorId} | Page: ${sanitizedPage}${ipStr} | Resolution: ${sanitizedWidth}x${sanitizedHeight} | Viewport: ${sanitizedVpWidth}x${sanitizedVpHeight} | User-Agent: ${sanitizedUserAgent}`);
    } else if (resolution) {
      const sanitizedWidth = sanitizeLog(resolution.width, 10);
      const sanitizedHeight = sanitizeLog(resolution.height, 10);
      console.log(`[VCVQ] First visit | ID: ${newVisitorId} | Page: ${sanitizedPage}${ipStr} | Resolution: ${sanitizedWidth}x${sanitizedHeight} | User-Agent: ${sanitizedUserAgent}`);
    } else {
      console.log(`[VCVQ] First visit | ID: ${newVisitorId} | Page: ${sanitizedPage}${ipStr} | User-Agent: ${sanitizedUserAgent}`);
    }
    
    // Return the visitor ID to store client-side
    res.status(200).json({ status: 'ok', visitorId: newVisitorId });
  } else {
    // Returning visitor - just log with ID
    const visitor = visitorInfo.get(visitorId);
    if (visitor) {
      const sanitizedVisitorId = sanitizeLog(visitorId);
      const sanitizedPage = sanitizeLog(page);
      const sanitizedUserAgent = sanitizeLog(userAgent, 150);
      console.log(`[VCVQ] Visitor: ${sanitizedVisitorId} | Page: ${sanitizedPage} | User-Agent: ${sanitizedUserAgent}`);
    } else {
      // Visitor ID not found in map (server restarted), treat as first visit
      const newVisitorId = generateVisitorId();
      const now = new Date().toISOString();
      
      visitorInfo.set(newVisitorId, {
        firstVisit: now,
        ip: clientIp,
        userAgent,
        resolution: resolution ? `${resolution.width}x${resolution.height}` : 'Unknown'
      });
      
      // Log first visit (ID expired) with full details
      const ipStr = logIp ? ` | IP: ${sanitizeLog(clientIp)}` : '';
      const sanitizedPage = sanitizeLog(page);
      const sanitizedUserAgent = sanitizeLog(userAgent, 150);
      if (resolution && viewport) {
        const sanitizedWidth = sanitizeLog(resolution.width, 10);
        const sanitizedHeight = sanitizeLog(resolution.height, 10);
        const sanitizedVpWidth = sanitizeLog(viewport.width, 10);
        const sanitizedVpHeight = sanitizeLog(viewport.height, 10);
        console.log(`[VCVQ] First visit (ID expired) | ID: ${newVisitorId} | Page: ${sanitizedPage}${ipStr} | Resolution: ${sanitizedWidth}x${sanitizedHeight} | Viewport: ${sanitizedVpWidth}x${sanitizedVpHeight} | User-Agent: ${sanitizedUserAgent}`);
      } else if (resolution) {
        const sanitizedWidth = sanitizeLog(resolution.width, 10);
        const sanitizedHeight = sanitizeLog(resolution.height, 10);
        console.log(`[VCVQ] First visit (ID expired) | ID: ${newVisitorId} | Page: ${sanitizedPage}${ipStr} | Resolution: ${sanitizedWidth}x${sanitizedHeight} | User-Agent: ${sanitizedUserAgent}`);
      } else {
        console.log(`[VCVQ] First visit (ID expired) | ID: ${newVisitorId} | Page: ${sanitizedPage}${ipStr} | User-Agent: ${sanitizedUserAgent}`);
      }
      res.status(200).json({ status: 'ok', visitorId: newVisitorId });
      return;
    }
    
    res.status(200).json({ status: 'ok' });
  }
});

async function tryGenerateWithModels(prompt) {
  let lastError = null;
  let isOverloaded = false;
  
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

app.post('/api/generate-quiz', strictApiLimiter, validateQuizGeneration, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('[VCVQ] Validation errors:', errors.array());
      const isDevelopment = process.env.NODE_ENV === 'development';
      return res.status(400).json({ 
        error: 'Validation failed', 
        ...(isDevelopment && { details: errors.array().map(e => e.msg).join(', ') })
      });
    }

    const { topic, language, numQuestions = 10, numAnswers = 6, visitorId } = req.body;
    
    // Validate visitorId if provided
    if (visitorId && !isValidVisitorId(visitorId)) {
      return res.status(400).json({ error: 'Invalid visitor ID format' });
    }
    
    // Sanitize topic for prompt injection prevention
    const sanitizedTopicForPrompt = sanitizePromptInput(topic);
    
    const sanitizedTopic = sanitizeLog(topic);
    const sanitizedLanguage = sanitizeLog(language);
    const sanitizedNumQuestions = sanitizeLog(numQuestions);
    const sanitizedNumAnswers = sanitizeLog(numAnswers);
    const sanitizedVisitorId = sanitizeLog(visitorId);
    const visitorInfoStr = visitorId ? ` | Visitor: ${sanitizedVisitorId}` : '';
    console.log(`[VCVQ] Generating quiz - Topic: ${sanitizedTopic}, Language: ${sanitizedLanguage}, Questions: ${sanitizedNumQuestions}, Answers: ${sanitizedNumAnswers}${visitorInfoStr}`);

    const langInstruction = t('aiQuizInstruction', language);

    const maxAnswerIndex = numAnswers - 1;
    const exampleOptions = Array.from({ length: numAnswers }, (_, i) => `Option ${i + 1}`);

    const prompt = `${langInstruction}

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

    let text = await tryGenerateWithModels(prompt);

    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let questions;
    try {
      questions = JSON.parse(text);
    } catch (error) {
      throw new Error(`Invalid JSON response from AI: ${error.message}`);
    }

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
    const sanitizedError = error instanceof Error ? sanitizeLog(error.message, 300) : sanitizeLog(String(error), 300);
    console.error(`[VCVQ] Error generating quiz: ${sanitizedError}`);
    
    // Check if this is an overload error
    if (error.isOverloaded) {
      return res.status(503).json({ 
        error: 'Service temporarily unavailable',
        errorCode: 'OVERLOADED',
        message: 'The AI service is currently overloaded. Please try again in a few moments.'
      });
    }
    
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
      const isDevelopment = process.env.NODE_ENV === 'development';
      return res.status(400).json({ 
        error: 'Validation failed', 
        ...(isDevelopment && { details: errors.array().map(e => e.msg).join(', ') })
      });
    }

    const { language, count, topic, visitorId } = req.body;
    
    // Validate visitorId if provided
    if (visitorId && !isValidVisitorId(visitorId)) {
      return res.status(400).json({ error: 'Invalid visitor ID format' });
    }
    
    // Sanitize topic for prompt injection prevention
    const sanitizedTopicForPrompt = topic ? sanitizePromptInput(topic) : '';
    
    const sanitizedTopic = sanitizeLog(topic);
    const sanitizedLanguage = sanitizeLog(language);
    const sanitizedCount = sanitizeLog(count);
    const sanitizedVisitorId = sanitizeLog(visitorId);
    const visitorInfoStr = visitorId ? ` | Visitor: ${sanitizedVisitorId}` : '';
    console.log(`[VCVQ] Generating ${sanitizedCount} player names in ${sanitizedLanguage} for topic: ${sanitizedTopic}${visitorInfoStr}`);

    const positions = getPositions(language);
    const positionList = positions.slice(0, count);
    
    const topicContext = sanitizedTopicForPrompt 
      ? t('aiPlayerNamesTopicContext', language, sanitizedTopicForPrompt)
      : '';
    
    const langInstruction = t('aiPlayerNamesInstruction', language, count, topicContext);
    
    const prompt = `${langInstruction}
${positionList.map((pos, i) => `${i + 1}. ${pos}`).join('\n')}

IMPORTANT: You must respond ONLY with valid JSON. Do not include any markdown formatting, code blocks, or explanatory text.

Format your response as a JSON array with exactly ${count} strings (one name per position):
["Name1", "Name2", "Name3"]

Rules:
- Names should be funny, memorable, and family-friendly
- Names should relate to the car position${topic ? ' AND the quiz topic' : ' or driving context'}
- Keep names short (1-2 words max)
- Make them culturally appropriate for ${t('languageName', language)} speakers
- Be creative and fun!`;

    let text = await tryGenerateWithModels(prompt);

    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let names;
    try {
      names = JSON.parse(text);
    } catch (error) {
      throw new Error(`Invalid JSON response from AI: ${error.message}`);
    }

    if (!Array.isArray(names) || names.length !== count) {
      throw new Error(`Invalid response format: Expected ${count} names`);
    }

    console.log(`[VCVQ] Generated player names:`, names);
    res.json({ names });
  } catch (error) {
    const sanitizedError = error instanceof Error ? sanitizeLog(error.message, 300) : sanitizeLog(String(error), 300);
    console.error(`[VCVQ] Error generating player names: ${sanitizedError}`);
    
    // Check if this is an overload error
    if (error.isOverloaded) {
      return res.status(503).json({ 
        error: 'Service temporarily unavailable',
        errorCode: 'OVERLOADED',
        message: 'The AI service is currently overloaded. Please try again in a few moments.'
      });
    }
    
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
      const isDevelopment = process.env.NODE_ENV === 'development';
      return res.status(400).json({ 
        error: 'Validation failed', 
        ...(isDevelopment && { details: errors.array().map(e => e.msg).join(', ') })
      });
    }

    const { language, count = 1, visitorId } = req.body;
    
    // Validate visitorId if provided
    if (visitorId && !isValidVisitorId(visitorId)) {
      return res.status(400).json({ error: 'Invalid visitor ID format' });
    }
    
    const sanitizedLanguage = sanitizeLog(language);
    const sanitizedCount = sanitizeLog(count);
    const sanitizedVisitorId = sanitizeLog(visitorId);
    const visitorInfoStr = visitorId ? ` | Visitor: ${sanitizedVisitorId}` : '';
    console.log(`[VCVQ] Generating ${sanitizedCount} random funny topic(s) in ${sanitizedLanguage}${visitorInfoStr}`);
    
    const langInstruction = t('aiTopicsInstruction', language, count);

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

    let data;
    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new Error(`Invalid JSON response from AI: ${error.message}`);
    }

    if (count === 1) {
      if (!data.topic || typeof data.topic !== 'string') {
        throw new Error('Invalid response format: Expected topic string');
      }
      console.log(`[VCVQ] Generated topic: ${sanitizeLog(data.topic)}`);
      res.json({ topic: data.topic });
    } else {
      if (!Array.isArray(data.topics) || data.topics.length !== count) {
        throw new Error(`Invalid response format: Expected ${count} topics`);
      }
      console.log(`[VCVQ] Generated topics:`, data.topics);
      res.json({ topics: data.topics });
    }
  } catch (error) {
    const sanitizedError = error instanceof Error ? sanitizeLog(error.message, 300) : sanitizeLog(String(error), 300);
    console.error(`[VCVQ] Error generating topic: ${sanitizedError}`);
    
    // Check if this is an overload error
    if (error.isOverloaded) {
      return res.status(503).json({ 
        error: 'Service temporarily unavailable',
        errorCode: 'OVERLOADED',
        message: 'The AI service is currently overloaded. Please try again in a few moments.'
      });
    }
    
    const isDevelopment = process.env.NODE_ENV === 'development';
    res.status(500).json({ 
      error: 'Failed to generate topic',
      ...(isDevelopment && { details: error.message })
    });
  }
});

app.listen(PORT, () => {
  console.log(`[VCVQ] Server running on http://localhost:${PORT} | Container: ${HOSTNAME}`);
});
