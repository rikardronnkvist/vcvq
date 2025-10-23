# 🎯 Vibe Coded Vibe Quiz (VCVQ)

A real-time multiplayer quiz game web application where 2-4 players can compete in turn-based quiz rounds with AI-generated questions.

## 🌟 Features

- **Real-time Multiplayer**: Support for 2-4 players simultaneously
- **AI-Generated Questions**: Uses Google Gemini AI to generate quiz questions on any topic
- **Turn-Based Gameplay**: Players take turns answering questions
- **Drag & Drop Interface**: Intuitive HTML5 drag-and-drop answer selection
- **Visual Feedback**: Green/red feedback with correct answers shown
- **Real-time Scoring**: Live score tracking throughout the game
- **Multi-language Support**: Swedish (default) and English
- **Responsive Design**: Works on desktop and tablets
- **Docker Ready**: Easy deployment with Docker and docker-compose

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (for local development)
- Docker and Docker Compose (for containerized deployment)
- Google Gemini API key

### 1. Get Google Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key for configuration

### 2. Local Development

```bash
# Clone the repository
git clone https://github.com/rikardronnkvist/vcvq.git
cd vcvq

# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start the development server
npm run dev
```

The application will be available at `http://localhost:3030`

### 3. Docker Deployment

```bash
# Clone the repository
git clone https://github.com/rikardronnkvist/vcvq.git
cd vcvq

# Set up environment variables
cp env.example .env
# Edit .env and add your GEMINI_API_KEY

# Build and start with Docker Compose
docker-compose up -d

# Check if the container is running
docker-compose ps

# View logs
docker-compose logs -f
```

The application will be available at `http://localhost:3030`

## 🎮 How to Play

1. **Choose Topic**: Enter any topic you want to quiz about
2. **Select Language**: Choose between Swedish or English
3. **Generate Questions**: The AI will create 10 multiple-choice questions
4. **Setup Players**: Choose 2-4 players and enter their names
5. **Play**: Players take turns dragging their player number to answer boxes
6. **Score**: Points are awarded for correct answers
7. **Win**: The player with the most points wins!

## 🛠️ Technical Details

### Architecture

- **Backend**: Node.js with Express
- **Real-time**: Socket.io for live updates
- **AI**: Google Gemini API for question generation
- **Frontend**: Vanilla JavaScript with HTML5 Drag & Drop
- **Styling**: Modern CSS with responsive design

### API Endpoints

- `POST /api/generate-quiz` - Generate quiz questions for a topic

### Socket Events

- `join-game` - Join a game room
- `start-game` - Start a new game
- `submit-answer` - Submit an answer
- `game-started` - Game has started
- `player-turn` - Current player's turn
- `answer-feedback` - Answer feedback
- `next-question` - Move to next question
- `game-finished` - Game completed

## 🐳 Docker Configuration

The application includes:

- **Dockerfile**: Multi-stage build with Node.js Alpine
- **docker-compose.yml**: Production-ready configuration
- **Health checks**: Automatic container health monitoring
- **Security**: Non-root user execution
- **Environment variables**: Configurable via .env file

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | Required |
| `PORT` | Server port | 3030 |
| `NODE_ENV` | Environment | production |

## 📁 Project Structure

```
vcvq/
├── public/                 # Frontend files
│   ├── index.html         # Main HTML page
│   ├── styles.css         # CSS styles
│   └── app.js             # Frontend JavaScript
├── services/              # Backend services
│   └── quizService.js     # AI question generation
├── server.js              # Express server
├── package.json           # Dependencies
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose setup
├── .gitignore            # Git ignore rules
└── README.md              # This file
```

## 🔧 Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Adding Features

1. Backend changes go in `server.js` or `services/`
2. Frontend changes go in `public/`
3. Update tests as needed
4. Test with Docker before committing

## 🚀 Deployment

### Self-Hosting with Docker

1. **Server Setup**:
   ```bash
   # On your server
   git clone https://github.com/rikardronnkvist/vcvq.git
   cd vcvq
   cp env.example .env
   # Edit .env with your API key
   docker-compose up -d
   ```

2. **Reverse Proxy** (Optional):
   Use nginx or similar to proxy requests to port 3030

3. **SSL Certificate** (Recommended):
   Use Let's Encrypt for HTTPS

### Environment Configuration

Create a `.env` file with:
```bash
GEMINI_API_KEY=your_actual_api_key_here
PORT=3030
NODE_ENV=production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/rikardronnkvist/vcvq/issues)
- **Documentation**: This README
- **API Key**: [Google AI Studio](https://makersuite.google.com/app/apikey)

## 🎯 Game Rules

- 2-4 players per game
- 10 questions per game
- 6 answer options per question
- Only 1 correct answer per question
- Turn-based gameplay
- Real-time scoring
- Winner determined by highest score

---

**Enjoy playing Vibe Coded Vibe Quiz! 🎉**
