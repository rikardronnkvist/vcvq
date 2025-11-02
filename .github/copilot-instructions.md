# AI Agent Instructions for VCVQ

## Project Context
VCVQ (Vibe Coded Vibe Quiz) is a real-time multiplayer quiz game optimized for car trips. The project emphasizes clean code, security, and Tesla browser compatibility.

## Core Architecture

### Technology Stack
- **Backend:** Node.js/Express with Google Gemini AI integration
- **Frontend:** Vanilla JavaScript, HTML5 with Drag & Drop API
- **Containerization:** Docker with multi-stage builds
- **AI Models:** Fallback chain from gemini-2.5-flash through gemini-pro-latest

### File Organization
```
/
├── server.js              # Express backend, API routes, AI integration
├── public/               # Frontend assets
├── prompts/              # Development guidelines
├── Dockerfile            # Multi-stage build
└── docker-compose.yml    # Container orchestration
```

## Development Guidelines

### Code Standards
- Use 2-space indentation for JavaScript
- Implement logging with `console.log()` for game flow, `console.error()` for errors
- Sanitize all user inputs before logging using `sanitizeLog()` helper
- Follow existing patterns in the codebase
- Reference: `prompts/development-guidelines.md`

### Security Requirements
1. Input Validation (express-validator)
   - Topic: 1-200 chars, XSS-sanitized
   - Language: 'sv'|'en' only
   - Players: 2-5 integer
   - Questions: 5-50 integer
   - Answers: 4-8 integer

2. Rate Limiting
   - General API: 50 req/15min per IP
   - AI endpoints: 20 req/15min per IP

Reference: `prompts/security-requirements.md`

## Feature Implementation

### Game Flow
1. Landing Page:
   - Topic selection (custom or AI-generated)
   - Game configuration (players, questions, answers)
   - Player names (default/AI-generated/custom)

2. Game Mechanics:
   - Turn-based with rotating start player
   - Drag-and-drop or click interface
   - Real-time feedback and scoring
   - 5-second review period between questions

Reference: `prompts/feature-specifications.md`

### UI/UX Patterns
- Tesla browser optimization (1180x919 resolution)
- Visual feedback for player actions
- Consistent color coding for players
- Accessibility considerations
- i18n support (Swedish/English)

## Integration Points
1. Google Gemini AI
   - Question generation
   - Random topic generation
   - Player name generation
2. Browser APIs
   - Drag and Drop
   - sessionStorage for game state
3. Docker
   - Multi-stage builds
   - Security constraints
   - Resource limits

## Common Tasks

### Adding Features
1. Review `prompts/feature-specifications.md`
2. Follow security guidelines in `prompts/security-requirements.md`
3. Implement proper logging and error handling
4. Ensure Tesla browser compatibility

### Testing
- Manual verification in desktop browsers
- Tesla browser testing at 1180x919
- Rate limit testing
- Input validation verification

## Additional Resources
- Full technical guidelines: `prompts/development-guidelines.md`
- Security implementation: `prompts/security-requirements.md`
- Feature specs: `prompts/feature-specifications.md`
- Development role: `prompts/copilot-role.md`