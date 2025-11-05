# API Reference - External Interface Documentation

This document serves as the **reference documentation** for the external interface of VCVQ. It describes all inputs and outputs of the software's public API.

## Overview

VCVQ exposes a REST API that accepts JSON input and produces JSON output. This document provides complete reference documentation for all external interfaces including:

- **Input Specifications** - All accepted request formats, parameters, and validation rules
- **Output Specifications** - All response formats, data structures, and error conditions
- **Interface Contracts** - Expected behavior and guarantees for each endpoint

## Base URL

```
http://localhost:3030
```

## Endpoints

### Health Check

Check if the server is running.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-05T12:00:00.000Z"
}
```

**Status Codes:**
- `200 OK` - Server is healthy

---

### Generate Quiz

Generate a quiz with AI-generated questions.

**Endpoint:** `POST /api/generate-quiz`

**Rate Limit:** 10 requests per 15 minutes per IP

**Request Body:**
```json
{
  "topic": "Space Exploration",
  "language": "en",
  "numQuestions": 10,
  "numAnswers": 6
}
```

**Parameters:**

| Field | Type | Required | Valid Values | Description |
|-------|------|----------|--------------|-------------|
| `topic` | string | Yes | 1-200 chars | Quiz topic |
| `language` | string | Yes | `"sv"` or `"en"` | Question language |
| `numQuestions` | integer | Yes | 5-50 | Number of questions |
| `numAnswers` | integer | Yes | 4-8 | Answer options per question |

**Response:**
```json
{
  "questions": [
    {
      "question": "What year did humans first land on the Moon?",
      "answers": [
        "1969",
        "1967",
        "1971",
        "1965",
        "1973",
        "1968"
      ],
      "correctAnswer": 0
    }
  ]
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `questions` | array | Array of question objects |
| `questions[].question` | string | The question text |
| `questions[].answers` | array | Array of answer options |
| `questions[].correctAnswer` | integer | Index of correct answer (0-based) |

**Status Codes:**
- `200 OK` - Quiz generated successfully
- `400 Bad Request` - Invalid parameters
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

**Error Response:**
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

---

### Generate Player Names

Generate AI-generated player names based on topic and context.

**Endpoint:** `POST /api/generate-player-names`

**Rate Limit:** 10 requests per 15 minutes per IP

**Request Body:**
```json
{
  "language": "en",
  "count": 3,
  "topic": "Space Exploration"
}
```

**Parameters:**

| Field | Type | Required | Valid Values | Description |
|-------|------|----------|--------------|-------------|
| `language` | string | Yes | `"sv"` or `"en"` | Name language |
| `count` | integer | Yes | 2-5 | Number of names to generate |
| `topic` | string | Yes | 1-200 chars | Context for name generation |

**Response:**
```json
{
  "names": [
    "Captain Nova",
    "Starship Pilot",
    "Mission Control"
  ]
}
```

**Status Codes:**
- `200 OK` - Names generated successfully
- `400 Bad Request` - Invalid parameters
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

### Generate Random Topics

Generate random funny topic suggestions.

**Endpoint:** `POST /api/generate-topic`

**Rate Limit:** 10 requests per 15 minutes per IP

**Request Body:**
```json
{
  "language": "en",
  "count": 15
}
```

**Parameters:**

| Field | Type | Required | Valid Values | Description |
|-------|------|----------|--------------|-------------|
| `language` | string | Yes | `"sv"` or `"en"` | Topic language |
| `count` | integer | Yes | 1-20 | Number of topics to generate |

**Response:**
```json
{
  "topics": [
    "Celebrity Pets",
    "Strange Food Combinations",
    "Historical Fashion Disasters",
    "...(12 more topics)"
  ]
}
```

**Status Codes:**
- `200 OK` - Topics generated successfully
- `400 Bad Request` - Invalid parameters
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

### Log Client Information

Log client information for analytics (optional).

**Endpoint:** `POST /api/log-client-info`

**Rate Limit:** 10 requests per 15 minutes per IP

**Request Body:**
```json
{
  "visitorId": "abc123xyz",
  "userAgent": "Mozilla/5.0...",
  "language": "en-US",
  "platform": "MacIntel",
  "vendor": "Google Inc.",
  "screen": "1920x1080",
  "timezone": "America/New_York"
}
```

**Parameters:**

All fields are optional but must match validation rules if provided.

| Field | Type | Valid Values | Description |
|-------|------|--------------|-------------|
| `visitorId` | string | 1-20 alphanumeric | Visitor identifier |
| `userAgent` | string | max 500 chars | Browser user agent |
| `language` | string | max 50 chars | Browser language |
| `platform` | string | max 50 chars | Operating system |
| `vendor` | string | max 50 chars | Browser vendor |
| `screen` | string | max 50 chars | Screen resolution |
| `timezone` | string | max 100 chars | User timezone |

**Response:**
```json
{
  "success": true
}
```

**Status Codes:**
- `200 OK` - Information logged successfully
- `400 Bad Request` - Invalid parameters
- `429 Too Many Requests` - Rate limit exceeded

## Rate Limiting

All API endpoints are rate-limited to prevent abuse:

- **Limit:** 10 requests per 15 minutes per IP address
- **Headers:** Rate limit info is included in response headers:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

**Rate Limit Exceeded Response:**
```json
{
  "error": "Too many requests, please try again later."
}
```

## Security

### Input Validation

All endpoints validate input to prevent:
- SQL injection
- XSS attacks
- Command injection
- Path traversal
- Prompt injection (for AI endpoints)

### Headers

All responses include security headers:
- `Content-Security-Policy`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Strict-Transport-Security` (production)

### CORS

Cross-Origin Resource Sharing is configured:
- Localhost always allowed in development
- Production requires `ALLOWED_ORIGINS` environment variable
- Credentials not supported

**CORS Headers:**
```
Access-Control-Allow-Origin: http://localhost:3030
Access-Control-Allow-Methods: GET, POST
Access-Control-Allow-Headers: Content-Type
```

## Error Handling

### Error Response Format

All errors return JSON:

```json
{
  "error": "Human-readable error message",
  "details": "Technical details (optional)"
}
```

### Common Error Codes

| Status Code | Meaning | Cause |
|-------------|---------|-------|
| 400 | Bad Request | Invalid parameters |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Gemini API unavailable |

## Examples

### cURL Examples

**Generate a quiz:**
```bash
curl -X POST http://localhost:3030/api/generate-quiz \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Space Exploration",
    "language": "en",
    "numQuestions": 5,
    "numAnswers": 4
  }'
