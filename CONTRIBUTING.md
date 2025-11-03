# Contributing to VCVQ

Thank you for your interest in contributing to VCVQ! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

## How to Contribute

### Reporting Bugs

1. **Check existing issues** - Make sure the bug hasn't already been reported
2. **Create a new issue** - Use the bug report template
3. **Provide details:**
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser/device information (especially Tesla browser if applicable)
   - Screenshots if relevant

### Suggesting Features

1. **Check existing issues** - See if the feature has been discussed
2. **Open a feature request** - Describe the feature and its use case
3. **Consider:**
   - How it fits with the car-friendly design
   - Tesla browser compatibility (1180x919 resolution)
   - Security implications
   - Internationalization (Swedish/English support)

### Submitting Code

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Follow coding standards** (see below)
5. **Test your changes**
6. **Commit with clear messages:**
   ```bash
   git commit -m "Add feature: description of changes"
   ```
7. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Create a Pull Request**

## Development Setup

### Prerequisites

- Node.js 18+ 
- Docker and docker-compose (for containerized development)
- Google Gemini API key (for AI features)

### Local Setup

1. **Clone your fork:**
   ```bash
   git clone https://github.com/your-username/vcvq.git
   cd vcvq
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   # Add your GEMINI_API_KEY
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

### Docker Setup

```bash
docker-compose up -d
```

## Coding Standards

### JavaScript/Node.js

- Use ES6+ features where appropriate
- Follow existing code style and patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and single-purpose

### Security Requirements

- **Always escape HTML** - Use `escapeHtml()` function for user input
- **Validate server-side** - Never trust client-side validation alone
- **Sanitize inputs** - Use `sanitizeLog()` and `sanitizePromptInput()` functions
- **No hardcoded secrets** - Use environment variables
- **Review security implications** - Check `SECURITY.md` and `prompts/security-requirements.md`

### Internationalization (i18n)

- All user-facing text must be translatable
- Add translations to `public/i18n.js` for both Swedish (`sv`) and English (`en`)
- Use the `t()` function for translations
- Test both languages

### Tesla Browser Compatibility

- Test at 1180x919 resolution
- Avoid complex CSS that might not render correctly
- Ensure dropdowns work (Tesla browser has specific issues)
- Test drag-and-drop functionality
- Keep animations simple and performant

### Code Structure

- **Client-side:** `public/` directory
  - `game.js` - Game logic
  - `index.html` - Landing page
  - `game.html` - Game page
  - `i18n.js` - Translations
  - `styles.css` - Styling

- **Server-side:** `server.js`
  - API endpoints
  - Security middleware
  - AI integration

## Testing

Before submitting a PR, ensure:

1. **Local testing:**
   - Test in both Swedish and English
   - Test with 2-5 players
   - Test different question counts
   - Test on different screen sizes (especially 1180x919)

2. **Security testing:**
   - No XSS vulnerabilities
   - Input validation works
   - Rate limiting functions
   - No secrets exposed

3. **Browser testing:**
   - Modern browsers (Chrome, Firefox, Safari)
   - Tesla browser (if possible)
   - Mobile/tablet browsers

## Pull Request Process

1. **Update documentation** if needed
2. **Update CHANGELOG.md** if applicable
3. **Ensure all tests pass** (if tests are added)
4. **Follow PR template:**
   - Clear description of changes
   - Related issues
   - Screenshots (for UI changes)
   - Testing performed

5. **PR will be reviewed for:**
   - Code quality and style
   - Security implications
   - Compatibility (especially Tesla browser)
   - Performance impact
   - Documentation updates

## Development Guidelines

### Using AI Assistance

This project uses AI assistance through VS Code. See `README.md` for details on the `/vibe` command and prompt files in `prompts/` directory.

### Key Files to Review

- `prompts/development-guidelines.md` - Technical standards
- `prompts/feature-specifications.md` - Feature requirements
- `prompts/security-requirements.md` - Security practices
- `SECURITY.md` - Security policy

### Common Patterns

**Adding translations:**
```javascript
// In public/i18n.js
const translations = {
  sv: {
    newKey: 'Swedish text'
  },
  en: {
    newKey: 'English text'
  }
};
```

**Escaping HTML:**
```javascript
// Always escape user input
element.innerHTML = escapeHtml(userInput);
```

**API endpoint:**
```javascript
// Follow existing pattern with validation and rate limiting
app.post('/api/your-endpoint', apiLimiter, validateInput, async (req, res) => {
  // Implementation
});
```

## What to Contribute

### High Priority

- Bug fixes
- Security improvements
- Performance optimizations
- Tesla browser compatibility fixes
- Accessibility improvements

### Feature Ideas

- Additional languages
- New question types
- UI/UX improvements
- Performance enhancements
- Documentation improvements

### Areas Needing Help

- Testing (especially Tesla browser)
- Documentation
- Internationalization
- Accessibility
- Performance optimization

## Questions?

- Open an issue for questions
- Check existing documentation
- Review `prompts/` directory for development guidelines
- Use GitHub Discussions if enabled

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to VCVQ! 🚀

