/**
 * ClusterFuzzLite fuzz target for CORS validation
 * This target is designed to work with libFuzzer
 */

const { isValidCorsOrigin } = require('../../utils/security.js');

/**
 * Main fuzz target function
 * @param {Buffer} data - Random input data from fuzzer
 */
function fuzz(data) {
  if (data.length < 2) return;
  
  try {
    // Split input into origin and host
    const splitPoint = data[0] % data.length;
    const origin = data.slice(0, splitPoint).toString('utf-8');
    const host = data.slice(splitPoint).toString('utf-8');
    
    // Generate random allowed origins list
    const allowedOrigins = [];
    if (data.length > 2) {
      const numOrigins = data[1] % 5;
      for (let i = 0; i < numOrigins; i++) {
        if (data.length > i + 2) {
          const start = (data[i + 2] % data.length);
          const end = Math.min(start + 20, data.length);
          allowedOrigins.push(data.slice(start, end).toString('utf-8'));
        }
      }
    }
    
    // Fuzz CORS validation
    const result = isValidCorsOrigin(origin, host, allowedOrigins);
    
    // Verify properties
    if (typeof result !== 'boolean') {
      throw new TypeError('isValidCorsOrigin must return boolean');
    }
    
    // Test known safe origins that should always be accepted
    const localhostResult = isValidCorsOrigin('http://localhost', 'localhost:3000', []);
    if (!localhostResult) {
      throw new Error('localhost should be accepted');
    }
    
    const localIpResult = isValidCorsOrigin('http://127.0.0.1', '127.0.0.1:3000', []);
    if (!localIpResult) {
      throw new Error('127.0.0.1 should be accepted');
    }
    
    const nullOriginResult = isValidCorsOrigin(null, 'example.com', []);
    if (!nullOriginResult) {
      throw new Error('null origin should be accepted');
    }
    
  } catch (error) {
    // Re-throw assertion errors, but don't crash on expected errors
    if (error.message.includes('must return') || 
        error.message.includes('should be accepted')) {
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
    Buffer.from('http://example.comexample.com'),
    Buffer.from('javascript:alert(1)localhost'),
    Buffer.from('<script>alert(1)</script>example.com'),
    Buffer.from('http://localhost:3000\x00malicious.com'),
    Buffer.from('file:///etc/passwdlocalhost')
  ];
  
  console.log('Running CORS fuzz target tests...');
  for (const [idx, input] of testInputs.entries()) {
    try {
      fuzz(input);
      console.log(`✓ Test ${idx + 1} passed`);
    } catch (error) {
      console.error(`✗ Test ${idx + 1} failed:`, error.message);
      process.exit(1);
    }
  }
  console.log('All tests passed!');
}

