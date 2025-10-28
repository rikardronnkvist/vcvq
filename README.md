# 🎮 Vibe Coded Vibe Quiz (VCVQ)

A real-time multiplayer quiz game designed for car trips! Generate AI-powered quiz questions on any topic and compete with 2-5 players using an intuitive drag-and-drop or click interface.

**Project home:** https://github.com/rikardronnkvist/vcvq

## Features

- 🚗 **Car-Friendly Design** - Perfect for road trips with easy drag-and-drop or click controls
- 🤖 **AI-Generated Questions** - Powered by Google Gemini to create quizzes on any topic
- 👥 **2-5 Players** - Multiplayer support with AI-generated or customizable player names
- 🌍 **Bilingual** - Support for Swedish and English
- 🎨 **Visual Feedback** - Color-coded players with real-time scoring
- 📱 **Responsive** - Works on desktop and tablets (optimized for Tesla Model Y browser at 1180x919)
- 🐳 **Docker Ready** - Easy deployment with Docker and docker-compose
- 🎲 **AI Player Names** - Generate fun, context-aware player names with one click
- ⚙️ **Customizable** - Choose 5-50 questions and 4-8 answer options per question

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
```

4. **Start the application:**
```bash
   docker-compose up -d
```

5. **Open your browser:**
http://localhost:3030


## How to Play

1. **Setup:**
   - Select language (Swedish or English)
   - Enter a quiz topic (e.g., "Science", "Movies", "Geography")
   - Choose number of players (2-5, default: 2)
   - Choose number of questions (5-50, default: 10)
   - Choose number of answer options (4, 6, or 8, default: 6)
   - Generate AI player names or customize them manually

2. **Game Flow:**
   - A random player starts each question
   - ALL players answer EACH question in numerical sequence
   - Players can drag their numbered token OR click on answer boxes
   - Feedback shown after all players have answered
   - Green = correct, Red = incorrect (correct answer shown)
   - 5-second delay between questions for review
   - Game continues for your selected number of questions

3. **Winning:**
   - Player with highest score wins
   - Option to replay with same players or start fresh

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

## Technology Stack

- **Backend:** Node.js, Express
- **AI:** Google Gemini Free Tier
- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Features:** HTML5 Drag and Drop API
- **Deployment:** Docker, docker-compose

## License

MIT License - Feel free to use and modify!

## Credits

Created by the Vibe Coded team 🚀
