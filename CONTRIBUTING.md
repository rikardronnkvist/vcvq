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

For complete development environment setup, see the **[Development Guide](docs/development.md)**.

Quick start:
1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Create `.env` file with your `GEMINI_API_KEY`
4. Run development server: `npm run dev`

## Coding Standards

For complete coding standards and best practices, see the **[Development Guide](docs/development.md)**.

Key requirements:
- **Security:** Always escape HTML, validate inputs, sanitize data
- **Internationalization:** Support Swedish and English
- **Tesla Compatibility:** Test at 1180x919 resolution
- **Code Quality:** Follow existing patterns, add comments for complex logic

## Testing

Before submitting a PR:

```bash
npm test                    # Run all tests
npm run test:fuzz           # Run fuzz tests
```

Test checklist:
- Both languages (Swedish/English)
- Different player counts (2-5)
- Various screen sizes (especially 1180x919)
- No security vulnerabilities

For detailed testing information, see the **[Testing Guide](docs/testing.md)**.

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

## Development Resources

- **[Development Guide](docs/development.md)** - Complete technical documentation
- **[Testing Guide](docs/testing.md)** - Testing and fuzzing
- **[API Reference](docs/interface-reference.md)** - API documentation
- **[Security Policy](SECURITY.md)** - Security practices
- **Prompts Directory** - AI assistance and coding patterns (`prompts/`)

## What to Contribute

**High Priority:**
- Bug fixes and security improvements
- Tesla browser compatibility
- Accessibility enhancements

**Feature Ideas:**
- Additional languages
- UI/UX improvements
- Documentation enhancements

**Need Help?**
- Open a GitHub issue
- Check the documentation in `docs/`
- Review the development guide

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to VCVQ! 🚀

