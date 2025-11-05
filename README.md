# 🎮 Vibe Coded Vibe Quiz (VCVQ)

A real-time multiplayer quiz game designed for car trips! Generate AI-powered quiz questions on any topic and compete with 2-5 players using an intuitive drag-and-drop or click interface.

**Project home:** https://github.com/rikardronnkvist/vcvq

## Features

- 🚗 **Car-Friendly Design** - Perfect for road trips with easy drag-and-drop or click controls
- 🤖 **AI-Generated Questions** - Powered by Google Gemini to create quizzes on any topic
- 🎲 **Random Topics** - Get 15 AI-generated funny topics with one click, or enter your own
- 👥 **2-5 Players** - Multiplayer support with AI-generated or customizable player names
- 🌍 **Bilingual** - Support for Swedish and English with easy language switching
- 🎨 **Visual Feedback** - Color-coded players with real-time scoring and player badges on answers
- 📱 **Responsive** - Works on desktop and tablets (optimized for Tesla Model Y browser at 1180x919)
- 🔋 **Tesla Compatible** - Special compatibility fixes for Tesla browser dropdown menus
- 🐳 **Docker Ready** - Easy deployment with Docker and docker-compose
- 🎯 **AI Player Names** - Generate fun, context-aware player names based on topic and car positions
- ⚙️ **Customizable** - Choose 5-50 questions and 4-8 answer options per question
- 🔄 **Game Restart** - Restart games while preserving all settings and player names

## Quick Start

### Prerequisites

- Docker and docker-compose installed
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Extract the project files**

2. **Create environment file:**
```bash
   cp .env.example .env
```

3. **Edit `.env` and add your Gemini API key:**
```env
   GEMINI_API_KEY=your_actual_api_key_here
   PORT=3030
   # Optional: For cross-origin requests, set ALLOWED_ORIGINS
   # ALLOWED_ORIGINS=http://example.com,https://another-domain.com
```

4. **Start the application:**
```bash
   docker-compose up -d
```

5. **Open your browser:**
http://localhost:3030


## How to Play

1. **Setup:**
   - Select language (Swedish or English) using the flag buttons
   - Choose a quiz topic:
     - Enter your own topic (e.g., "Science", "Movies", "Geography")
     - OR click "🎲 Random" to get 15 AI-generated funny topics to choose from
     - Switch back to custom input anytime
   - Choose number of players (2-5, default: 2)
   - Choose number of questions (5, 10, 15, 20, 25, 30, or 50, default: 10)
   - Choose number of answer options per question (4, 6, or 8, default: 6)
   - Generate AI player names (context-aware, based on topic and car positions) or customize manually
   - Click "Start Quiz" to begin

2. **Game Flow:**
   - Random starting player for the first question
   - Starting player rotates for each subsequent question (fair distribution)
   - ALL players answer EACH question in numerical sequence from the starting player
   - Players drag their numbered token OR click on answer boxes to select answers
   - Player badges appear on answer boxes showing which players selected each answer
   - After all players answer, feedback is shown:
     - 🎉 "Everyone answered correctly!" (if all correct)
     - 😅 "No one answered correctly!" (if all incorrect)
     - "X/Y answered correctly" (shows how many got it right)
   - Green highlight = correct answer, Red highlight = incorrect answer
   - Correct answer is always highlighted
   - 5-second delay between questions for answer review
   - "End Game" button available to end early and see results
   - Game continues for your selected number of questions

3. **Winning:**
   - Player(s) with highest score wins (ties are supported)
   - Final scoreboard shows all players sorted by score
   - "Play Again" button restarts with same settings, players, and topic
   - All settings are preserved when restarting

## Development

### Without Docker

1. **Install dependencies:**
```bash
   npm install
```

2. **Create `.env` file:**
```bash
   cp .env.example .env
   # Add your GEMINI_API_KEY
```

3. **Run development server:**
```bash
   npm run dev
```

**Note:** Make sure you have `nodemon` installed for auto-reload during development. For production, use:
```bash
   npm start
```

## Security Analysis with GitHub CodeQL

This repository includes GitHub CodeQL for automated security and code quality analysis. CodeQL runs automatically on pushes, pull requests, and on a weekly schedule.

### Enabling CodeQL

If you encounter an error stating that actions must be from repositories owned by your organization, you need to update your GitHub repository settings:

1. **Navigate to repository settings:**
   - Go to your repository on GitHub
   - Click on **Settings** → **Actions** → **General**

2. **Update Actions permissions:**
   - Under **Actions permissions**, select **"Allow all actions and reusable workflows"**
   - Click **Save**

### Alternative: Fork Actions (If Keeping Restrictions)

If you prefer to keep restrictions on external actions, you can fork the required action repositories into your organization:

