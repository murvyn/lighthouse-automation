# Getting Started with lighthouse-automation

Complete guide to get up and running in 5 minutes.

## What is This Package?

`lighthouse-automation` automatically runs Google Lighthouse performance audits on your website routes. Define your URLs in a simple config file and get professional HTML reports.

**Key features:**
- ✅ Audit multiple routes automatically
- ✅ Supports authenticated pages (with cookies)
- ✅ Customizable performance thresholds
- ✅ Professional Lighthouse HTML reports
- ✅ Works with Playwright test framework

## Prerequisites

Before starting, make sure you have:

- **Node.js 16+** - Check with: `node --version`
- **npm or yarn** - Check with: `npm --version`
- **Code editor** - VS Code, Sublime, etc.
- **10 minutes** - to complete setup

## 5-Minute Setup

### Step 1: Create Project Directory

```bash
# Create project folder
mkdir my-lighthouse-project
cd my-lighthouse-project

# Initialize npm (if starting fresh)
npm init -y
```

### Step 2: Install Package

```bash
npm install --save-dev lighthouse-automation @playwright/test playwright
```

Then install browsers:

```bash
npx playwright install --with-deps
```

### Step 3: Create `routes.config.json`

Create `routes.config.json` in your project root:

```json
{
  "baseUrl": "https://example.com",
  "routes": [
    {
      "name": "home",
      "path": "/",
      "authenticated": false
    },
    {
      "name": "about",
      "path": "/about",
      "authenticated": false
    }
  ],
  "globalThresholds": {
    "performance": 50,
    "accessibility": 80,
    "best-practices": 80,
    "seo": 80
  }
}
```

**Replace `https://example.com` with your actual URL**

### Step 4: Create `playwright.config.ts`

Create `playwright.config.ts` in your project root:

```typescript
import { defineConfig } from '@playwright/test';
import { createLighthouseSuite } from 'lighthouse-automation';

createLighthouseSuite('./routes.config.json');

export default defineConfig({
  testDir: './tests',
  timeout: 180000,
  workers: 1,
  projects: [{ name: 'chromium' }],
});
```

### Step 5: Create Test File

Create `tests/lighthouse.spec.ts`:

```typescript
import { test } from '@playwright/test';
import { createLighthouseSuite } from 'lighthouse-automation';

createLighthouseSuite('./routes.config.json', test);
```

### Step 6: Create `package.json` Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "test": "playwright test --project=chromium",
    "report": "playwright show-report"
  }
}
```

### Step 7: Run Tests

```bash
npm test
```

Done! Reports are in `lighthouse-reports/`

## Project Structure After Setup

```
my-lighthouse-project/
├── node_modules/
├── tests/
│   └── lighthouse.spec.ts
├── playwright.config.ts
├── routes.config.json
├── package.json
└── lighthouse-reports/      (created after running tests)
    ├── home-2025-12-03.html
    └── about-2025-12-03.html
```

## Adding Authenticated Routes

If some routes require login:

### Step 1: Export Cookies

1. Open your app in browser
2. Log in
3. Open DevTools (`F12`)
4. Go to **Application** → **Cookies**
5. Select your domain
6. Right-click → **Export**
7. Save as `auth.json` in project root

### Step 2: Update Config

```json
{
  "baseUrl": "https://example.com",
  "routes": [
    {
      "name": "public-page",
      "path": "/",
      "authenticated": false
    },
    {
      "name": "dashboard",
      "path": "/dashboard",
      "authenticated": true
    }
  ],
  "authFile": "./auth.json"
}
```

### Step 3: Run Tests Again

```bash
npm test
```

## Viewing Results

### HTML Reports (Best for Visual Review)

```bash
# Open specific report
open lighthouse-reports/home-2025-12-03.html

# Or use Playwright's report viewer
npm run report
```

### Console Output

When you run `npm test`, you'll see:

```
-------- playwright lighthouse audit reports --------

performance record is 75 and desired threshold was 50
accessibility record is 88 and desired threshold was 80
best-practices record is 85 and desired threshold was 80
seo record is 92 and desired threshold was 80

