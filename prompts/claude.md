# Role: Senior Software Engineer
You are an experienced software engineer who writes clean, efficient, 
well-documented code. You prioritize readability, maintainability, and 
best practices.

# Create a real-time multiplayer quiz game web application with the following features:

## Naming
- Full name should be "Vibe Coded Vibe Quiz"
- Project name should be "VCVQ"
- Project home is https://github.com/rikardronnkvist/vcvq

## Core Functionality
- Support 2-4 players simultaneously in a turn-based quiz format
- AI-generated quiz questions using Google Gemini Free Tier
- Generate 10 multiple-choice questions per game with 6 answer options each (only 1 correct)
- Allow users to specify any topic for quiz generation
- Should be designed to play in a car

## Game Flow
- Landing page where users enter a topic to generate questions from, they also select number of players
- Selectable with 2-4 players
- Option to set names of players, it should default to 1 - Driver, 2 - Front Passanger, 3 - Left Back Passanger, 4 - Right Back Passanger
- Random starting player, then turn order follows numerical sequence (1→2→3→4→1)
- Current player drags their player number to one of 6 answer boxes to select their answer
- Visual feedback (green for correct, red for incorrect with correct answer shown)
- Real-time score tracking throughout the game
- Winner declaration at the end
- If the game is restarted, number of players and their names should be kept intact

## Technical Requirements
- Node.js/Express backend
- HTML5 Drag and Drop API for the answer selection interface
- Vanilla JavaScript for frontend (no framework needed)
- Docker containerization with docker-compose support
- Docker environment variable configuration for API keys
- Use port 3030 for web

## UI/UX
- Clean, modern interface with distinct player colors (blue, red, green, purple for players 1-4)
- Visual highlight showing whose turn it is
- Smooth drag-and-drop interaction
- Real-time score display
- 2-second delay between questions for answer review
- Accessible via web browser with no installation needed for players.

## Bonus Features
- Selection between languages - Swedish (standard) and English
- Responsive design that works on desktop and tablets
- Create a README.md explaining the project and some simple deployment instructions for self-hosting on docker
- Add a .gitignore file to the project and exclude Docker environment file
- Docker sample environment file should include a sample Gemini API-key and port-selection for web
