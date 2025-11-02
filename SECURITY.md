# Security Policy

## Supported Versions

We currently support the following versions of VCVQ with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of VCVQ seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **Email**: Please email security reports to the project maintainer
   - Include as much detail as possible about the vulnerability
   - Include steps to reproduce if applicable
   - Include potential impact assessment

2. **GitHub Security Advisories** (for maintainers):
   - Go to the [Security tab](https://github.com/rikardronnkvist/vcvq/security) of this repository
   - Click on "Advisories"
   - Click "New draft security advisory"

### What to Include

When reporting a vulnerability, please include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)
- Your contact information (optional, but helpful for follow-up questions)

### What to Expect

- **Response Time**: We aim to respond to security reports within 48 hours
- **Assessment**: We will assess the vulnerability and determine severity
- **Fix Timeline**: 
  - Critical vulnerabilities: Within 7 days
  - High severity: Within 30 days
  - Medium/Low severity: Within 90 days
- **Updates**: We will keep you informed of our progress
- **Credit**: If you'd like, we can credit you in the security advisory (with your permission)

### Security Best Practices

If you are using VCVQ, please ensure:

- Keep dependencies up to date
- Use a strong API key for Google Gemini API
- Run the application in a secure environment
- Review and update environment variables regularly
- Monitor logs for suspicious activity
- Use HTTPS in production
- Keep Docker images up to date

### Security Features

VCVQ includes the following security features:

- **Input Validation**: All user inputs are validated using express-validator
- **Rate Limiting**: API endpoints are rate-limited to prevent abuse
- **XSS Protection**: User input is sanitized to prevent XSS attacks
- **Log Injection Prevention**: Log outputs are sanitized to prevent log injection
- **Payload Size Limits**: Request payloads are limited to prevent DoS attacks
- **Security Headers**: Appropriate security headers are set
- **Non-root Container**: Docker containers run as non-root user

### Known Security Considerations

- **API Key Security**: The Google Gemini API key is required and should be kept secure. Never commit it to version control.
- **Public Repository**: This is a public repository. Do not include sensitive information in code or commits.
- **Logging**: Application logs may contain user-provided data. Ensure logs are stored securely.

### Security Updates

Security updates will be released through:

- Regular dependency updates
- Security patches in patch versions
- Security advisories published on GitHub

### Code of Conduct

Please note that security research must be conducted responsibly and in accordance with applicable laws. Do not:

- Access data that does not belong to you
- Attempt to destroy or corrupt data
- Disrupt services
- Violate privacy

Thank you for helping keep VCVQ and our users safe!