✓ PASS home
  URL: https://example.com
  Scores:
    Performance:      75/100 (threshold: 50/100)
    Accessibility:    88/100 (threshold: 80/100)
    Best Practices:   85/100 (threshold: 80/100)
    SEO:              92/100 (threshold: 80/100)
```

## Common Next Steps

### Add More Routes

Edit `routes.config.json`:

```json
{
  "baseUrl": "https://example.com",
  "routes": [
    { "name": "home", "path": "/" },
    { "name": "about", "path": "/about" },
    { "name": "contact", "path": "/contact" },
    { "name": "blog", "path": "/blog" }
  ]
}
```

### Adjust Thresholds

If tests are failing, lower thresholds:

```json
{
  "globalThresholds": {
    "performance": 40,      // Reduced from 50
    "accessibility": 75,    // Reduced from 80
    "best-practices": 75,   // Reduced from 80
    "seo": 75               // Reduced from 80
  }
}
```

### Run in CI/CD

Add to `.github/workflows/lighthouse.yml`:

```yaml
name: Lighthouse Audits

on: [push]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: lighthouse-reports
          path: lighthouse-reports/
```

## Troubleshooting Quick Fixes

### "Config file not found"

Make sure `routes.config.json` exists in your project root:

```bash
ls routes.config.json  # Should show the file
```

### "Route path must start with '/'"

Change paths to start with `/`:

```json
// ❌ Wrong
{ "path": "home" }

// ✅ Correct
{ "path": "/home" }
```

### "Invalid baseUrl"

Use full URL with protocol:

```json
// ❌ Wrong
{ "baseUrl": "example.com" }

// ✅ Correct
{ "baseUrl": "https://example.com" }
```

### "Failed to load authentication cookies"

Make sure `auth.json` exists and has cookies:

```bash
ls auth.json     # Should exist
cat auth.json    # Should show cookies
```

### "Test timeout exceeded"

Lighthouse takes time. Increase timeout:

```json
{
  "timeout": 300000  // 5 minutes instead of 3
}
```

## Documentation Reference

Need more details?

- **📖 Full README** - [README.md](./README.md)
  - Complete setup guide
  - All configuration options
  - Error handling details

- **⚡ Quick Reference** - [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
  - Fast lookup tables
  - Command templates
  - Common errors

- **🔧 Troubleshooting** - [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
  - Detailed debugging
  - All error scenarios
  - Solution steps

## Key Commands

```bash
# Install packages
npm install --save-dev lighthouse-automation @playwright/test playwright

# Install browsers
npx playwright install --with-deps

# Run all audits
npm test

# View interactive report
npm run report

# Run in debug mode (step through)
npx playwright test --debug

# Run with UI
npx playwright test --ui
```

## Configuration Checklist

Before running tests:

- [ ] `routes.config.json` exists in project root
- [ ] `baseUrl` is a valid URL (starts with http:// or https://)
- [ ] All route `path` values start with `/`
- [ ] `playwright.config.ts` exists in project root
- [ ] `tests/lighthouse.spec.ts` exists in `tests/` folder
- [ ] If using auth, `auth.json` exists with cookies
- [ ] `package.json` has `@playwright/test` in devDependencies
- [ ] Ran `npx playwright install --with-deps`

## Tips for Success

1. **Start simple** - Test with 1-2 public routes first
2. **Use realistic thresholds** - Not every page needs 90+ scores
3. **Re-export cookies** - If auth fails, cookies may be expired
4. **Check HTML reports** - They show exactly what's failing
5. **Run regularly** - Add to CI/CD to catch regressions early

## What Happens When You Run Tests?

1. Creates Playwright test from each route
2. Launches Chromium browser
3. Navigates to each URL
4. Runs Google Lighthouse audit
5. Collects performance metrics
6. Compares against thresholds
7. Generates HTML reports
8. Shows results in console

Each audit takes ~60-120 seconds depending on page complexity.

## Need Help?

1. **Check TROUBLESHOOTING.md** - Most issues documented
2. **Verify files exist** - `routes.config.json`, `playwright.config.ts`
3. **Test URL manually** - Open it in browser first
4. **Enable verbose mode** - Set `"verbose": true` in config
5. **Check error messages** - They're designed to be helpful

---

Ready to go? Start with Step 1 above, then see the [Full README](./README.md) for advanced options.
