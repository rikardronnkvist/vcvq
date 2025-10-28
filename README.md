# 🎮 Vibe Coded Vibe Quiz (VCVQ)

A real-time multiplayer quiz game designed for car trips! Generate AI-powered quiz questions on any topic and compete with 2-4 players using an intuitive drag-and-drop interface.

**Project home:** https://github.com/rikardronnkvist/vcvq

## Features

- 🚗 **Car-Friendly Design** - Perfect for road trips with easy drag-and-drop controls
- 🤖 **AI-Generated Questions** - Powered by Google Gemini to create quizzes on any topic
- 👥 **2-4 Players** - Multiplayer support with customizable player names
- 🌍 **Bilingual** - Support for Swedish and English
- 🎨 **Visual Feedback** - Color-coded players with real-time scoring
- 📱 **Responsive** - Works on desktop and tablets
- 🐳 **Docker Ready** - Easy deployment with Docker and docker-compose

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
(http://localhost:3030)http://localhost:3030


## How to Play

1. **Setup:**
   - Select language (Swedish or English)
   - Enter a quiz topic (e.g., "Science", "Movies", "Geography")
   - Choose number of players (2-4)
   - Customize player names or use defaults

2. **Game Flow:**
   - A random player starts
   - Current player drags their numbered token to answer boxes
   - Green = correct, Red = incorrect (correct answer shown)
   - Turn passes to next player automatically
   - Game continues for 10 questions

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
