# Development Prompts for GitHub Copilot

This directory contains comprehensive prompts and documentation designed for use with GitHub Copilot in VS Code.

## Purpose

These prompts help GitHub Copilot understand the project context, coding standards, and requirements when generating or suggesting code.

## Organization

### 📋 copilot-role.md
Defines the role and context for GitHub Copilot interactions:
- Role definition as Senior Software Engineer
- Git usage guidelines
- Project context and naming
- Cross-references to other documentation

### 🔧 development-guidelines.md
Technical development guidance:
- Technology stack and architecture
- Code quality standards
- Logging best practices
- Docker development workflow
- Testing procedures
- Browser compatibility requirements

### 🎯 feature-specifications.md
Detailed feature requirements:
- Core game functionality
- User interface specifications
- Game flow documentation
- API endpoint specifications
- Tesla browser optimization

### 🔒 security-requirements.md
Security implementations and requirements:
- Input validation rules
- Rate limiting configuration
- Log security practices
- Docker security features
- Security scanning setup
- All implemented security measures

## Usage with GitHub Copilot

### Recommended Workflow

1. **Start with:** `@prompts/copilot-role.md` - Sets the context for all interactions
2. **Reference:** `@prompts/development-guidelines.md` - For technical decisions
3. **Check:** `@prompts/feature-specifications.md` - When implementing features
4. **Review:** `@prompts/security-requirements.md` - Before writing security-sensitive code

### Example Prompts

```
@prompts/copilot-role.md @prompts/development-guidelines.md
Add input validation to the new /api/endpoint endpoint
```

```
@prompts/security-requirements.md
Review this code for security best practices
```

```
@prompts/feature-specifications.md
Implement the random topic generation feature
```

## Project Context

- **Full Name:** Vibe Coded Vibe Quiz
- **Project Name:** VCVQ
- **GitHub:** https://github.com/rikardronnkvist/vcvq
- **Type:** Real-time multiplayer quiz game
- **Stack:** Node.js, Express, Vanilla JavaScript, Google Gemini AI

## Maintenance

### Updating Prompts
When adding new features or changing requirements:
1. Update the relevant prompt file
2. Keep cross-references current
3. Document security implications in `security-requirements.md`
4. Update this README if structure changes

### Version Control
These prompts are part of the project and should be:
- Version controlled with git
- Portable across team members
- Updated as the project evolves
- Referenced in all GitHub Copilot interactions

## Related Documentation

- **[Project README](../README.md)** - User-facing project documentation
- **[Documentation Index](../docs/README.md)** - Complete documentation overview
- **[Development Guide](../docs/development.md)** - Detailed development setup and standards
- **[Testing Guide](../docs/testing.md)** - Testing and fuzzing documentation
- **[Security Policy](../SECURITY.md)** - Security policy and vulnerability reporting
- **[API Reference](../docs/interface-reference.md)** - Complete API documentation

## Security Note

All security requirements in `security-requirements.md` are **already implemented** in the codebase. Use this file as a reference to ensure new code maintains security standards.

