# Feature Specifications

## Core Functionality

### Game Play
- Support 2-5 players simultaneously
- Turn-based quiz format
- Designed for car trips (easy controls, large buttons)
- AI-generated quiz questions using Google Gemini
- Multiple-choice questions with only 1 correct answer per question

### Quiz Generation
- User-specified topic for quiz generation
- Topic length: 1-200 characters, sanitized against XSS
- Multiple questions per game (5, 10, 15, 20, 25, 30, 35, 40, 45, or 50)
- Fixed 6 answer options per question

## User Interface

### Landing Page Options
- **Topic Selection:**
  - Text input field for custom topic
  - "🎲 Random" button to get 10 AI-generated funny topics
  - Button group appears after clicking random button (Tesla-compatible)
  - Switch button to return to custom text input
  
- **Game Configuration:**
  - Number of players: +/- selector, 2 (default/min), 3, 4, 5 (max)
  - Number of questions: +/- selector, 5 (min), 10 (default), up to 50 (max), increments of 5
  - Fixed 6 answer options per question (no selector)
  
- **Player Names:**
  - Default names based on car positions:
    1. Driver
    2. Front Passenger
    3. Left Back Passenger
    4. Right Back Passenger
    5. Middle Back Passenger
  - "Generate Names" button for AI-generated funny names
  - AI names are context-aware (language, topic, seating position)
  - Manual customization available

### Language Support
- Swedish (standard) and English
- **All text strings MUST be in the i18n translation file** - NO EXCEPTIONS
- Language switching via flag buttons
- Server-side AI prompts use translations from the i18n file via `t()` function
- When implementing new features:
  - Add all text strings to the i18n file for both languages
  - Use `t(key, language)` function in client-side code
  - Use `t(key, language, ...args)` for server-side code (supports function-based translations)
  - Never hardcode language strings in any other file

### UI/UX Features
- **Visual Design:**
  - Clean, modern interface
  - Distinct player colors (different color for each player)
  - Visual highlight for current player's turn
  - Green highlight for correct answers
  - Red highlight for incorrect answers with correct answer shown
  
- **Interaction:**
  - Smooth drag-and-drop for answer selection
  - Click answer boxes as alternative to drag-and-drop
  - Answer boxes display all answer options
  - Players can drop on the whole answer-box
  - Player badges appear on answer boxes showing selections
  
- **Feedback:**
  - Real-time score tracking throughout game
  - Statistics after each question:
    - "🎉 Everyone answered correctly!"
    - "😅 No one answered correctly!"
    - "X/Y answered correctly"
  - 5-second delay between questions for review
  - User-friendly error messages for AI service issues:
    - Specific message when AI service is overloaded (503 errors)
    - Localized messages in Swedish and English
    - Clear guidance to retry after a few moments
  
- **Controls:**
  - "End Game" button at bottom to end early
  - Winner declaration at end (supports ties)
  - "Play Again" on summary page

## Game Flow

### Starting the Game
1. User enters topic (custom or from random button group)
2. User selects number of players and questions using +/- selectors
3. User configures player names (default or AI-generated)
4. User clicks "Start Quiz" to begin

### Turn Order
- Random starting player for first question
- Starting player rotates for each subsequent question
  - Example: If player 2 starts Q1, player 3 starts Q2, etc.
- Starting order follows numerical sequence from starting player
  - Example: If player 2 starts, order is 2→3→4→5→1→2
- ALL players answer ALL questions in same numerical sequence

### Answer Submission
- Current player drags their player number to answer box OR
- Current player clicks an answer box to select answer
- All players answer each question
- Player badges visible on answer boxes

### Ending the Game
- After all questions answered OR
- After clicking "End Game" button
- Final scoreboard shows all players sorted by score
- Winner(s) declared (ties supported)
- "Play Again" option returns to front page with all settings preserved

### Restarting the Game
- All settings preserved on restart:
  - Number of players
  - Player names
  - Topic
  - Language
  - Number of questions
  - (Number of answers is always 6)
- Returns user to front page with all options pre-filled

## API Endpoints

### POST /api/generate-quiz
Generate quiz questions based on topic and configuration.

**Request Body:**
```json
{
  "topic": "string (1-200 chars)",
  "language": "sv" | "en",
  "numQuestions": "number (5-50)",
  "numAnswers": "number (always 6, optional parameter)"
}
```

**Response:**
```json
{
  "questions": [
    {
      "question": "string",
      "answers": ["string"],
      "correctIndex": "number (0-based)"
    }
  ]
}
```

### POST /api/generate-player-names
Generate AI-powered funny player names.

**Request Body:**
```json
{
  "language": "sv" | "en",
  "count": "number (2-5)",
  "topic": "string"
}
```

**Response:**
```json
{
  "names": ["string"]
}
```

### POST /api/generate-topic
Generate random funny quiz topics.

**Request Body:**
```json
{
  "language": "sv" | "en",
  "count": "number (1-20)"
}
```

**Response:**
```json
{
  "topics": ["string"]
}
```

### POST /api/log-client-info
Log client information for visitor tracking.

**Request Body:**
```json
{
  "pageName": "string",
  "isFirstVisit": "boolean",
  "visitorId": "string"
}
```

**Response:**
```json
{
  "logged": true
}
```

### GET /health
Health check endpoint for monitoring and orchestration.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "ISO 8601 timestamp",
  "version": "string",
  "hostname": "string"
}
```

## Tesla Browser Optimization

### Screen Size
- Optimized for 1180x919 (Tesla Model Y web browser while driving)
- Responsive design for desktop and tablets

### Compatibility
- Tesla browser detection via User-Agent
- Button groups instead of dropdowns for Tesla compatibility
- +/- selectors for number configuration
- Touch-friendly interactions
- Large, accessible buttons

## Bonus Features

### File Management
- `.gitignore` file excluding Docker environment file
- Project README with deployment instructions
- Security policy document for vulnerability reporting
- `package-lock.json` for reproducible builds

### Assets
- `logo.ico` as favicon
- `logo.png` displayed on start page

### Docker Configuration
- Sample environment configuration example file
- Includes Gemini API key option
- Port selection configuration

