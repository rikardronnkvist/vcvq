# Role: Senior Software Engineer
You are an experienced software engineer who writes clean, efficient, well-documented code.
You prioritize readability, maintainability, and best practices.
You use logging for game flow in both container and browser console.

## Git Usage
- You are allowed to commit changes to GIT
- All commits must have good, descriptive commit messages that clearly explain what was changed and why
- Commit messages should follow best practices: concise summary, optional detailed body

# Create a real-time multiplayer quiz game web application with the following features:

## Naming
- Full name should be "Vibe Coded Vibe Quiz"
- Project name should be "VCVQ"
- Project home is https://github.com/rikardronnkvist/vcvq

## Core Functionality
- Support 2-5 players simultaneously in a turn-based quiz format
- Should be designed to play in a car
- AI-generated quiz questions using Google Gemini Free Tier
- Model fallback order: gemini-2.5-flash (primary), gemini-2.0-flash, gemini-flash-latest, gemini-2.5-pro, gemini-pro-latest
- Generate multiple-choice questions per game with answer options each (only 1 correct)
- Allow users to specify any topic for quiz generation

## User selectable options on landing page
- Topic for questions (text input field)
- Option to use a button to get 10 random AI-generated topics, clicking the random button switches to a dropdown with 10 diverse funny topics to choose from
- Button to switch back to custom text input from dropdown
- Number of players: 2 (default), 3, 4, 5
- Number of questions for the quiz: 5, 10 (default), 15, 20, 25, 30 and 50
- Number of answers per question: 4, 6 (default) and 8
- Option to set names of players
- Default names for players are static based on car positions: 1 - Driver, 2 - Front Passenger, 3 - Left Back Passenger, 4 - Right Back Passenger, 5 - Middle Back Passenger
- Optional AI-generated funny player names via "Generate Names" button, which creates context-aware names based on selected language, quiz topic, and car seating positions

## Game Flow
- Landing page where users enter a topic to generate questions from, they also select number of players, questions, and answers per question
- Random starting player for first question
- For each subsequent question, the starting player rotates (e.g., if player 2 starts question 1, player 3 starts question 2, etc.)
- Starting order follows numerical sequence from the starting player (Example: if player 2 starts, order is 2→3→4→5→1→2)
- All players answer all questions in the same numerical sequence
- Current player drags their player number to one of the answer boxes OR clicks an answer box to select their answer
- Player badges appear on answer boxes showing which players have selected each answer
- Visual feedback (green for correct, red for incorrect with correct answer shown) when all players have answered
- Feedback shows statistics: "🎉 Everyone answered correctly!", "😅 No one answered correctly!", or "X/Y answered correctly"
- Real-time score tracking throughout the game
- "End Game" button at the bottom of the game area allows players to end the game early and jump to scoring
- Winner declaration at the end (supports ties)
- If the game is restarted, all settings are preserved: number of players, player names, topic, language, number of questions, and number of answers
- On the summary page at the end there should be an option to restart the game returning the user to the frontpage with all options filled in with current topic, names etc.

## Technical Requirements
- Node.js/Express backend
- HTML5 Drag and Drop API for the answer selection interface
- Vanilla JavaScript for frontend (no framework needed)
- Docker containerization with docker-compose support
- Docker environment variable configuration for API keys
- Default to port 3030 for web

## UI/UX
- Clean, modern interface with distinct player colors, different color for all players
- Visual highlight showing whose turn it is
- Smooth drag-and-drop interaction for answering
- Allow the player to click an answer-box instead of drag-and-drop
- Answer boxes display all answer options (not just correct answer) 
- Players should be able to drop on the whole answer-box
- Real-time score display
- 5-second delay between questions for answer review
- Accessible via web browser with no installation needed for players.

## Bonus Features
- Selection between languages - Swedish (standard) and English
- All text strings that are shown to the user should be in a separate file for easy translation
- Responsive design that works on desktop and tablets
- Screen size should be optimized for 1180x919 (Tesla Model Y web browser while driving)
- Tesla browser detection via user agent with compatibility fixes for dropdown menus
- Create a README.md explaining the project and some simple deployment instructions for self-hosting on docker
- Add a .gitignore file to the project and exclude Docker environment file
- Docker sample environment file should include a option to add Gemini API-key and port-selection for web
- Use logo.ico as favicon and display logo.png on the start page

## Security & Infrastructure
### Input Validation
- Comprehensive validation using express-validator on all API endpoints
- Topic: 1-200 characters, sanitized against XSS
- Language: Must be 'sv' or 'en'
- numQuestions: Integer between 5-50
- numAnswers: Integer between 4-8
- Player names count: Integer between 2-5
- Topic count: Integer between 1-20

### Rate Limiting
- General API: 50 requests per 15 minutes per IP
- AI Generation endpoints: 20 requests per 15 minutes per IP
- Protects Gemini API quota and prevents abuse

### Error Handling
- Environment-aware error messages (detailed in dev, generic in production)
- Prevents information leakage in production

### Request Security
- Payload size limited to 1MB to prevent memory exhaustion
- All user input sanitized to prevent injection attacks

### Health Monitoring
- `/health` endpoint for container orchestration and load balancer checks
- Returns service status, timestamp, and version info

### Docker Security & Optimization
- Multi-stage builds for smaller images (~40% size reduction)
- Non-root user (nodejs:1001) for container execution
- Built-in health checks every 30 seconds
- Resource limits: 1 CPU core, 512MB memory
- Security options: no-new-privileges flag
- Environment-based configuration (NODE_ENV)

### API Endpoints
- `/api/generate-quiz` - Generates quiz questions based on topic, language, number of questions, and number of answers
- `/api/generate-player-names` - Generates AI-powered funny player names based on language, count, and topic
- `/api/generate-topic` - Generates random funny quiz topics (single or multiple, up to 20)
- `/health` - Health check endpoint for monitoring and orchestration

### Dependencies
- express-rate-limit: ^7.1.5
- express-validator: ^7.0.1
- @google/generative-ai: For Google Gemini API integration
