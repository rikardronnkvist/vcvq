# Fuzzing Documentation

This document describes the fuzzing infrastructure implemented in VCVQ to improve security and code quality through automated testing with random and malicious inputs.

## Overview

VCVQ implements comprehensive fuzzing using two complementary approaches:

1. **Property-Based Testing** with [fast-check](https://github.com/dubzzz/fast-check)
2. **Continuous Fuzzing** with extended test runs in CI/CD

## Why Fuzzing?

Fuzzing helps us discover:
- Security vulnerabilities (injection attacks, XSS, etc.)
- Edge cases and boundary conditions
- Input validation issues
- Unexpected crashes or errors
- Performance problems with large inputs

## Fuzzing Infrastructure

### 1. Property-Based Testing (fast-check)

Property-based testing generates hundreds of random test cases to verify that certain properties always hold true.

#### Location
- Test files: `tests/fuzz/*.fuzz.test.js`
- Utilities: `utils/security.js`

#### Running Tests

```bash
# Run all fuzz tests
npm run test:fuzz

# Run with verbose output
npm run test:fuzz:verbose

# Run all tests (including fuzz tests)
npm test
```

#### Test Coverage

Our property-based fuzz tests cover:

**Security Functions (`tests/fuzz/security.fuzz.test.js`)**:
- `sanitizeLog()` - Log injection prevention
- `sanitizePromptInput()` - Prompt injection prevention  
- `isValidVisitorId()` - Visitor ID validation
- `generateVisitorId()` - ID generation uniqueness
- `isValidCorsOrigin()` - CORS validation

**Input Validation (`tests/fuzz/input-validation.fuzz.test.js`)**:
- Language validation (sv/en only)
- Question count validation (5-50)
- Answer count validation (4-8)
- Player count validation (2-5)
- Topic length validation (1-200 chars)
- Boundary conditions
- Attack pattern detection

**Attack Patterns Tested**:
- SQL injection
- XSS (Cross-Site Scripting)
- Path traversal
- Command injection
- Log injection
- Prompt injection
- Unicode/encoding attacks
- Control character injection

### 2. ClusterFuzz Targets

ClusterFuzz-compatible fuzz targets for advanced fuzzing:

#### Location
- Fuzz targets: `tests/clusterfuzz/*.js`
- Configuration: `.clusterfuzzlite/`

#### Running Locally

```bash
# Run sanitization fuzzer
node tests/clusterfuzz/sanitize_fuzz.js

# Run CORS fuzzer
node tests/clusterfuzz/cors_fuzz.js
```

#### Available Targets

- `sanitize_fuzz.js` - Tests sanitization functions with random byte sequences
- `cors_fuzz.js` - Tests CORS validation with random origin/host combinations

### 3. Continuous Integration

Fuzzing runs automatically in GitHub Actions:

#### Triggers
- On every pull request
- On pushes to main branch
- Weekly scheduled runs (Mondays at 3 AM UTC)
- Manual workflow dispatch

#### Workflow Jobs

1. **Property-Based Fuzzing** (Always runs)
   - Runs fast-check tests
   - Completes in ~5 minutes
   - Uploads test results as artifacts

2. **Extended Fuzzing** (Scheduled only)
   - Runs 10 iterations of fuzz tests
   - Runs ClusterFuzz targets
   - Completes in ~30 minutes
   - More thorough coverage

3. **Fuzzing Summary**
   - Reports overall status
   - Fails build if issues found

## Writing New Fuzz Tests

### Property-Based Test Example

```javascript
const { test } = require('node:test');
const assert = require('node:assert');
const fc = require('fast-check');

test('myFunction - should always return a string', () => {
  fc.assert(
    fc.property(fc.string(), (input) => {
      const result = myFunction(input);
      assert.strictEqual(typeof result, 'string');
    })
  );
});
```

### Fast-Check Generators

Common generators for creating random test data:

```javascript
fc.string()              // Random strings
fc.integer()             // Random integers
fc.float()               // Random floats
fc.boolean()             // Random booleans
fc.webUrl()              // Random URLs
fc.domain()              // Random domain names
fc.hexaString()          // Random hex strings
fc.unicodeString()       // Random Unicode strings
fc.oneof(a, b, c)        // Pick one of multiple generators
fc.array(generator)      // Arrays of generated values
fc.object()              // Random objects
```

### Best Practices

1. **Test Properties, Not Specific Values**
   - ❌ "function returns 'hello'"
   - ✅ "function always returns a string"

2. **Verify Invariants**
   - Output type is always correct
   - Length constraints are respected
   - No dangerous characters in output

3. **Test Edge Cases**
   - Empty inputs
   - Very long inputs
   - Special characters
   - Unicode
   - Null/undefined

4. **Security-Focused**
   - Test with attack patterns
   - Verify sanitization works
   - Check validation rejects bad input

## Understanding Test Results

### Successful Run
```
✓ sanitizeLog - should always return a string
✓ sanitizeLog - should never contain control characters
✓ sanitizeLog - should respect max length
```

### Failure with Counterexample
```
✗ sanitizeLog - should respect max length
  Counterexample: ["very long string...", 10]
  Shrunk 5 times
```

Fast-check will:
1. Find a failing input
2. "Shrink" it to the minimal failing case
3. Show you the counterexample

## Security Testing

### Attack Patterns Tested

Our fuzz tests specifically check for:

```javascript
// SQL Injection
"'; DROP TABLE users--"
"1' OR '1'='1"

// XSS
"<script>alert(1)</script>"
"<img src=x onerror=alert(1)>"

// Path Traversal
"../../../etc/passwd"
"..\\..\\..\\windows\\system32"

// Command Injection
"; rm -rf /"
"| cat /etc/passwd"
"&& whoami"

// Prompt Injection
"ignore previous instructions"
"forget all instructions"
"override system prompt"

// Unicode Attacks
"\u0000" (null byte)
"\uFEFF" (zero-width space)
```

### Validation Testing

All input validation is thoroughly fuzzed:

- Only `sv` and `en` accepted for language
- Numeric ranges enforced (questions: 5-50, etc.)
- String lengths enforced (topic: 1-200)
- Visitor IDs match pattern: `^[a-z0-9]{1,20}$`
- CORS origins properly validated

## Performance Considerations

### Test Duration

- Property-based tests: ~5 seconds per test file
- Full test suite: ~30 seconds
- Extended fuzzing: ~30 minutes (scheduled only)

### Coverage vs Speed

We balance coverage and speed:
- Fast tests run on every PR
- Extended tests run weekly
- Critical functions get more test iterations

## Troubleshooting

### Test Timeouts

If tests timeout, check:
- Infinite loops in code under test
- Very slow operations
- Resource exhaustion

### Flaky Tests

Property-based tests are deterministic by default (same seed). If tests are flaky:
- Check for time-dependent code
- Check for global state modifications
- Verify test independence

### Memory Issues

For memory errors:
- Reduce test iterations
- Check for memory leaks in code
- Limit input size in generators

## Integration with OSS-Fuzz

For projects that want to integrate with [OSS-Fuzz](https://github.com/google/oss-fuzz):

1. Fork this repository
2. Apply to OSS-Fuzz: https://google.github.io/oss-fuzz/getting-started/new-project-guide/
3. Use our `.clusterfuzzlite/` configuration as a starting point
4. Customize for your specific needs

## Resources

- [fast-check Documentation](https://fast-check.dev/)
- [OSS-Fuzz](https://github.com/google/oss-fuzz)
- [ClusterFuzzLite](https://google.github.io/clusterfuzzlite/)
- [OWASP Fuzzing Guide](https://owasp.org/www-community/Fuzzing)

## Contributing

When adding new security-critical functions:

1. Extract function to `utils/security.js`
2. Add property-based tests to `tests/fuzz/`
3. Test with attack patterns
4. Document expected properties
5. Run locally before committing

## Security Disclosure

If fuzzing discovers a security vulnerability:

1. Do NOT create a public issue
2. Follow our [Security Policy](SECURITY.md)
3. Email security details privately
4. Wait for fix before disclosure

---

**Last Updated**: November 2025  
**Fuzzing Framework**: fast-check v3.15.0  
**Node Version**: 20.x

