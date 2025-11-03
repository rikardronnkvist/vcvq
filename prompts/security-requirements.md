# Security Requirements

## Overview
All security requirements listed below are **implemented** in the current codebase. Reference this document when modifying code to ensure compliance.

## Input Validation
**Status: ✅ Implemented using express-validator**

### Validation Rules
All API endpoints use `express-validator` middleware with the following rules:

- **Topic:** 1-200 characters, sanitized against XSS
- **Language:** Must be 'sv' or 'en' (enum validation)
- **numQuestions:** Integer between 5-50
- **numAnswers:** Integer (always 6 in UI, optional in API, defaults to 6)
- **Player names count:** Integer between 2-5
- **Topic count:** Integer between 1-20

### Implementation Reference
See `server.js` validation middleware for all endpoints.

## Rate Limiting
**Status: ✅ Implemented using express-rate-limit**

### Limits
- **General API:** 50 requests per 15 minutes per IP
- **AI Generation endpoints:** 20 requests per 15 minutes per IP

### Protections
- Protects Gemini API quota
- Prevents abuse and DoS attacks
- IP-based tracking with proxy support

### Implementation Reference
See `server.js`:
- `apiLimiter` for general API endpoints
- `strictApiLimiter` for AI generation endpoints
- `app.set('trust proxy', 1)` for accurate IP detection

## Error Handling
**Status: ✅ Implemented with environment-aware messages**

### Behavior
- **Development:** Detailed error messages with stack traces
- **Production:** Generic error messages to prevent information leakage
- Never expose sensitive data (API keys, internal paths)

### Implementation Reference
See `server.js` error handling middleware.

## Request Security
**Status: ✅ Implemented**

### Payload Limits
- Maximum payload size: 1MB
- Prevents memory exhaustion attacks
- Implemented via `express.json({ limit: '1mb' })`

### Input Sanitization
- All user input sanitized to prevent injection attacks
- XSS prevention on topic fields
- See input validation section above

### Implementation Reference
See `server.js`:
- `app.use(express.json({ limit: '1mb' }))`
- Validation middleware on all endpoints

## Log Security
**Status: ✅ Implemented with sanitizeLog() helper**

### Requirements
- All user-controlled values sanitized before logging
- Prevents log injection attacks (CWE-117)
- Removes control characters from log outputs
- Prevents forged log entries

### Sanitized Values
- User-Agent strings
- Page names
- Topics
- Visitor IDs
- All other user inputs
- Numeric values (even though validated)

### Implementation Reference
See `server.js`:
- `sanitizeLog()` helper function
- Used before all `console.log()` calls with user data

## Security Scanning
**Status: ✅ Implemented with GitHub CodeQL**

### Setup
- GitHub CodeQL analysis enabled
- Runs on push, pull requests, and weekly schedule
- Detects common vulnerabilities and coding errors

### Workflow File
`.github/workflows/codeql-analysis.yml`

### Security Policy
Defined in `SECURITY.md` for vulnerability reporting

### Access
Security analysis results available in:
- Repository Security tab
- Pull request checks
- Automated weekly reports

### Documentation
See `README.md` section "Security Analysis with GitHub CodeQL" for setup instructions.

## Health Monitoring
**Status: ✅ Implemented**

### Endpoint
`GET /health`

### Response
```json
{
  "status": "healthy",
  "timestamp": "ISO 8601",
  "version": "string",
  "hostname": "string"
}
```

### Usage
- Container orchestration health checks
- Load balancer monitoring
- Service uptime tracking

### Implementation Reference
See `server.js` health endpoint handler.

## Docker Security & Optimization
**Status: ✅ Implemented in Dockerfile**

### Security Features
- **Multi-stage builds:** Smaller images (~40% size reduction)
- **Non-root user:** `nodejs:1001` for container execution
- **Built-in health checks:** Every 30 seconds
- **Resource limits:** 1 CPU core, 512MB memory
- **Security options:** `no-new-privileges` flag
- **Environment-based config:** `NODE_ENV` variable

### Optimization Features
- Minimal base images
- Layer caching optimization
- Dependency-only intermediate stages
- Security-focused final stage

### Implementation Reference
See `Dockerfile` and `docker-compose.yml`.

## Environment Configuration
**Status: ✅ Implemented**

### Environment Variables
- `GEMINI_API_KEY`: Required for AI functionality
- `PORT`: Web server port (default: 3030)
- `NODE_ENV`: Environment mode (development/production)

### Secrets Management
- `.env` file excluded from git (via `.gitignore`)
- `.env.example` provided as template
- No hardcoded secrets in codebase

### Implementation Reference
See `.env.example` and `server.js` environment variable usage.

## API Security Summary

### Endpoints with Rate Limiting
- `/api/generate-quiz` - 20 req/15min
- `/api/generate-player-names` - 20 req/15min
- `/api/generate-topic` - 20 req/15min
- `/api/log-client-info` - 50 req/15min
- `/health` - 50 req/15min

### All Endpoints Include
- Input validation and sanitization
- Rate limiting
- Error handling
- Payload size limits
- Log sanitization

### Production Hardening
- Generic error messages
- No stack traces in production
- Rate limiting active
- Non-root container execution
- Resource limits enforced
- Security scanning enabled

## Security Checklist for Code Changes

When modifying code, ensure:
- [ ] All user input validated and sanitized
- [ ] Rate limiting applied to new endpoints
- [ ] Error messages are environment-appropriate
- [ ] All logs sanitized before output
- [ ] No sensitive data in logs or errors
- [ ] Payload sizes reasonable
- [ ] Docker security practices followed
- [ ] CodeQL scans still pass
- [ ] No hardcoded secrets
- [ ] Environment variables used for config