```

**Generate player names:**
```bash
curl -X POST http://localhost:3030/api/generate-player-names \
  -H "Content-Type: application/json" \
  -d '{
    "language": "en",
    "count": 3,
    "topic": "Space Exploration"
  }'
```

**Generate random topics:**
```bash
curl -X POST http://localhost:3030/api/generate-topic \
  -H "Content-Type: application/json" \
  -d '{
    "language": "en",
    "count": 15
  }'
```

### JavaScript Fetch Examples

**Generate a quiz:**
```javascript
const response = await fetch('http://localhost:3030/api/generate-quiz', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    topic: 'Space Exploration',
    language: 'en',
    numQuestions: 10,
    numAnswers: 6
  })
});

const data = await response.json();
console.log(data.questions);
```

**Handle errors:**
```javascript
try {
  const response = await fetch('http://localhost:3030/api/generate-quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: 'Space',
      language: 'en',
      numQuestions: 10,
      numAnswers: 6
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error.error);
    return;
  }

  const data = await response.json();
  console.log('Quiz generated:', data);
} catch (error) {
  console.error('Network error:', error);
}
```

## Best Practices

1. **Respect Rate Limits**
   - Implement exponential backoff for retries
   - Cache responses when appropriate
   - Don't make unnecessary requests

2. **Validate Client-Side**
   - Validate input before sending to API
   - Provide immediate feedback to users
   - Don't rely solely on client validation

3. **Handle Errors Gracefully**
   - Display user-friendly error messages
   - Log errors for debugging
   - Implement retry logic for transient failures

4. **Secure API Keys**
   - Never expose Gemini API key client-side
   - Always make API calls from server
   - Use environment variables for secrets

## Changelog

### Version 1.0.0
- Initial API release
- Quiz generation endpoint
- Player name generation endpoint
- Topic generation endpoint
- Client logging endpoint
- Rate limiting implementation
- Input validation and security headers

