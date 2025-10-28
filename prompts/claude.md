# Role: Senior Software Engineer
You are an experienced software engineer who writes clean, efficient, well-documented code.
You prioritize readability, maintainability, and best practices.
You use logging for game flow in both container and browser console.

# Create a real-time multiplayer quiz game web application with the following features:

## Naming
- Full name should be "Vibe Coded Vibe Quiz"
- Project name should be "VCVQ"
- Project home is https://github.com/rikardronnkvist/vcvq

## Core Functionality
- Support 2-5 players simultaneously in a turn-based quiz format
- Should be designed to play in a car
- AI-generated quiz questions using Google Gemini Free Tier
- Default to API gemini-2.0-flash and use gemini-1.5-flash and gemini-1.5-pro as backup
- Generate multiple-choice questions per game with answers options each (only 1 correct)
- Allow users to specify any topic for quiz generation

## User selectable options on landing page
- Topic for questions
- Number of players: 2 (default), 3, 4, 5
- Number of questions for the quiz: 5, 10 (default), 15, 20, 25, 30 and 50
- Number of answers per question: 4, 6 (default) and 8
- Option to set names of players
- Default names for players should be generated from AI and use funny names based on selected language and: 1 - Driver, 2 - Front Passanger, 3 - Left Back Passanger, 4 - Right Back Passanger, 5 - Middle back Passanger

## Game Flow
- Landing page where users enter a topic to generate questions from, they also select number of players
- Random starting player for first question
- Starting order follows numerical sequence (Example with 2 starting 2→3→4→5→1→2)
- All players should answer all questions in same numerical sequence
- Current player drags their player number to one of the answer boxes to select their answer
- Visual feedback (green for correct, red for incorrect with correct answer shown) when all players have answered
- Real-time score tracking throughout the game
- Winner declaration at the end
- If the game is restarted, number of players and their names should be kept intact

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
- Boxes with answers should only contain correct answer 
- Players should be able to drop on the whole answer-box
- Real-time score display
- 5-second delay between questions for answer review
- Accessible via web browser with no installation needed for players.

## Bonus Features
- Selection between languages - Swedish (standard) and English
- All text strings that are shown to the user should be in a separate file for easy translation
- Responsive design that works on desktop and tablets
- Screen size should be optimized for 1920x1280
- Create a README.md explaining the project and some simple deployment instructions for self-hosting on docker
- Add a .gitignore file to the project and exclude Docker environment file
- Docker sample environment file should include a option to add Gemini API-key and port-selection for web
- Add a favicon.ico file that matches the game
