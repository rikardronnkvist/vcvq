# Development Guide

This guide helps you set up a development environment and contribute to VCVQ.

## Prerequisites

- Node.js 18+ 
- Git
- Docker and docker-compose (optional)
- Google Gemini API key
- Text editor or IDE (VS Code recommended)

## Setting Up Development Environment

### 1. Fork and Clone

```bash
# Fork the repository on GitHub first, then:
git clone https://github.com/YOUR_USERNAME/vcvq.git
cd vcvq
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:
```env
GEMINI_API_KEY=your_api_key_here
PORT=3030
NODE_ENV=development
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start with auto-reload enabled (using nodemon).

## Project Structure

```
vcvq/
├── public/              # Frontend files
│   ├── index.html      # Landing page
│   ├── game.html       # Game page
│   ├── game.js         # Game logic
│   ├── i18n.js         # Internationalization
│   └── styles.css      # Styling
├── server.js           # Express server and API
├── utils/
│   └── security.js     # Security utilities
├── tests/
│   ├── fuzz/           # Property-based fuzz tests
│   └── clusterfuzz/    # ClusterFuzz targets
├── prompts/            # AI development assistance
├── docs/               # Documentation
└── package.json        # Dependencies and scripts
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Follow the coding standards (see below).

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run fuzz tests
npm run test:fuzz

# Run with verbose output
npm run test:fuzz:verbose
```

### 4. Commit Changes

```bash
git add .
git commit -m "Add feature: description of changes"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Coding Standards

### JavaScript Style

- **ES6+ features** - Use modern JavaScript
- **Async/await** - Prefer over promises and callbacks
- **Const/let** - No var declarations
- **Arrow functions** - For short functions
- **Template literals** - For string concatenation
- **Destructuring** - Where it improves readability

### Naming Conventions

```javascript
// Variables and functions: camelCase
const playerCount = 5;
function generateQuiz() { }

// Constants: UPPER_SNAKE_CASE
const MAX_PLAYERS = 5;

// Classes: PascalCase (if added)
class QuizManager { }
```

### Code Organization

- Keep functions small and focused
- One responsibility per function
- Add comments for complex logic
- Use meaningful variable names

### Example

```javascript
// Good
async function generatePlayerNames(language, count, topic) {
  const sanitizedTopic = sanitizePromptInput(topic);
  const prompt = buildNamePrompt(language, count, sanitizedTopic);
  return await callGeminiAPI(prompt);
}

// Avoid
async function gen(l, c, t) {
  return await api(l, c, t);
}
```

## Security Requirements

Security is critical. All code must follow these practices:

### 1. Input Validation

Always validate user input:

```javascript
const { body, validationResult } = require('express-validator');

app.post('/api/endpoint', [
  body('topic').isString().trim().isLength({ min: 1, max: 200 }),
  body('language').isIn(['sv', 'en']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Process validated input
});
```

### 2. HTML Escaping

Always escape user input before displaying:

```javascript
// In public/game.js
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Usage
element.innerHTML = escapeHtml(userInput);
```

### 3. Sanitization

Sanitize inputs before using in AI prompts or logs:

```javascript
const { sanitizePromptInput, sanitizeLog } = require('./utils/security');

// For AI prompts
const safeTopic = sanitizePromptInput(userTopic);

// For logging
console.log(sanitizeLog(`User selected: ${userInput}`));
```

### 4. Rate Limiting

All API endpoints must use rate limiting:

```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many requests'
});

app.post('/api/endpoint', apiLimiter, handler);
```

### 5. Security Headers

Applied automatically via Helmet middleware.

## Internationalization (i18n)

All user-facing text must support both Swedish and English.

### Adding New Translations

Edit `public/i18n.js`:

```javascript
const translations = {
  sv: {
    yourNewKey: 'Svensk text'
  },
  en: {
    yourNewKey: 'English text'
  }
};
```

### Using Translations

```javascript
// In frontend code
const text = t('yourNewKey');
element.textContent = text;
```

### Translation Guidelines

- Keep translations concise
- Maintain the same tone in both languages
- Test both languages thoroughly
- Consider Swedish characters: å, ä, ö

## Tesla Browser Compatibility

VCVQ is optimized for Tesla Model Y browser (1180x919 resolution).

### Testing Guidelines

- Test at 1180x919 resolution
- Test dropdown menus (known Tesla browser issue)
- Test drag-and-drop on touch screens
- Keep animations simple
- Avoid complex CSS that may not render

### Known Tesla Browser Issues

1. **Dropdown Issues** - Use custom dropdown implementation
2. **Touch Events** - Ensure both touch and mouse events work
3. **Performance** - Avoid heavy animations
4. **CSS Support** - Test advanced CSS features

## Testing

### Running Tests

```bash
# All tests
npm test

