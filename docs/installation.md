# Installation Guide

This guide covers how to install and run VCVQ.

## Prerequisites

- Docker and docker-compose installed
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

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

Edit `.env` and add your Gemini API key:

```env
GEMINI_API_KEY=your_actual_api_key_here
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
# Add your GEMINI_API_KEY to the .env file
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
| `GEMINI_API_KEY` | Yes | - | Your Google Gemini API key |
| `PORT` | No | 3030 | Server port number |
| `NODE_ENV` | No | production | Environment mode (development/production) |
| `ALLOWED_ORIGINS` | No | localhost only | Comma-separated list of allowed CORS origins |

## Getting a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key and add it to your `.env` file

## Verifying Installation

Once the application is running, you can verify it's working:

1. Open `http://localhost:3030` in your browser
2. You should see the VCVQ landing page
3. Try starting a quiz to verify the Gemini API connection

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

If you see errors related to the Gemini API:

- Verify your API key is correct in `.env`
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
- [API Reference](api.md) - API endpoint documentation

