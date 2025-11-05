/**
 * Security utility functions for input validation and sanitization
 * These functions are extracted for testing and reusability
 */

/**
 * Sanitize user input for safe logging (prevents log injection)
 * Removes newlines, carriage returns, and other control characters
 * @param {*} value - The value to sanitize
 * @param {number} maxLength - Maximum length of the sanitized string
 * @returns {string} - Sanitized string
 */
function sanitizeLog(value, maxLength = 200) {
  if (value == null) return 'unknown';
  try {
    const str = String(value);
    // Remove control characters that could be used for log injection
    return str.replaceAll(/[\x00-\x1F\x7F-\x9F]/g, '').substring(0, maxLength);
  } catch (error) {
    // Handle objects that can't be converted to string
    console.debug('[VCVQ] sanitizeLog: Failed to convert value to string:', error.message);
    return 'unknown';
  }
}

/**
 * Sanitize topic for AI prompts (prevents prompt injection)
 * Removes prompt injection attempts and sanitizes the input
 * @param {string} topic - The topic to sanitize
 * @returns {string} - Sanitized topic
 */
function sanitizePromptInput(topic) {
  if (!topic) return '';
  
  try {
    let sanitized = String(topic);
    
    // Remove common prompt injection patterns
    // Remove newlines and carriage returns
    sanitized = sanitized.replaceAll(/[\r\n]/g, ' ');
    // Remove common injection keywords/patterns (expanded to catch more variations)
    sanitized = sanitized.replaceAll(/\b(ignore|forget|override|system|admin|assistant|instructions|prompt|role|persona)\s+(previous|above|instructions|all|the|this|prompt|system)\b/gi, '');
    // Remove multiple consecutive spaces
    sanitized = sanitized.replaceAll(/\s+/g, ' ').trim();
    
    // Limit length to prevent overly long prompts
    return sanitized.substring(0, 200);
  } catch (error) {
    // Handle objects that can't be converted to string
    console.debug('[VCVQ] sanitizePromptInput: Failed to convert value to string:', error.message);
    return '';
  }
}

/**
 * Validate visitorId format
 * @param {*} visitorId - The visitor ID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidVisitorId(visitorId) {
  if (!visitorId || typeof visitorId !== 'string') return false;
  // Visitor ID should be alphanumeric, 8 characters max (as generated)
  return /^[a-z0-9]{1,20}$/i.test(visitorId);
}

/**
 * Generate a short unique visitor ID
 * @returns {string} - A random alphanumeric string
 */
function generateVisitorId() {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Get client IP from request
 * @param {Object} req - Express request object
 * @returns {string} - Client IP address
 */
function getClientIp(req) {
  // req.ip should be the real client IP if trust proxy is set correctly
  const ip = req.ip || req.socket.remoteAddress;
  
  // If we still get a local IP, try parsing x-forwarded-for manually
  if (ip && (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.16.') || ip === '127.0.0.1')) {
    const xForwardedFor = req.headers['x-forwarded-for'];
    if (xForwardedFor) {
      // Take the first IP in the chain (the real client)
      const forwardedIps = xForwardedFor.split(',').map(ip => ip.trim());
      for (const forwardedIp of forwardedIps) {
        // Skip if it's another local/proxy IP
        if (!forwardedIp.startsWith('192.168.') && !forwardedIp.startsWith('10.') && 
            !forwardedIp.startsWith('172.16.') && forwardedIp !== '127.0.0.1') {
          return forwardedIp;
        }
      }
    }
  }
  
  return ip || 'Unknown';
}

/**
 * Validate CORS origin
 * @param {string} origin - The origin to validate
 * @param {string} requestHost - The request host
 * @param {string[]} allowedOrigins - Array of allowed origins
 * @returns {boolean} - True if origin is allowed
 */
function isValidCorsOrigin(origin, requestHost, allowedOrigins = []) {
  // No origin header (same-origin)
  if (!origin) return true;
  
  // Check against whitelist if provided
  if (allowedOrigins.length > 0 && allowedOrigins.includes(origin)) {
    return true;
  }
  
  try {
    const originUrl = new URL(origin);
    const hostname = originUrl.hostname.toLowerCase();
    
    // Allow localhost variants (including IPv6)
    if (hostname === 'localhost' || 
        hostname === '127.0.0.1' || 
        hostname === '[::1]' ||
        hostname === '::1' ||
        hostname === '0:0:0:0:0:0:0:1') {
      return true;
    }
    
    // Check if origin matches request host (same-origin)
    if (requestHost) {
      const requestHostname = requestHost.split(':')[0].toLowerCase();
      if (hostname === requestHostname) {
        return true;
      }
    }
  } catch (error) {
    // Invalid URL format - check if it's a plain IPv6 address without brackets
    console.debug('[VCVQ] CORS: Invalid URL format, checking for IPv6:', error.message);
    return origin.includes('::1');
  }
  
  return false;
}

module.exports = {
  sanitizeLog,
  sanitizePromptInput,
  isValidVisitorId,
  generateVisitorId,
  getClientIp,
  isValidCorsOrigin
};