# Only fuzz tests
npm run test:fuzz

# Verbose output
npm run test:fuzz:verbose
```

### Writing Tests

Tests use Node.js test runner and fast-check for fuzzing.

**Example property-based test:**

```javascript
const { test } = require('node:test');
const assert = require('node:assert');
const fc = require('fast-check');

test('sanitizeLog - should always return a string', () => {
  fc.assert(
    fc.property(fc.string(), (input) => {
      const result = sanitizeLog(input);
      assert.strictEqual(typeof result, 'string');
    })
  );
});
```

### Test Guidelines

- Test edge cases and boundaries
- Include security-focused tests
- Test with malicious inputs
- Verify input validation
- Test both valid and invalid inputs

## Using AI Assistance

VCVQ includes AI development assistance via the `/vibe` command.

### Prompt Files

Located in `prompts/` directory:
- `copilot-role.md` - AI assistant role
- `development-guidelines.md` - Technical standards
- `feature-specifications.md` - Feature requirements
- `security-requirements.md` - Security practices

### Using /vibe Command

In VS Code:
```
/vibe How do I add a new language?
/vibe What's the security pattern for input validation?
/vibe How do I test Tesla browser compatibility?
```

## API Development

### Adding a New Endpoint

```javascript
// 1. Add validation middleware
const validateNewEndpoint = [
  body('field').isString().trim().notEmpty(),
  // ... more validations
];

// 2. Create handler
async function handleNewEndpoint(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    // Process request
    const result = await processRequest(req.body);
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error:', sanitizeLog(error.message));
    res.status(500).json({ error: 'Internal server error' });
  }
}

// 3. Register endpoint
app.post('/api/new-endpoint', 
  apiLimiter, 
  validateNewEndpoint, 
  handleNewEndpoint
);
```

### API Best Practices

- Always validate input
- Always use rate limiting
- Always handle errors gracefully
- Never expose sensitive information
- Log errors (with sanitization)
- Return consistent JSON responses

## Frontend Development

### Adding New Features

1. Update HTML in `public/game.html` or `public/index.html`
2. Add logic to `public/game.js`
3. Add styles to `public/styles.css`
4. Add translations to `public/i18n.js`

### Frontend Best Practices

- Use vanilla JavaScript (no frameworks)
- Escape all user input
- Handle errors gracefully
- Provide visual feedback
- Test on different screen sizes
- Support both mouse and touch

## Docker Development

### Building Docker Image

```bash
docker build -t vcvq .
```

### Running with Docker Compose

```bash
docker-compose up -d
```

### Viewing Logs

```bash
docker-compose logs -f
```

### Rebuilding After Changes

```bash
docker-compose up -d --build
```

## Debugging

### Server Debugging

```bash
# Run with Node.js inspector
node --inspect server.js

# Then connect with Chrome DevTools
# chrome://inspect
```

### Client Debugging

Use browser DevTools (F12):
- Console for errors
- Network tab for API calls
- Sources for breakpoints

### Common Issues

**Port in use:**
```bash
# Find process using port 3030
lsof -i :3030

# Kill process
kill -9 PID
```

**API errors:**
- Check Gemini API key
- Check network connection
- Check server logs
- Verify request format

## Performance

### Best Practices

- Minimize API calls
- Cache responses when appropriate
- Optimize images
- Minimize DOM manipulation
- Use event delegation
- Debounce user input

## Documentation

When adding features:

1. Update relevant documentation in `docs/`
2. Update README.md if needed
3. Add code comments for complex logic
4. Update API documentation for new endpoints

## Pull Request Checklist

Before submitting a PR:

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Security considerations addressed
- [ ] Documentation updated
- [ ] Both languages tested (Swedish/English)
- [ ] Tested on different screen sizes
- [ ] No console errors or warnings
- [ ] Commit messages are clear
- [ ] PR description explains changes

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [Google Gemini API](https://ai.google.dev/)
- [fast-check Documentation](https://fast-check.dev/)
- [Node.js Test Runner](https://nodejs.org/api/test.html)
- [OWASP Security Guidelines](https://owasp.org/)

## Getting Help

- Check existing documentation
- Review `prompts/` directory
- Open a GitHub issue
- Check past pull requests for examples

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

