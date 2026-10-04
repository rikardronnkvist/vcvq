# Installation Guide

This guide covers how to install and run VCVQ.

## Prerequisites

- Docker and docker-compose installed
- At least one AI API key: [Gemini](https://aistudio.google.com/app/apikey), [ChatGPT](https://platform.openai.com/api-keys), [Claude](https://console.anthropic.com/settings/keys), or [Perplexity](https://www.perplexity.ai/settings/api)

## Quick Start with Docker (Recommended)

### 1. Get the Project

Clone the repository or extract the project files:

```bash
git clone https://github.com/rikardronnkvist/vcvq.git
cd vcvq
```

### 2. Create Environment File

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

### 3. Configure Environment Variables

Edit `.env` and add one or more AI provider API keys. VCVQ only displays providers with a configured key:

```env
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key
PORT=3030
# Optional: For cross-origin requests, set ALLOWED_ORIGINS
# ALLOWED_ORIGINS=http://example.com,https://another-domain.com
```

### 4. Start the Application

```bash
docker-compose up -d
```

### 5. Access the Application

Open your browser and navigate to:

```
http://localhost:3030
```

## Manual Installation (Without Docker)

If you prefer to run VCVQ without Docker:

### 1. Install Node.js

Ensure you have Node.js 18+ installed:

```bash
node --version  # Should be 18.x or higher
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

```bash
cp .env.example .env
# Add at least one AI provider API key to the .env file
```

### 4. Run the Application

For development (with auto-reload):

```bash
npm run dev
```

For production:

```bash
npm start
```

The application will be available at `http://localhost:3030`.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | One provider required | - | Google Gemini API key |
| `OPENAI_API_KEY` | One provider required | - | OpenAI API key for ChatGPT |
| `ANTHROPIC_API_KEY` | One provider required | - | Anthropic API key for Claude |
| `PERPLEXITY_API_KEY` | One provider required | - | Perplexity API key |
| `PORT` | No | 3030 | Server port number |
| `NODE_ENV` | No | production | Environment mode (development/production) |
| `ALLOWED_ORIGINS` | No | localhost only | Comma-separated list of allowed CORS origins |

## Getting an AI API Key

Create an API key from one or more of the provider consoles:

- [Google AI Studio](https://aistudio.google.com/app/apikey)
- [OpenAI platform](https://platform.openai.com/api-keys)
- [Anthropic console](https://console.anthropic.com/settings/keys)
- [Perplexity settings](https://www.perplexity.ai/settings/api)

Copy each key to its corresponding variable in `.env`. Only providers with keys configured are available in the app.

## Verifying Installation

Once the application is running, you can verify it's working:

1. Open `http://localhost:3030` in your browser
2. You should see the VCVQ landing page
3. Select a configured AI provider and start a quiz to verify the connection

### Health Check

You can also check the health endpoint:

```bash
curl http://localhost:3030/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-05T12:00:00.000Z"
}
```

## Docker Commands

### Stop the Application

```bash
docker-compose down
```

### View Logs

```bash
docker-compose logs -f
```

### Rebuild After Changes

```bash
docker-compose up -d --build
```

### Remove All Data

```bash
docker-compose down -v
```

## Troubleshooting

### Port Already in Use

If port 3030 is already in use, change it in your `.env` file:

```env
PORT=3031
```

Then restart the application.

### API Key Issues

If you see errors related to an AI provider:

- Verify the provider's API key is correct in `.env`
- Check that your API key has not been revoked
- Ensure you have billing enabled (if required by Google)

### Docker Issues

If Docker fails to start:

- Ensure Docker Desktop is running
- Check Docker has enough resources allocated
- Try `docker-compose down` and then `docker-compose up -d`

### Permission Issues

If you encounter permission errors with Docker:

- On Linux, you may need to add your user to the docker group:
  ```bash
  sudo usermod -aG docker $USER
  ```
- Log out and back in for changes to take effect

## Next Steps

- [User Guide](usage.md) - Learn how to use VCVQ
- [Development Guide](development.md) - Set up development environment
- [API Reference](interface-reference.md) - Complete API documentation
