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
  - **CRITICAL:** ALL language-specific strings MUST be in the i18n translation file
  - Never hardcode language strings in server-side code, client-side code, or HTML files
  - Server-side AI prompts must use translations from the i18n file via `t()` function
  - Client-side text must use `t(key, language)` function
  - When adding new features, add all text strings to the i18n file for both Swedish and English

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

### Internationalization (i18n) Requirements
- **MANDATORY:** All user-facing text and language-specific strings MUST be in the i18n translation file
- **Server-side strings:** AI prompt instructions, error messages, and any language-specific text must be in the i18n file
- **Client-side strings:** All UI text, labels, buttons, messages must use `t(key, language)` from the i18n file
- **Never hardcode:** Do not put language strings directly in:
  - Server-side code (use `t()` function with keys from i18n file)
  - Client-side JavaScript (use `t()` function)
  - HTML files (use `t()` function in JavaScript)
- **Adding new languages:** When adding a new language:
  1. Add all translation keys to the i18n file
  2. Update server-side validation to accept the new language code
  3. Add AI prompt instructions for the new language in the i18n file
  4. Add language selector button in the UI
- **Server-side usage:** Import and use the `t()` and `getPositions()` functions from the i18n file
- **Function-based translations:** Some server-side strings are functions (e.g., `aiPlayerNamesInstruction`) that accept parameters - these are handled automatically by the `t()` function

### Logging
- Use `console.log()` for game flow logging
- Use `console.error()` for errors
- All user-controlled values must be sanitized before logging using `sanitizeLog()` helper function
- Prevent log injection attacks (CWE-117)
- See server-side code for sanitization implementation

### Error Handling
- Environment-aware error messages
- Detailed errors in development mode
- Generic errors in production mode
- Never leak sensitive information in production
- User-friendly messages for AI service overload (503 errors)
- Specific error code (OVERLOADED) returned with HTTP 503 status
- Localized error messages via i18n system

### File Organization
- Server-side code in the root directory
- Client-side code in the public directory
- Translations in the i18n file
- Development prompts and documentation in the prompts directory
- Docker configuration files in the root
- Configuration files (package.json, .env.example) in the root
- Documentation files (README.md, SECURITY.md) in the root

## Docker Development

### Docker Configuration
- Multi-stage builds for optimized image size (~40% reduction)
- Non-root user: `nodejs:1001`
- Built-in health checks every 30 seconds
- Resource limits: 1 CPU core, 512MB memory
- Security options: `no-new-privileges` flag

### Environment Variables
Create environment file from the example template:
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

Note: Use docker-compose commands as appropriate for your Docker setup.

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

