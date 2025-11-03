# Development Guidelines

## Technical Stack

### Backend
- **Runtime:** Node.js with Express.js framework
- **API:** RESTful API with JSON responses
- **Containerization:** Docker with multi-stage builds
- **Port:** Default 3030 (configurable via environment variable)

### Frontend
- **JavaScript:** Vanilla JavaScript (no frameworks)
- **UI:** HTML5 with native Drag and Drop API
- **Styling:** CSS3 with responsive design
- **Internationalization:** Separate i18n file for translations

### AI Integration
- **Provider:** Google Gemini Free Tier
- **Model Fallback Order:**
  1. gemini-2.5-flash (primary)
  2. gemini-2.0-flash
  3. gemini-flash-latest
  4. gemini-2.5-pro
  5. gemini-pro-latest

### Dependencies
- `express-rate-limit: ^7.1.5` - Rate limiting
- `express-validator: ^7.0.1` - Input validation
- `@google/generative-ai` - Google Gemini API integration

## Code Standards

### Code Quality
- Write clean, readable code with meaningful variable names
- Add comments for complex logic
- Keep functions focused and single-purpose
- Use consistent indentation (2 spaces for JavaScript)
- Follow existing code patterns in the codebase

### Logging
- Use `console.log()` for game flow logging
- Use `console.error()` for errors
- All user-controlled values must be sanitized before logging using `sanitizeLog()` helper function
- Prevent log injection attacks (CWE-117)
- See `server.js` for sanitization implementation

### Error Handling
- Environment-aware error messages
- Detailed errors in development mode
- Generic errors in production mode
- Never leak sensitive information in production
- User-friendly messages for AI service overload (503 errors)
- Specific error code (OVERLOADED) returned with HTTP 503 status
- Localized error messages via i18n system

### File Organization
```
/
├── server.js              # Express backend with API routes
├── public/
│   ├── index.html         # Landing page
│   ├── game.html          # Game interface
│   ├── game.js            # Game logic
│   ├── i18n.js            # Translations
│   ├── styles.css         # Styling
│   ├── logo.png           # Project logo
│   └── logo.ico           # Favicon
├── prompts/               # Development prompts and documentation
├── Dockerfile             # Multi-stage Docker build
├── docker-compose.yml     # Docker orchestration
├── package.json           # Dependencies and scripts
├── .env.example           # Environment variable template
├── README.md              # User-facing documentation
└── SECURITY.md            # Security policy
```

## Docker Development

### Docker Configuration
- Multi-stage builds for optimized image size (~40% reduction)
- Non-root user: `nodejs:1001`
- Built-in health checks every 30 seconds
- Resource limits: 1 CPU core, 512MB memory
- Security options: `no-new-privileges` flag

### Environment Variables
Create `.env` file from `.env.example`:
```env
GEMINI_API_KEY=your_actual_api_key_here
PORT=3030
NODE_ENV=production
```

### Docker Commands
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop container
docker-compose down
```

## Testing

### Development Setup
```bash
# Install dependencies
npm install

# Run development server with auto-reload
npm run dev

# Run production server
npm start
```

### Manual Testing Checklist
- Test with 2-5 players
- Test drag-and-drop and click interactions
- Test game restart with settings preservation
- Test random topic generation
- Test AI player name generation
- Test both Swedish and English languages
- Test Tesla browser compatibility (if available)
- Test responsive design on different screen sizes

## Browser Compatibility

### Target Browsers
- Modern desktop browsers (Chrome, Firefox, Safari, Edge)
- Tablet browsers
- Tesla Model Y browser (1180x919 resolution)
- Tesla-compatible: Button groups and +/- selectors instead of dropdowns

### Responsive Design
- Optimize for 1180x919 (Tesla Model Y)
- Ensure usability on desktop and tablets
- Touch-friendly drag-and-drop
- Accessible via web browser (no installation)

## Performance

### Optimization
- Minimize bundle size (vanilla JavaScript)
- Efficient DOM manipulation
- Optimized Docker image size
- Rate limiting to prevent abuse

### Monitoring
- `/health` endpoint for orchestration
- Returns service status, timestamp, and version
- Use for container health checks and load balancers

