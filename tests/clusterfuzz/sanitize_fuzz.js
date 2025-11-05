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
 * Main fuzz target function
 * @param {Buffer} data - Random input data from fuzzer
 */
function fuzz(data) {
  if (data.length === 0) return;
  
  try {
    const input = data.toString('utf-8');
    
    // Fuzz sanitizeLog with random max lengths
    const maxLength = data.length > 1 ? data[0] % 500 : 200;
    const logResult = sanitizeLog(input, maxLength);
    
    // Verify properties
    if (typeof logResult !== 'string') {
      throw new Error('sanitizeLog must return a string');
    }
    if (logResult.length > maxLength) {
      throw new Error(`sanitizeLog exceeded max length: ${logResult.length} > ${maxLength}`);
    }
    if (/[\r\n\t\x00-\x1F\x7F-\x9F]/.test(logResult)) {
      throw new Error('sanitizeLog contains control characters');
    }
    
    // Fuzz sanitizePromptInput
    const promptResult = sanitizePromptInput(input);
    
    // Verify properties
    if (typeof promptResult !== 'string') {
      throw new Error('sanitizePromptInput must return a string');
    }
    if (promptResult.length > 200) {
      throw new Error(`sanitizePromptInput exceeded 200 chars: ${promptResult.length}`);
    }
    if (/[\r\n]/.test(promptResult)) {
      throw new Error('sanitizePromptInput contains newlines');
    }
    if (/  +/.test(promptResult)) {
      throw new Error('sanitizePromptInput has multiple consecutive spaces');
    }
    
    // Fuzz visitor ID validation
    const isValid = isValidVisitorId(input);
    
    // Verify properties
    if (typeof isValid !== 'boolean') {
      throw new Error('isValidVisitorId must return boolean');
    }
    
    // If marked as valid, verify it actually matches the pattern
    if (isValid) {
      if (!/^[a-z0-9]{1,20}$/i.test(input)) {
        throw new Error(`Invalid visitor ID accepted: ${input}`);
      }
    }
    
  } catch (error) {
    // Re-throw assertion errors, but don't crash on expected errors
    if (error.message.includes('must return') || 
        error.message.includes('exceeded') ||
        error.message.includes('contains') ||
        error.message.includes('accepted')) {
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

