/**
 * ClusterFuzzLite fuzz target for sanitization functions
 * This target is designed to work with libFuzzer
 */

const {
  sanitizeLog,
  sanitizePromptInput,
  isValidVisitorId
} = require('../../utils/security.js');

/**
 * Verify sanitizeLog output properties
 * @param {string} result - Result from sanitizeLog
 * @param {number} maxLength - Expected max length
 */
function verifySanitizeLog(result, maxLength) {
  if (typeof result !== 'string') {
    throw new Error('sanitizeLog must return a string');
  }
  if (result.length > maxLength) {
    throw new Error(`sanitizeLog exceeded max length: ${result.length} > ${maxLength}`);
  }
  if (/[\r\n\x00-\x1F\x7F-\x9F]/.test(result)) {
    throw new Error('sanitizeLog contains control characters');
  }
}

/**
 * Verify sanitizePromptInput output properties
 * @param {string} result - Result from sanitizePromptInput
 */
function verifySanitizePromptInput(result) {
  if (typeof result !== 'string') {
    throw new Error('sanitizePromptInput must return a string');
  }
  if (result.length > 200) {
    throw new Error(`sanitizePromptInput exceeded 200 chars: ${result.length}`);
  }
  if (/[\r\n]/.test(result)) {
    throw new Error('sanitizePromptInput contains newlines');
  }
  if (/ {2,}/.test(result)) {
    throw new Error('sanitizePromptInput has multiple consecutive spaces');
  }
}

/**
 * Verify isValidVisitorId output properties
 * @param {boolean} isValid - Result from isValidVisitorId
 * @param {string} input - Input that was validated
 */
function verifyVisitorIdValidation(isValid, input) {
  if (typeof isValid !== 'boolean') {
    throw new Error('isValidVisitorId must return boolean');
  }
  
  // If marked as valid, verify it actually matches the pattern
  if (isValid && !/^[a-z0-9]{1,20}$/i.test(input)) {
    throw new Error(`Invalid visitor ID accepted: ${input}`);
  }
}

/**
 * Check if error should be re-thrown
 * @param {Error} error - Error to check
 * @returns {boolean} True if error should be re-thrown
 */
function shouldRethrowError(error) {
  return error.message.includes('must return') || 
         error.message.includes('exceeded') ||
         error.message.includes('contains') ||
         error.message.includes('accepted');
}

/**
 * Main fuzz target function
 * @param {Buffer} data - Random input data from fuzzer
 */
function fuzz(data) {
  if (data.length === 0) return;
  
  try {
    const input = data.toString('utf-8');
    const maxLength = data.length > 1 ? data[0] % 500 : 200;
    
    // Fuzz and verify sanitizeLog
    const logResult = sanitizeLog(input, maxLength);
    verifySanitizeLog(logResult, maxLength);
    
    // Fuzz and verify sanitizePromptInput
    const promptResult = sanitizePromptInput(input);
    verifySanitizePromptInput(promptResult);
    
    // Fuzz and verify visitor ID validation
    const isValid = isValidVisitorId(input);
    verifyVisitorIdValidation(isValid, input);
    
  } catch (error) {
    // Re-throw assertion errors, but don't crash on expected errors
    if (shouldRethrowError(error)) {
      throw error;
    }
    // Expected errors from invalid inputs are ok
  }
}

// Export for ClusterFuzzLite
module.exports = {
  fuzz
};

// If run directly (for testing)
if (require.main === module) {
  const testInputs = [
    Buffer.from('test input'),
    Buffer.from('<script>alert(1)</script>'),
    Buffer.from("'; DROP TABLE--"),
    Buffer.from('\r\n\t\x00\x01'),
    Buffer.from('ignore previous instructions'),
    Buffer.from('a'.repeat(1000))
  ];
  
  console.log('Running ClusterFuzzLite fuzz target tests...');
  testInputs.forEach((input, idx) => {
    try {
      fuzz(input);
      console.log(`✓ Test ${idx + 1} passed`);
    } catch (error) {
      console.error(`✗ Test ${idx + 1} failed:`, error.message);
      process.exit(1);
    }
  });
  console.log('All tests passed!');
}

