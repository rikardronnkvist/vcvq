# VCVQ Documentation

Welcome to the Vibe Coded Vibe Quiz (VCVQ) documentation!

## Table of Contents

- [Overview](#overview)
- [External Interface Reference](interface-reference.md) - **Complete reference for all inputs/outputs**
- [API Reference](api.md)
- [Installation Guide](installation.md)
- [User Guide](usage.md)
- [Development Guide](development.md)
- [Security](../SECURITY.md)
- [Contributing](../CONTRIBUTING.md)

## Overview

VCVQ is a real-time multiplayer quiz game designed for car trips! Generate AI-powered quiz questions on any topic and compete with 2-5 players using an intuitive drag-and-drop or click interface.

### Key Features

- 🚗 **Car-Friendly Design** - Perfect for road trips with easy drag-and-drop or click controls
- 🤖 **AI-Generated Questions** - Powered by Google Gemini to create quizzes on any topic
- 🎲 **Random Topics** - Get 15 AI-generated funny topics with one click, or enter your own
- 👥 **2-5 Players** - Multiplayer support with AI-generated or customizable player names
- 🌍 **Bilingual** - Support for Swedish and English with easy language switching
- 🎨 **Visual Feedback** - Color-coded players with real-time scoring
- 📱 **Responsive** - Works on desktop and tablets (optimized for Tesla Model Y browser)
- 🐳 **Docker Ready** - Easy deployment with Docker and docker-compose

### Technology Stack

- **Backend:** Node.js, Express 5.x
- **AI:** Google Gemini API
- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Security:** Helmet, CORS, Rate Limiting, Input Validation
- **Testing:** Property-based fuzzing with fast-check
- **Deployment:** Docker, docker-compose

## Reference Documentation

VCVQ provides comprehensive **external interface documentation** describing all inputs and outputs:

- **[External Interface Reference](interface-reference.md)** - Complete reference documentation for:
  - All API inputs (request formats, parameters, validation rules)
  - All API outputs (response formats, data structures, error conditions)
  - Web interface inputs and outputs
  - Configuration interface (environment variables)
  - Interface contracts and guarantees

- **[API Reference](api.md)** - Detailed API documentation with:
  - Endpoint descriptions
  - Request/response examples
  - Error handling
  - Usage examples in multiple languages

## Getting Started

To get started with VCVQ, see the [Installation Guide](installation.md).

## Project Links

- **GitHub Repository:** https://github.com/rikardronnkvist/vcvq
- **License:** MIT
- **Issue Tracker:** https://github.com/rikardronnkvist/vcvq/issues

## Support

- For bug reports, see [Contributing Guide](../CONTRIBUTING.md)
- For security vulnerabilities, see [Security Policy](../SECURITY.md)
- For general questions, open a GitHub issue

