# External Interface Reference Documentation

This document provides comprehensive reference documentation for all external interfaces of the Vibe Coded Vibe Quiz (VCVQ) software.

## Document Purpose

This reference documentation describes:
- **All inputs** the software accepts
- **All outputs** the software produces
- **Interface contracts** and expected behavior
- **Error conditions** and handling

## Table of Contents

1. [HTTP API Interface](#http-api-interface)
2. [Web User Interface](#web-user-interface)
3. [Configuration Interface](#configuration-interface)
4. [Output Formats](#output-formats)
5. [Error Handling](#error-handling)

---

## 1. HTTP API Interface

VCVQ provides a REST API for generating quizzes and related content.

### Base URL

```
http://{host}:{port}
```

Default: `http://localhost:3030`

### 1.1 Health Check Endpoint

**Purpose:** Verify server availability

**Input:**
```
GET /health
```

**Output:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-05T12:00:00.000Z"
}
```

**Output Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Always "ok" if server is running |
| `timestamp` | string | ISO 8601 timestamp of response |

**Status Codes:**
- `200 OK` - Server is healthy

---

### 1.2 Generate Quiz Endpoint

**Purpose:** Generate AI-powered quiz questions

**Input:**
```
POST /api/generate-quiz
Content-Type: application/json
```

**Input Body:**
```json
{
  "topic": "string",
  "language": "string",
  "numQuestions": integer,
  "numAnswers": integer
}
```

**Input Specifications:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `topic` | string | Yes | Length: 1-200 chars<br>Must be non-empty after trimming | The quiz topic |
| `language` | string | Yes | Must be: `"sv"` or `"en"` | Question language |
| `numQuestions` | integer | Yes | Range: 5-50 | Number of questions to generate |
| `numAnswers` | integer | Yes | Range: 4-8 | Answer options per question |

**Output (Success):**
```json
{
  "questions": [
    {
      "question": "string",
      "answers": ["string", "string", ...],
      "correctAnswer": integer
    }
  ]
}
```

**Output Specifications:**

| Field | Type | Description |
|-------|------|-------------|
| `questions` | array | Array of question objects |
| `questions[].question` | string | The question text |
| `questions[].answers` | array of strings | All answer options |
| `questions[].correctAnswer` | integer | Zero-based index of correct answer |

**Output (Error):**
```json
{
  "error": "string",
  "details": "string"
}
```

**Status Codes:**
- `200 OK` - Questions generated successfully
- `400 Bad Request` - Invalid input parameters
- `429 Too Many Requests` - Rate limit exceeded (10 requests per 15 minutes)
- `500 Internal Server Error` - Server or AI API error

**Rate Limiting:**
- Maximum: 10 requests per 15 minutes per IP address
- Headers included: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

**Example Input:**
```json
{
  "topic": "Space Exploration",
  "language": "en",
  "numQuestions": 10,
  "numAnswers": 6
}
```

**Example Output:**
```json
{
  "questions": [
    {
      "question": "What year did humans first land on the Moon?",
      "answers": ["1969", "1967", "1971", "1965", "1973", "1968"],
      "correctAnswer": 0
    }
  ]
}
```

---

### 1.3 Generate Player Names Endpoint

**Purpose:** Generate AI-based player names

**Input:**
```
POST /api/generate-player-names
Content-Type: application/json
```

**Input Body:**
```json
{
  "language": "string",
  "count": integer,
  "topic": "string"
}
```

**Input Specifications:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `language` | string | Yes | Must be: `"sv"` or `"en"` | Name language |
| `count` | integer | Yes | Range: 2-5 | Number of names to generate |
| `topic` | string | Yes | Length: 1-200 chars | Context for name generation |

**Output (Success):**
```json
{
  "names": ["string", "string", ...]
}
```

**Output Specifications:**

| Field | Type | Description |
|-------|------|-------------|
| `names` | array of strings | Generated player names |

**Status Codes:**
- `200 OK` - Names generated successfully
- `400 Bad Request` - Invalid input parameters
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server or AI API error

---

### 1.4 Generate Random Topics Endpoint

**Purpose:** Generate random topic suggestions

**Input:**
```
POST /api/generate-topic
Content-Type: application/json
```

**Input Body:**
```json
{
  "language": "string",
  "count": integer
}
```

**Input Specifications:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `language` | string | Yes | Must be: `"sv"` or `"en"` | Topic language |
| `count` | integer | Yes | Range: 1-20 | Number of topics to generate |

**Output (Success):**
```json
{
  "topics": ["string", "string", ...]
}
```

**Output Specifications:**

| Field | Type | Description |
|-------|------|-------------|
| `topics` | array of strings | Generated topic suggestions |

**Status Codes:**
- `200 OK` - Topics generated successfully
- `400 Bad Request` - Invalid input parameters
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server or AI API error

---

### 1.5 Log Client Information Endpoint

**Purpose:** Log client analytics data

**Input:**
```
POST /api/log-client-info
Content-Type: application/json
```

**Input Body:**
```json
{
  "visitorId": "string",
  "userAgent": "string",
  "language": "string",
  "platform": "string",
  "vendor": "string",
  "screen": "string",
  "timezone": "string"
}
```

**Input Specifications:**

All fields are optional but must meet constraints if provided:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `visitorId` | string | Length: 1-20<br>Pattern: `^[a-z0-9]+$` | Visitor identifier |
| `userAgent` | string | Max length: 500 | Browser user agent |
| `language` | string | Max length: 50 | Browser language |
| `platform` | string | Max length: 50 | Operating system |
| `vendor` | string | Max length: 50 | Browser vendor |
| `screen` | string | Max length: 50 | Screen resolution |
| `timezone` | string | Max length: 100 | User timezone |

**Output (Success):**
```json
{
  "success": true
}
```

**Status Codes:**
- `200 OK` - Information logged successfully
- `400 Bad Request` - Invalid input parameters
- `429 Too Many Requests` - Rate limit exceeded

---

## 2. Web User Interface

VCVQ provides two HTML pages as the primary user interface.

### 2.1 Landing Page

**Input (HTTP Request):**
```
GET /
```

**Output:**
- Content-Type: `text/html`
- File: `public/index.html`
- Includes: CSS (`styles.css`), JavaScript (`i18n.js`)

**Interactive Elements:**
- Language selector (Swedish/English)
- Topic input field or random topic selector
- Number of players selector (2-5)
- Number of questions selector (5, 10, 15, 20, 25, 30, 50)
- Number of answer options selector (4, 6, 8)
- Player name inputs or AI name generator
- "Start Quiz" button

**User Input Validation (Client-Side):**
- Topic: 1-200 characters
- Language: `sv` or `en`
- All selectors: predefined valid values only

### 2.2 Game Page

**Input (HTTP Request):**
```
GET /game.html
```

**Output:**
- Content-Type: `text/html`
- File: `public/game.html`
- Includes: CSS (`styles.css`), JavaScript (`game.js`, `i18n.js`)

**Interactive Elements:**
- Question display area
- Answer option boxes (4-8 options)
- Player tokens (draggable)
- Current player indicator
- Score display
- "End Game" button
- "Play Again" button (shown at game end)

**User Interactions:**
- Drag player token to answer box
- Click answer box to select
- Click "End Game" to finish early
- Click "Play Again" to restart

### 2.3 Static Assets

**Images:**
- `GET /logo.png` - PNG image
- `GET /logo.ico` - Favicon

**Styling:**
- `GET /styles.css` - Cascading Style Sheet

**Scripts:**
- `GET /game.js` - Game logic JavaScript
- `GET /i18n.js` - Internationalization JavaScript

---

## 3. Configuration Interface

VCVQ accepts configuration through environment variables.

### 3.1 Environment Variables (Input)

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `GEMINI_API_KEY` | string | **Yes** | None | Google Gemini API key for AI generation |
| `PORT` | integer | No | 3030 | Server listening port |
| `NODE_ENV` | string | No | `production` | Environment mode (`development` or `production`) |
| `ALLOWED_ORIGINS` | string | No | localhost only | Comma-separated CORS origins |

**Input Format for ALLOWED_ORIGINS:**
```
ALLOWED_ORIGINS=http://example.com,https://another.com
```

**Constraints:**
- `PORT`: Valid port number (1-65535)
- `NODE_ENV`: Either `development` or `production`
- `ALLOWED_ORIGINS`: Comma-separated valid URLs

---

## 4. Output Formats

### 4.1 JSON API Responses

All API endpoints return JSON with consistent structure.

**Success Response Structure:**
```json
{
  "fieldName": "value",
  ...
}
```

**Error Response Structure:**
```json
{
  "error": "Human-readable error message",
  "details": "Technical details (optional)"
}
```

### 4.2 HTML Output

**Content-Type:** `text/html; charset=utf-8`

**Structure:**
- Valid HTML5 documents
- UTF-8 encoded
- Responsive design
- Inline security headers

### 4.3 HTTP Headers (Output)

All responses include security headers:

```
Content-Security-Policy: default-src 'self'; ...
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 0
Strict-Transport-Security: max-age=31536000 (production only)
```

CORS headers (when origin is allowed):

```
Access-Control-Allow-Origin: {allowed-origin}
Access-Control-Allow-Methods: GET, POST
Access-Control-Allow-Headers: Content-Type
```

Rate limiting headers:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1730819400
```

### 4.4 Log Output

**Format:** Text to stdout/stderr

**Structure:**
```
[timestamp] [level] message
```

**Levels:**
- `INFO` - General information
- `ERROR` - Error conditions
- `WARN` - Warning messages

**Example:**
```
2025-11-05T12:00:00.000Z INFO Server started on port 3030
2025-11-05T12:01:00.000Z ERROR API error: Rate limit exceeded
```

---

## 5. Error Handling

### 5.1 HTTP Error Codes

| Code | Meaning | When Returned |
|------|---------|---------------|
| 200 | OK | Successful request |
| 400 | Bad Request | Invalid input parameters |
| 404 | Not Found | Invalid endpoint |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Gemini API unavailable |

### 5.2 Error Response Format

**JSON Error:**
```json
{
  "error": "Description of what went wrong",
  "details": "Technical details or validation errors"
}
```

**Validation Error Details:**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "topic",
      "message": "Topic must be between 1 and 200 characters"
    }
  ]
}
```

### 5.3 Error Scenarios

**Invalid Input:**
- Returns: `400 Bad Request`
- Body: JSON with `error` and `details`

**Rate Limit Exceeded:**
- Returns: `429 Too Many Requests`
- Body: `{ "error": "Too many requests, please try again later." }`
- Headers: Include rate limit reset time

**Server Error:**
- Returns: `500 Internal Server Error`
- Body: `{ "error": "Internal server error" }`
- Note: Sensitive details not exposed to client

**AI API Failure:**
- Returns: `500 Internal Server Error` or `503 Service Unavailable`
- Body: `{ "error": "Failed to generate content", "details": "..." }`

---

## 6. Interface Contracts and Guarantees

### 6.1 API Stability

- **Backward Compatibility:** Minor versions maintain backward compatibility
- **Breaking Changes:** Only in major version updates
- **Deprecation:** 6-month notice before removal

### 6.2 Data Validation

**Guarantees:**
- All input is validated server-side
- Invalid input returns `400 Bad Request`
- Validation errors include specific field information
- All user input is sanitized before processing

### 6.3 Security Guarantees

**Input Sanitization:**
- XSS prevention: All HTML is escaped
- SQL Injection: Not applicable (no database)
- Prompt Injection: AI inputs are sanitized
- Log Injection: Log outputs are sanitized

**Rate Limiting:**
- Enforced: 10 requests per 15 minutes per IP
- Applied to: All `/api/*` endpoints
- Not applied to: Static files, health check

**CORS:**
- Default: Only same-origin and localhost
- Configurable: Via `ALLOWED_ORIGINS`
- Credentials: Not supported

### 6.4 Response Time

**Expected Response Times:**
- Health check: < 100ms
- Static files: < 200ms
- Quiz generation: 5-30 seconds (AI-dependent)
- Name generation: 2-10 seconds (AI-dependent)
- Topic generation: 2-10 seconds (AI-dependent)

**Timeout Handling:**
- Client should implement timeouts
- Long requests may take up to 60 seconds
- No response guarantee for AI-dependent endpoints

### 6.5 Data Retention

**Not Stored:**
- Quiz questions or answers
- Player names
- Game results

**Logged (Temporary):**
- Client information (if submitted via `/api/log-client-info`)
- Error messages
- Request logs (for debugging)

**No Persistent Storage:**
- All data is processed in memory
- No database or file storage
- Logs may be retained per server configuration

---

## 7. Interface Examples

### 7.1 Complete API Call Example (JavaScript)

```javascript
// Generate a quiz
async function generateQuiz() {
  try {
    const response = await fetch('http://localhost:3030/api/generate-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: 'Space Exploration',
        language: 'en',
        numQuestions: 5,
        numAnswers: 4
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error:', error.error);
      return null;
    }

    const data = await response.json();
    return data.questions;
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
}
```

### 7.2 Complete API Call Example (cURL)

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

### 7.3 Error Handling Example

```javascript
// Handle validation errors
const response = await fetch('/api/generate-quiz', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ topic: '', language: 'invalid' })
});

// Response: 400 Bad Request
// Body:
{
  "error": "Validation failed",
  "details": [
    { "field": "topic", "message": "Topic must not be empty" },
    { "field": "language", "message": "Language must be sv or en" }
  ]
}
```

---

## 8. Version Information

**Current Version:** 1.0.0

**API Version:** v1 (implicit, no version prefix in URLs)

**Interface Stability:** Stable

**Last Updated:** November 5, 2025

---

## 9. Related Documentation

- **[API Reference](api.md)** - Detailed API documentation with more examples
- **[Installation Guide](installation.md)** - How to set up and configure
- **[User Guide](usage.md)** - How to use the web interface
- **[Development Guide](development.md)** - How to extend the interface

---

## 10. Compliance and Standards

### 10.1 Standards Followed

- **HTTP:** HTTP/1.1 (RFC 7231)
- **JSON:** RFC 8259
- **HTML:** HTML5
- **CSS:** CSS3
- **JavaScript:** ECMAScript 2015+

### 10.2 Security Standards

- **OWASP Top 10:** Mitigations implemented
- **Input Validation:** All inputs validated
- **Output Encoding:** All outputs encoded
- **Rate Limiting:** Implemented on all API endpoints
- **Security Headers:** OWASP recommended headers

### 10.3 Accessibility

- **Web Interface:** Basic accessibility support
- **API:** No accessibility-specific considerations
- **Documentation:** Plain text, screen-reader friendly

---

**This document serves as the complete external interface reference for VCVQ.**

For implementation details and internal architecture, see the [Development Guide](development.md).

