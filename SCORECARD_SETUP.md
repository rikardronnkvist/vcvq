# OpenSSF Scorecard Setup Guide

This guide will help you configure your repository to achieve a higher OpenSSF Scorecard score.

**Current Scorecard:** https://scorecard.dev/viewer/?uri=github.com/rikardronnkvist/vcvq

## Quick Start Checklist

- [ ] Create GitHub Personal Access Token (PAT)
- [ ] Add PAT as repository secret
- [ ] Enable branch protection rules
- [ ] Verify Scorecard results

---

## Step 1: Create GitHub Personal Access Token (PAT)

The Scorecard workflow needs a token to check branch protection rules.

### 1.1 Generate a Classic PAT

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
     - ✅ `public_repo` - Access public repositories
   - Click **Generate token** at the bottom

3. **Copy the token:**
   - ⚠️ **IMPORTANT:** Copy the token NOW - you won't see it again!
   - Format: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 1.2 Add Token as Repository Secret

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

---

## Step 2: Enable Branch Protection Rules

Branch protection improves security and your Scorecard score.

### 2.1 Configure Main Branch Protection

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
     - ✅ Require review from Code Owners (optional)
   
   - ✅ **Require status checks to pass before merging**
     - ✅ Require branches to be up to date before merging
     - Search and add these status checks:
       - `Scorecard analysis`
       - `CodeQL`
       - `Fuzzing tests`
       - `Dependency review`
   
   - ✅ **Require conversation resolution before merging**
   
   - ✅ **Require signed commits** (optional but recommended)
   
   - ✅ **Require linear history** (optional, keeps history clean)
   
   - ✅ **Do not allow bypassing the above settings** (recommended)
   
   - ⚠️ **IMPORTANT:** Leave unchecked:
     - ❌ "Include administrators" - Leave unchecked so you can still push emergency fixes

4. **Save changes:**
   - Scroll down and click **Create** (or **Save changes**)

### 2.2 Branch Protection Benefits

✅ **Security:**
- Prevents accidental direct pushes to main
- Requires code review for all changes
- Ensures tests pass before merging

✅ **Scorecard:**
- Significantly improves "Branch-Protection" score
- Demonstrates project maturity
- Shows commitment to code quality

---

## Step 3: Verify Configuration

### 3.1 Test the Workflow

1. **Trigger Scorecard workflow:**
   - Go to: https://github.com/rikardronnkvist/vcvq/actions
   - Click **Scorecard supply-chain security**
   - Click **Run workflow** (right side)
   - Click **Run workflow** button

2. **Wait for completion:**
   - Workflow takes ~2-3 minutes
   - Watch for green checkmark ✅

### 3.2 Check Scorecard Results

1. **View in GitHub Security tab:**
   - Go to: https://github.com/rikardronnkvist/vcvq/security
   - Click **Code scanning** (left sidebar)
   - Look for Scorecard results

2. **View online report:**
   - Visit: https://scorecard.dev/viewer/?uri=github.com/rikardronnkvist/vcvq
   - Results update within 24-48 hours after workflow runs
   - Look for improvements in:
     - ✅ Branch-Protection (should be 8-10/10)
     - ✅ Token-Permissions (already good)
     - ✅ Pinned-Dependencies (already good)

---

## Expected Scorecard Results

After completing this setup, you should see:

### High Scores (8-10/10)
- ✅ **Branch-Protection** - 8-10/10 (enabled with requirements)
- ✅ **CI-Tests** - 10/10 (GitHub Actions workflows)
- ✅ **CII-Best-Practices** - 10/10 (badge 11431)
- ✅ **Code-Review** - 8-10/10 (PR reviews required)
- ✅ **Maintained** - 10/10 (active development)
- ✅ **Pinned-Dependencies** - 10/10 (pinned action versions)
- ✅ **SAST** - 10/10 (CodeQL enabled)
- ✅ **Security-Policy** - 10/10 (SECURITY.md)
- ✅ **Signed-Releases** - If you sign your releases
- ✅ **Token-Permissions** - 10/10 (minimal permissions)

### Good Scores (6-7/10)
- ✅ **Dangerous-Workflow** - 9-10/10 (harden-runner)
- ✅ **Dependency-Update-Tool** - 10/10 (dependabot)
- ✅ **Fuzzing** - 8-10/10 (fuzzing tests)
- ✅ **License** - 10/10 (MIT license)
- ✅ **Vulnerabilities** - 10/10 (no known vulnerabilities)

### Lower Scores (reasons and solutions)
- **Binary-Artifacts** - May be low if node_modules contains binaries
  - Solution: Already excluded via .gitignore ✅
- **Packaging** - May be low if not publishing to npm
  - Solution: Not applicable for this project

---

## Additional Scorecard Improvements

### Add Scorecard Badge to README

Once your score improves, add the badge:

```markdown
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/rikardronnkvist/vcvq/badge)](https://scorecard.dev/viewer/?uri=github.com/rikardronnkvist/vcvq)
```

Add this near your existing OpenSSF Best Practices badge in README.md.

### Enable Signed Commits (Optional)

For even better scores:

1. **Set up GPG:**
   ```bash
   # Generate GPG key
   gpg --full-generate-key
   
   # List keys
   gpg --list-secret-keys --keyid-format=long
   
   # Export public key
   gpg --armor --export YOUR_KEY_ID
   ```

2. **Add to GitHub:**
   - Settings → SSH and GPG keys → New GPG key
   - Paste your public key

3. **Configure Git:**
   ```bash
   git config --global user.signingkey YOUR_KEY_ID
   git config --global commit.gpgsign true
   ```

### Enable Signed Releases

When creating GitHub releases:
1. Use signed tags: `git tag -s v1.0.0 -m "Release v1.0.0"`
2. Push tags: `git push origin v1.0.0`
3. Create release from signed tag

---

## Troubleshooting

### Token Not Working

**Error:** `Resource not accessible by integration`

**Solution:**
1. Verify token has `public_repo` scope
2. Check token hasn't expired
3. Ensure secret name is exactly `SCORECARD_TOKEN`
4. Re-generate token if needed

### Branch Protection Not Detected

**Wait 24-48 hours:**
- Scorecard results are cached
- GitHub may take time to propagate settings
- Run workflow again after waiting

**Check branch name:**
- Ensure protection is on `main` (not `master`)
- Pattern should be exactly: `main`

### Workflow Failing

**Check workflow logs:**
1. Go to Actions tab
2. Click failed workflow run
3. Check error messages
4. Common issues:
   - Missing or invalid token
   - Incorrect permissions
   - Network issues (temporary, retry)

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

---

## Resources

- **Scorecard Documentation:** https://github.com/ossf/scorecard
- **Scorecard Action:** https://github.com/ossf/scorecard-action
- **Your Scorecard:** https://scorecard.dev/viewer/?uri=github.com/rikardronnkvist/vcvq
- **OSSF Best Practices:** https://www.bestpractices.dev/projects/11431
- **GitHub Security:** https://github.com/rikardronnkvist/vcvq/security

---

## Summary

After completing this guide:

✅ **Scorecard workflow** can check branch protection  
✅ **Main branch** is protected from direct pushes  
✅ **Pull requests** require review and passing tests  
✅ **Security score** significantly improved  
✅ **Project maturity** demonstrated to users  

**Expected overall Scorecard score:** 8.5-9.5/10 🎉

Your VCVQ project will demonstrate strong security practices and earn trust from users and contributors!

