# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-05

### Added
- Initial release of VCVQ (Vibe Coded Vibe Quiz)
- Real-time multiplayer quiz game for 2-5 players
- AI-powered question generation using Google Gemini API
- Random topic generation with 15 AI-suggested topics
- AI-generated player names based on topic and context
- Bilingual support (Swedish and English)
- Drag-and-drop and click interfaces for answering
- Visual feedback with color-coded players
- Player badges on answer boxes
- Tesla Model Y browser compatibility (1180x919 resolution)
- Docker and docker-compose deployment
- Security features:
  - Input validation with express-validator
  - Rate limiting on all API endpoints
  - XSS protection with HTML escaping
  - Prompt injection prevention
  - Log injection prevention
  - Security headers via Helmet
  - CORS protection
  - Non-root Docker container
- Property-based fuzzing tests with fast-check
- ClusterFuzz-compatible fuzz targets
- GitHub Actions CI/CD with automated testing
- Comprehensive documentation:
  - README with quick start guide
  - SECURITY.md with vulnerability reporting
  - CONTRIBUTING.md with contribution guidelines
  - CODE_OF_CONDUCT.md
  - FUZZING.md with testing documentation
  - Complete docs/ folder with detailed guides
- Customizable game settings:
  - 5-50 questions per game
  - 4-8 answer options per question
  - Custom or random topics
  - Custom or AI-generated player names
- Game features:
  - Fair player rotation for starting each question
  - Real-time scoring
  - Support for tied winners
  - "Play Again" with preserved settings
  - "End Game" option
  - 5-second answer review period

### Security
- Implemented comprehensive input validation
- Added rate limiting (10 requests per 15 minutes per IP)
- Implemented XSS protection via HTML escaping
- Added prompt injection sanitization for AI inputs
- Implemented log injection prevention
- Added security headers (CSP, X-Frame-Options, etc.)
- Configured secure CORS policy
- Docker container runs as non-root user
- Added fuzzing tests for security-critical functions

### Documentation
- Created comprehensive README.md
- Added SECURITY.md with vulnerability reporting process
- Created CONTRIBUTING.md with development guidelines
- Added CODE_OF_CONDUCT.md (Contributor Covenant 2.1)
- Created FUZZING.md with testing documentation
- Added complete docs/ folder:
  - Installation guide
  - User guide
  - API reference
  - Development guide

### Testing
- Implemented property-based fuzzing with fast-check
- Created ClusterFuzz-compatible fuzz targets
- Added GitHub Actions workflow for automated testing
- Added extended fuzzing on weekly schedule
- Test coverage for all security-critical functions

## [Unreleased]

### Planned
- Additional language support beyond Swedish and English
- More quiz customization options
- Enhanced Tesla browser compatibility
- Performance optimizations
- Additional test coverage

---

## Version History

- **[1.0.0]** - 2025-11-05: Initial public release

## How to Read This Changelog

### Change Categories

- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security improvements

### Version Numbers

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality additions
- **PATCH** version for backwards-compatible bug fixes

## Links

- [Repository](https://github.com/rikardronnkvist/vcvq)
- [Issue Tracker](https://github.com/rikardronnkvist/vcvq/issues)
- [Security Policy](SECURITY.md)

