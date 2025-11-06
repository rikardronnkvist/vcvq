# OpenSSF Compliance Guide

This guide covers OpenSSF (Open Source Security Foundation) compliance for VCVQ, including both the Best Practices Badge and Scorecard setup.

## Table of Contents

1. [Overview](#overview)
2. [OpenSSF Best Practices Badge](#openssf-best-practices-badge)
3. [OpenSSF Scorecard Setup](#openssf-scorecard-setup)
4. [Maintenance](#maintenance)

---

## Overview

VCVQ demonstrates commitment to security and best practices through two OpenSSF programs:

- **Best Practices Badge** - Self-certification questionnaire demonstrating adherence to open source best practices
- **Scorecard** - Automated security health metrics for open source projects

**Current Status:**
- [![OpenSSF Best Practices](https://www.bestpractices.dev/projects/11431/badge)](https://www.bestpractices.dev/projects/11431)
- [![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/rikardronnkvist/vcvq/badge)](https://scorecard.dev/viewer/?uri=github.com/rikardronnkvist/vcvq)

---

## OpenSSF Best Practices Badge

### What We Already Have ✅

VCVQ already has excellent coverage of the OpenSSF Best Practices requirements:

#### Documentation ✅
- ✅ **Basic Documentation** - Complete `docs/` folder with comprehensive guides
- ✅ **README.md** - Project overview and quick start
- ✅ **CHANGELOG.md** - Version history tracking
- ✅ **LICENSE** - MIT License

#### Governance ✅
- ✅ **CONTRIBUTING.md** - Clear contribution guidelines
- ✅ **CODE_OF_CONDUCT.md** - Contributor Covenant 2.1
- ✅ **SECURITY.md** - Vulnerability reporting process

#### Security ✅
- ✅ **Security Policy** - Documented in SECURITY.md
- ✅ **Input Validation** - Using express-validator
- ✅ **Rate Limiting** - Implemented on all API endpoints
- ✅ **XSS Protection** - HTML escaping implemented
- ✅ **Security Headers** - Using Helmet middleware
- ✅ **CORS Protection** - Secure CORS configuration
- ✅ **Prompt Injection Prevention** - Sanitization for AI inputs
- ✅ **Log Injection Prevention** - Sanitized logging
- ✅ **Non-root Docker Container** - Security best practice

#### Testing ✅
- ✅ **Automated Test Suite** - Node.js test runner
- ✅ **Property-Based Fuzzing** - Using fast-check
- ✅ **Security Testing** - Fuzz tests for security functions
- ✅ **CI/CD** - GitHub Actions workflows
- ✅ **Testing Documentation** - Complete testing guide

#### Version Control ✅
- ✅ **Public Repository** - GitHub (https://github.com/rikardronnkvist/vcvq)
- ✅ **Version History** - Git commits
- ✅ **Issue Tracking** - GitHub Issues
- ✅ **Change Log** - CHANGELOG.md

### Badge Application Steps

#### 1. Sign Up for OpenSSF Badge

1. Visit: **https://www.bestpractices.dev/**
2. Click **"Log in"** (use your GitHub account)
3. Click **"Add Project"**
4. Enter repository URL: `https://github.com/rikardronnkvist/vcvq`

#### 2. Complete the Questionnaire

**Basics:**

| Question | Answer | Evidence |
|----------|--------|----------|
| What is the project website URL? | https://github.com/rikardronnkvist/vcvq | GitHub repo |
| What license does the project use? | MIT | LICENSE file |
| Is the project open source? | Yes | Public GitHub repo |
| Documentation of project purpose? | Yes | README.md, docs/README.md |
| Documentation of installation? | Yes | docs/installation.md |
| Documentation of usage? | Yes | docs/usage.md |
| Documentation for developers? | Yes | docs/development.md |

**Change Control:**

| Question | Answer | Evidence |
|----------|--------|----------|
| Public version control? | Yes | GitHub repository |
| Version numbering? | Yes | package.json, CHANGELOG.md |
| Release notes? | Yes | CHANGELOG.md |

**Reporting:**

| Question | Answer | Evidence |
|----------|--------|----------|
| Bug reporting process? | Yes | GitHub Issues |
| Vulnerability reporting process? | Yes | SECURITY.md |
| Archived reports publicly available? | Yes | GitHub Issues |
| Acknowledge bug reports? | Yes | Security policy specifies 48hrs |

**Quality:**

| Question | Answer | Evidence |
|----------|--------|----------|
| Coding standards? | Yes | CONTRIBUTING.md, docs/development.md |
| Automated test suite? | Yes | npm test, tests/ folder |
| Test coverage? | Yes | Fuzzing tests, unit tests |
| Test invocation documented? | Yes | README.md, docs/testing.md |

**Security:**

| Question | Answer | Evidence |
|----------|--------|----------|
| Known vulnerabilities fixed? | Yes | Active maintenance |
| Input validation? | Yes | express-validator, utils/security.js |
| Hardening mechanisms? | Yes | Helmet, rate limiting, CORS |
| Cryptography? | N/A | Not using custom crypto |
| Deliver securely (HTTPS)? | Production | Recommended in docs |

#### 3. Key Answers for Specific Questions

**"Documentation interface" (URL required):**

Answer: Yes

URL: https://github.com/rikardronnkvist/vcvq/blob/main/docs/interface-reference.md

Justification: Complete external interface reference documentation includes:
- All inputs the software accepts (API requests, web forms, environment variables)
- All outputs the software produces (API responses, HTML pages, logs)
- Input validation rules and constraints
- Output formats and data structures
- Interface contracts and guarantees
- Error conditions and handling

**"Vulnerability report process" (URL required):**

Answer: Yes

URL: https://github.com/rikardronnkvist/vcvq/blob/main/SECURITY.md

Justification: SECURITY.md includes:
- How to report vulnerabilities (Email or GitHub Security Advisories)
- What to include (detailed description, reproduction steps, impact assessment)
- Expected response time (48 hours)
- Fix timeline based on severity (Critical: 7 days, High: 30 days, Medium/Low: 90 days)
- Private reporting instructions
- Contact methods

### Expected Badge Level

Based on current implementation:

- **Passing Badge:** ✅ Very likely (all core requirements met)
- **Silver Badge:** 🟡 Possible with minor additions
- **Gold Badge:** 🔴 Requires significant additional work

### Your Badge Information

**Project ID:** 11431  
**Badge URL:** https://www.bestpractices.dev/projects/11431  
**Badge Status:** https://www.bestpractices.dev/projects/11431/badge  

**Badge Markdown:**
```markdown
[![OpenSSF Best Practices](https://www.bestpractices.dev/projects/11431/badge)](https://www.bestpractices.dev/projects/11431)
```

---

## OpenSSF Scorecard Setup

### Quick Start Checklist

- [ ] Create GitHub Personal Access Token (PAT)
- [ ] Add PAT as repository secret
- [ ] Enable branch protection rules
- [ ] Verify Scorecard results

### Step 1: Create GitHub Personal Access Token (PAT)

The Scorecard workflow needs a token to check branch protection rules.

#### 1.1 Generate a Classic PAT

1. **Go to GitHub Settings:**
   - Click your profile picture (top right)
   - Select **Settings**
   - Scroll to **Developer settings** (bottom of left sidebar)
   - Click **Personal access tokens** → **Tokens (classic)**

2. **Generate new token:**
   - Click **Generate new token** → **Generate new token (classic)**
   - **Note:** Enter `OpenSSF Scorecard Token for VCVQ`
   - **Expiration:** Choose your preference (recommend 90 days or 1 year)
   - **Select scopes:** Check only `public_repo` (under "repo" section)
   - Click **Generate token** at the bottom

3. **Copy the token:**
   - ⚠️ **IMPORTANT:** Copy the token NOW - you won't see it again!
   - Format: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

#### 1.2 Add Token as Repository Secret

1. **Go to your VCVQ repository:**
   - Navigate to: https://github.com/rikardronnkvist/vcvq

2. **Open Settings:**
   - Click **Settings** tab
   - Click **Secrets and variables** → **Actions** (left sidebar)

3. **Add new secret:**
   - Click **New repository secret**
   - **Name:** `SCORECARD_TOKEN`
   - **Secret:** Paste your PAT token
   - Click **Add secret**

✅ **Done!** The Scorecard workflow can now check branch protection.

### Step 2: Enable Branch Protection Rules

Branch protection improves security and your Scorecard score.

#### 2.1 Configure Main Branch Protection

1. **Go to repository settings:**
   - Navigate to: https://github.com/rikardronnkvist/vcvq
   - Click **Settings** tab
   - Click **Branches** (left sidebar)

2. **Add branch protection rule:**
   - Click **Add branch protection rule**
   - **Branch name pattern:** `main`

3. **Enable these settings:**

   **Protect matching branches:**
   - ✅ **Require a pull request before merging**
     - ✅ Require approvals: `1` (recommended)
     - ✅ Dismiss stale pull request approvals when new commits are pushed
   
   - ✅ **Require status checks to pass before merging**
     - ✅ Require branches to be up to date before merging
     - Search and add these status checks:
       - `Scorecard analysis`
       - `CodeQL`
       - `Fuzzing tests`
       - `Dependency review`
   
   - ✅ **Require conversation resolution before merging**
   - ✅ **Do not allow bypassing the above settings** (recommended)

4. **Save changes:**
   - Scroll down and click **Create** (or **Save changes**)

#### 2.2 Branch Protection Benefits

✅ **Security:**
- Prevents accidental direct pushes to main
- Requires code review for all changes
- Ensures tests pass before merging

✅ **Scorecard:**
- Significantly improves "Branch-Protection" score
- Demonstrates project maturity
- Shows commitment to code quality

### Step 3: Verify Configuration

#### 3.1 Test the Workflow

1. **Trigger Scorecard workflow:**
   - Go to: https://github.com/rikardronnkvist/vcvq/actions
   - Click **Scorecard supply-chain security**
   - Click **Run workflow** (right side)
   - Click **Run workflow** button

2. **Wait for completion:**
   - Workflow takes ~2-3 minutes
   - Watch for green checkmark ✅

#### 3.2 Check Scorecard Results

1. **View in GitHub Security tab:**
   - Go to: https://github.com/rikardronnkvist/vcvq/security
   - Click **Code scanning** (left sidebar)
   - Look for Scorecard results

2. **View online report:**
   - Visit: https://scorecard.dev/viewer/?uri=github.com/rikardronnkvist/vcvq
   - Results update within 24-48 hours after workflow runs

### Expected Scorecard Results

After completing this setup, you should see:

#### High Scores (8-10/10)
- ✅ **Branch-Protection** - 8-10/10 (enabled with requirements)
- ✅ **CI-Tests** - 10/10 (GitHub Actions workflows)
- ✅ **CII-Best-Practices** - 10/10 (badge 11431)
- ✅ **Code-Review** - 8-10/10 (PR reviews required)
- ✅ **Maintained** - 10/10 (active development)
- ✅ **Pinned-Dependencies** - 10/10 (pinned action versions)
- ✅ **SAST** - 10/10 (CodeQL enabled)
- ✅ **Security-Policy** - 10/10 (SECURITY.md)
- ✅ **Token-Permissions** - 10/10 (minimal permissions)

#### Good Scores (6-7/10)
- ✅ **Dangerous-Workflow** - 9-10/10 (harden-runner)
- ✅ **Dependency-Update-Tool** - 10/10 (dependabot)
- ✅ **Fuzzing** - 8-10/10 (fuzzing tests)
- ✅ **License** - 10/10 (MIT license)
- ✅ **Vulnerabilities** - 10/10 (no known vulnerabilities)

**Expected overall Scorecard score:** 8.5-9.5/10 🎉

### Troubleshooting

**Token Not Working:**

Error: `Resource not accessible by integration`

Solution:
1. Verify token has `public_repo` scope
2. Check token hasn't expired
3. Ensure secret name is exactly `SCORECARD_TOKEN`
4. Re-generate token if needed

**Branch Protection Not Detected:**

Wait 24-48 hours:
- Scorecard results are cached
- GitHub may take time to propagate settings
- Run workflow again after waiting

**Workflow Failing:**

Check workflow logs:
1. Go to Actions tab
2. Click failed workflow run
3. Check error messages

---

## Maintenance

### Regular Tasks

**Monthly:**
- [ ] Review Scorecard results
- [ ] Update dependencies (Dependabot PRs)
- [ ] Check for new security advisories

**When token expires:**
- [ ] Generate new PAT
- [ ] Update repository secret
- [ ] Test workflow runs successfully

**After major changes:**
- [ ] Run Scorecard workflow manually
- [ ] Review new findings
- [ ] Address any score decreases

### Updating Badge Application

When the project evolves:

1. Update documentation references in badge application
2. Add new features to the questionnaire
3. Keep evidence links current
4. Re-submit if criteria change

---

## Resources

- **OpenSSF Badge Site:** https://www.bestpractices.dev/
- **Badge Criteria:** https://www.bestpractices.dev/criteria
- **Your Badge:** https://www.bestpractices.dev/projects/11431
- **Scorecard Documentation:** https://github.com/ossf/scorecard
- **Scorecard Action:** https://github.com/ossf/scorecard-action
- **Your Scorecard:** https://scorecard.dev/viewer/?uri=github.com/rikardronnkvist/vcvq
- **Your Repository:** https://github.com/rikardronnkvist/vcvq
- **OSSF Documentation:** https://openssf.org/

---

**Last Updated:** November 6, 2025  
**Badge Project ID:** 11431  
**Scorecard:** https://scorecard.dev/viewer/?uri=github.com/rikardronnkvist/vcvq