1. **Fork these repositories:**
   - [`actions/checkout`](https://github.com/actions/checkout)
   - [`github/codeql-action`](https://github.com/github/codeql-action)
   - [`actions/setup-node`](https://github.com/actions/setup-node)

2. **Update workflow file:**
   - Edit `.github/workflows/codeql-analysis.yml`
   - Replace `actions/checkout@v4` with `your-org/checkout@v4`
   - Replace `github/codeql-action/init@v3` with `your-org/codeql-action/init@v3`
   - Replace `actions/setup-node@v4` with `your-org/setup-node@v4`
   - Replace `github/codeql-action/analyze@v3` with `your-org/codeql-action/analyze@v3`

After enabling CodeQL, you'll see security analysis results in:
- The **Security** tab of your repository
- Pull request checks
- Automated weekly reports

## Security Features

VCVQ implements comprehensive security measures:

- **Security Headers:** Helmet middleware provides security headers including CSP, X-Frame-Options, and more
- **CORS Protection:** Configurable CORS with secure defaults (allows localhost, requires ALLOWED_ORIGINS for cross-origin)
- **Rate Limiting:** API endpoints are rate-limited to prevent abuse
- **Input Validation:** Server-side validation using express-validator
- **XSS Protection:** HTML escaping for all user-controlled and AI-generated content
- **Prompt Injection Prevention:** Sanitization of user inputs in AI prompts
- **JSON Parsing Error Handling:** Prevents server crashes from malformed responses
- **Docker Security:** Non-root user, security options, resource limits
- **Fuzzing:** Property-based testing with fast-check to detect vulnerabilities through automated testing with random and malicious inputs

For detailed security information, see `SECURITY.md` and `FUZZING.md`.

## Development Prompts and AI Assistance

VCVQ includes built-in AI assistance for development through VS Code. The project contains comprehensive prompts and guidelines in the `prompts/` directory that help maintain consistency and best practices.

### Using the `/vibe` Command

VS Code is configured with a custom `/vibe` command for project-specific assistance:

1. **Access the Command:**
   - Open VS Code command palette (Cmd+Shift+P or Ctrl+Shift+P)
   - Type `/vibe` followed by your question
   - Get contextual help based on project requirements

2. **Example Queries:**
   ```
   /vibe How do I add a new language?
   /vibe What's the pattern for adding new question types?
   /vibe How should I implement Tesla browser optimizations?
   ```

3. **Key Features:**
   - Tesla browser compatibility focus (1180x919)
   - Security requirement checking
   - Code pattern suggestions
   - Project-specific best practices

### Prompt Files Structure

```
prompts/
├── copilot-role.md       # AI assistant role definition
├── development-guidelines.md  # Technical standards
├── feature-specifications.md  # Feature requirements
├── security-requirements.md   # Security implementations
└── README.md             # Prompt documentation
```

### Using AI Assistance

1. **For New Features:**
   - Check `prompts/feature-specifications.md`
   - Use `/vibe` for implementation guidance
   - Follow patterns in example code

2. **For Security:**
   - Reference `prompts/security-requirements.md`
   - Use `/vibe` to verify security practices
   - Check existing validation patterns

3. **For UI Changes:**
   - Consider Tesla browser compatibility
   - Follow existing UI patterns
   - Test at 1180x919 resolution

4. **Best Practices:**
   - Start with prompt files for context
   - Use `/vibe` for specific guidance
   - Follow existing code patterns
   - Maintain security standards

## Technology Stack

- **Backend:** Node.js, Express 5.x
- **AI:** Google Gemini API (with automatic fallback: gemini-2.5-flash → gemini-2.0-flash → gemini-flash-latest → gemini-2.5-pro → gemini-pro-latest)
- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Features:** HTML5 Drag and Drop API, Internationalization (i18n)
- **Security:** Helmet (security headers), CORS, express-rate-limit, express-validator
- **Testing:** fast-check (property-based fuzzing), Node.js test runner
- **Deployment:** Docker, docker-compose

## API Endpoints

- `POST /api/generate-quiz` - Generate quiz questions (requires: topic, language, numQuestions, numAnswers)
- `POST /api/generate-player-names` - Generate AI player names (requires: language, count, topic)
- `POST /api/generate-topic` - Generate random funny topics (requires: language, count)
- `POST /api/log-client-info` - Log client information for analytics
- `GET /health` - Health check endpoint for monitoring

All endpoints include rate limiting, input validation, and security headers. See `prompts/` directory for detailed specifications and development guidelines.

## Testing & Fuzzing

VCVQ includes comprehensive fuzzing to improve security and reliability:

```bash
# Run all tests
npm test

# Run fuzz tests
npm run test:fuzz

# Run fuzz tests with verbose output
npm run test:fuzz:verbose
```

Fuzzing runs automatically on:
- Every pull request
- Pushes to main branch
- Weekly scheduled runs
- Manual workflow dispatch

For detailed fuzzing documentation, see `FUZZING.md`.

## Environment Variables

- `GEMINI_API_KEY` (required) - Your Google Gemini API key
- `PORT` (optional) - Server port, defaults to 3030
- `NODE_ENV` (optional) - Environment mode (development/production), defaults to production in Docker
- `ALLOWED_ORIGINS` (optional) - Comma-separated list of allowed CORS origins for cross-origin requests. If not set, only localhost and same-origin requests are allowed.

## License

MIT License - Feel free to use and modify!

## Credits

Created by the Vibe Coded team 🚀
