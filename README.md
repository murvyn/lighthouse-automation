# ighthouse-automation

Automated Lighthouse performance testing for Playwright projects. Define your URLs/routes in a JSON config file and automatically get Lighthouse audits for each route with minimal setup. Supports both authenticated and public pages with customizable thresholds, parallel testing, and professional HTML reports.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Complete Project Setup](#complete-project-setup)
- [Configuration Format](#configuration-format)
- [Authentication Setup](#authentication-setup)
- [Running Tests](#running-tests)
- [Output & Reports](#output--reports)
- [Error Handling](#error-handling)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [Additional Resources](#additional-resources)

## Additional Resources

- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Fast lookup for commands, templates, and common errors
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Detailed debugging guide for all issues
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and updates

## Features

✨ **Config-Driven**: Define routes in a simple JSON config file
🚀 **Auto-Generated Tests**: One Playwright test per route automatically
🔐 **Mixed Authentication**: Support both public and authenticated routes
📊 **Professional Reports**: Native Lighthouse HTML reports + JSON summaries
⚡ **Parallel Testing**: Run multiple audits in parallel
🎯 **Flexible Thresholds**: Global defaults with per-route overrides
🖥️ **Desktop Audits**: Optimized for 1280x720 desktop performance testing
🛡️ **Comprehensive Error Handling**: Clear, actionable error messages for common mistakes
📋 **Minimal Configuration**: Just define your routes and you're done

## Installation

### Prerequisites

- Node.js 16+ installed
- Playwright 1.40+ (`@playwright/test`)
- npm or yarn

### Install Package

```bash
npm install --save-dev lighthouse-automation @playwright/test playwright
```

Or with yarn:

```bash
yarn add --dev lighthouse-automation @playwright/test playwright
```

## Quick Start

### 1. Create Configuration File

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
      "name": "dashboard",
      "path": "/dashboard",
      "authenticated": true
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

### 2. Setup Playwright Configuration

Create or update `playwright.config.ts`:

```typescript
import { createLighthouseSuite } from 'lighthouse-automation';

createLighthouseSuite('./routes.config.json');

export default {};
```

### 3. Add Authentication (if needed)

If you have authenticated routes, create `auth.json` with your cookies:

```json
{
  "Cookies": [
    {
      "domain": ".example.com",
      "name": "sessionToken",
      "value": "your-token-here",
      "path": "/",
      "secure": true,
      "httpOnly": true,
      "sameSite": "Lax"
    }
  ]
}
```

### 4. Run Tests

```bash
npx playwright test
```

Reports will be saved to `./lighthouse-reports/`

## Complete Project Setup

This section walks through the complete setup process step-by-step, including all required files and configurations.

### Step 1: Project Structure

Your project should have this structure:

```
my-lighthouse-project/
├── node_modules/
├── tests/
│   └── lighthouse.spec.ts          ✅ Create this (test entry point)
├── playwright.config.ts             ✅ Create or update this
├── routes.config.json               ✅ Create this (route definitions)
├── auth.json                        ⚠️  Optional (for authenticated routes)
├── package.json
├── package-lock.json
└── lighthouse-reports/              📁 Auto-created (reports output)
```

### Step 2: Install Dependencies

```bash
# Install the package and required peer dependencies
npm install --save-dev lighthouse-automation @playwright/test playwright

# Install Playwright browsers (required for testing)
npx playwright install --with-deps
```

**Verify installation:**
```bash
npx playwright --version  # Should show v1.40+
```

### Step 3: Create Playwright Configuration

Create `playwright.config.ts` in your project root:

```typescript
import { defineConfig } from '@playwright/test';
import { createLighthouseSuite } from 'lighthouse-automation';

// Create Lighthouse tests from config
createLighthouseSuite('./routes.config.json');

// Export Playwright configuration (can be empty)
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 1,  // Lighthouse tests are CPU-intensive, use 1 worker
  timeout: 180000,  // 3 minutes per test
  use: {
    // baseURL: 'http://localhost:3000',  // Optional: set if using local server
  },
  projects: [
    {
      name: 'chromium',
      use: { ignoreHTTPSErrors: true },
    },
  ],
});
```

### Step 4: Create Routes Configuration

Create `routes.config.json` in your project root:

```json
{
  "baseUrl": "https://example.com",
  "routes": [
    {
      "name": "home",
      "path": "/",
      "authenticated": false,
      "displayName": "Home Page"
    },
    {
      "name": "about",
      "path": "/about",
      "authenticated": false,
      "displayName": "About Page"
    }
  ],
  "globalThresholds": {
    "performance": 50,
    "accessibility": 80,
    "best-practices": 80,
    "seo": 80
  },
  "reportDir": "./lighthouse-reports",
  "timeout": 180000,
  "verbose": false
}
```

**Important Notes:**
- `baseUrl` MUST be a valid URL starting with `http://` or `https://`
- `name` is used in filenames, so keep it simple (alphanumeric, no spaces)
- `path` MUST start with `/` (e.g., `/home`, not `home`)
- `authenticated: true` requires `auth.json` file with cookies

### Step 5: Create Test File

Create `tests/lighthouse.spec.ts`:

```typescript
import { test } from '@playwright/test';
import { createLighthouseSuite } from 'lighthouse-automation';

// Pass the test instance to avoid version conflicts
// This line generates one test per route from routes.config.json
createLighthouseSuite('./routes.config.json', test);
```

### Step 6: Add Authentication (if needed)

For authenticated routes, you need to export cookies from your browser.

#### How to Export Cookies from DevTools:

1. Open DevTools (`F12` on Windows/Linux, `Cmd+Option+I` on Mac)
2. Go to **Application** tab → **Cookies** (on left sidebar)
3. Select the domain matching your `baseUrl`
4. Right-click → **Export** as JSON
5. Save as `auth.json` in your project root

#### Example `auth.json`:

```json
{
  "Cookies": [
    {
      "domain": ".example.com",
      "expirationDate": 1735689600,
      "hostOnly": false,
      "httpOnly": true,
      "name": "sessionToken",
      "path": "/",
      "sameSite": "Lax",
      "secure": true,
      "session": false,
      "storeId": "0",
      "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    {
      "domain": ".example.com",
      "httpOnly": false,
      "name": "userId",
      "path": "/",
      "sameSite": "Lax",
      "secure": true,
      "value": "user-12345"
    }
  ]
}
```

**Cookie Field Reference:**

| Field | Required | Description |
|-------|----------|-------------|
| `domain` | ✅ | Cookie domain (usually `.example.com` with leading dot) |
| `name` | ✅ | Cookie name (e.g., `sessionToken`, `user_id`) |
| `value` | ✅ | Cookie value (token or data) |
| `path` | ✅ | Cookie path, usually `/` |
| `secure` | ❌ | HTTPS only cookies (default: `false`) |
| `httpOnly` | ❌ | JS-inaccessible cookies (default: `false`) |
| `sameSite` | ❌ | SameSite policy: `Strict`, `Lax`, or `None` (default: `Lax`) |
| `expirationDate` | ❌ | Unix timestamp when cookie expires |

### Step 7: Update package.json Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "test": "playwright test --project=chromium --timeout=180000",
    "test:ui": "playwright test --ui --project=chromium",
    "test:debug": "playwright test --debug --project=chromium",
    "test:report": "playwright show-report",
    "test:verbose": "playwright test --project=chromium --timeout=180000 -- --reporter=verbose"
  }
}
```

### Step 8: Run Tests

```bash
# Run all Lighthouse audits
npm test

# Run with interactive UI
npm run test:ui

# Run in debug mode
npm run test:debug

# View previous test report
npm run test:report
```

## Authentication Setup

This section provides detailed guidance on setting up authentication for protected routes.

### When Do You Need Authentication?

You need `authenticated: true` and `auth.json` when:
- Routes require a user to be logged in
- Routes return 401/403 without valid cookies
- Routes are behind a login page

### Step-by-Step: Export Cookies from DevTools

#### For Chrome/Chromium/Edge:

1. **Open DevTools**
   - Windows/Linux: `F12`
   - Mac: `Cmd + Option + I`

2. **Navigate to your application**
   - Log in if required
   - Make sure you're on the authenticated page

3. **Find Cookies**
   - Click **Application** tab (top menu)
   - On left sidebar, click **Cookies**
   - Select your domain (e.g., `example.com` or `.example.com`)

4. **Export as JSON**
   - Right-click in the cookies list
   - Select **Export** (or **Export as...** on some versions)
   - Save as `auth.json` in your project root

#### For Firefox:

1. **Open DevTools** (F12)
2. **Go to Storage** tab
3. **Click Cookies** → Select your domain
4. Cookies in Firefox don't have direct export, so you'll need to:
   - Open browser console
   - Run: `copy(JSON.stringify(document.cookie))`
   - Paste into a text editor and format properly
   - Or manually copy each cookie's name/value into `auth.json`

#### For Safari:

1. **Enable Developer Menu**
   - Preferences → Advanced → "Show features for web developers"
2. **Open Developer Tools** (Cmd + Option + U)
3. **Go to Storage** tab
4. **Select Cookies** → Select domain
5. Similar to Firefox, you'll need to manually copy values

### Cookie File Structure

The exported `auth.json` should look like:

```json
{
  "Cookies": [
    {
      "domain": ".example.com",
      "expirationDate": 1735689600,
      "hostOnly": false,
      "httpOnly": true,
      "name": "sessionToken",
      "path": "/",
      "sameSite": "Lax",
      "secure": true,
      "session": false,
      "storeId": "0",
      "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    {
      "domain": ".example.com",
      "httpOnly": false,
      "name": "userId",
      "path": "/",
      "sameSite": "Lax",
      "secure": true,
      "value": "user-12345"
    }
  ]
}
```

### Understanding Cookie Fields

| Field | Example | Description |
|-------|---------|-------------|
| `domain` | `.example.com` | Domain where cookie applies. Usually has a dot prefix for subdomains |
| `name` | `sessionToken` | Cookie identifier |
| `value` | `abc123...` | Cookie data (often a token) |
| `path` | `/` | URL path where cookie is valid (usually `/` for all paths) |
| `secure` | `true` | Only send over HTTPS |
| `httpOnly` | `true` | Cannot be accessed via JavaScript |
| `sameSite` | `Lax` | CSRF protection level: `Strict`, `Lax`, or `None` |
| `expirationDate` | `1735689600` | Unix timestamp of expiration (can be omitted for session cookies) |

### Matching Cookies to Your Domain

Your `auth.json` domain should match your `baseUrl`:

```json
// If baseUrl is https://example.com
{
  "baseUrl": "https://example.com",
  // Then use domain ".example.com" in cookies
  "Cookies": [
    { "domain": ".example.com", ... }
  ]
}

// If baseUrl is https://app.example.com
{
  "baseUrl": "https://app.example.com",
  // Could use .example.com (works for all subdomains) OR
  { "domain": ".example.com", ... }
  // OR use specific subdomain
  { "domain": ".app.example.com", ... }
}

// If baseUrl is http://localhost:3000
{
  "baseUrl": "http://localhost:3000",
  // Use localhost (not .localhost)
  "Cookies": [
    { "domain": "localhost", ... }
  ]
}
```

### Common Issues with Cookies

#### Cookies Expire

Exported cookies have expiration dates. When they expire, authentication fails:

```
Error: Failed to load authentication cookies for "dashboard":
Auth file not found or cookies have expired
```

**Fix:** Re-export fresh cookies from DevTools:
```bash
# You'll need to:
# 1. Log in again to your application in browser
# 2. Export cookies again from DevTools
# 3. Replace auth.json with new cookies
```

#### Domain Mismatch

If your domain in `auth.json` doesn't match the navigation domain, cookies won't be applied:

```json
{
  "baseUrl": "https://api.example.com",  // Going to api.example.com
  "routes": [
    { "name": "dashboard", "path": "/dashboard", "authenticated": true }
  ],
  "Cookies": [
    { "domain": ".other-domain.com", ... }  // Wrong domain!
  ]
}
```

**Fix:** Use the correct domain:
```json
{
  "Cookies": [
    { "domain": ".example.com", ... }  // or .api.example.com
  ]
}
```

#### Session vs Persistent Cookies

- **Session cookies**: No `expirationDate` (or it's in the past) - deleted when browser closes
- **Persistent cookies**: Have future `expirationDate` - stored on disk

Both work with the package, but session cookies need fresh login each session.

## Configuration Format

### Routes Configuration (`routes.config.json`)

```typescript
{
  // Required: Base URL for all routes
  "baseUrl": "https://example.com",

  // Required: Array of routes to audit
  "routes": [
    {
      "name": "unique-route-name",           // Required: used in report filenames
      "path": "/page-path",                   // Required: appended to baseUrl
      "authenticated": false,                 // Optional: default false
      "displayName": "Page Name",             // Optional: for display in reports
      "thresholds": {                         // Optional: per-route overrides
        "performance": 50,
        "accessibility": 80,
        "best-practices": 80,
        "seo": 80
      },
      "waitFor": "[data-ready]"               // Optional: wait for selector before audit
    }
  ],

  // Optional: Global thresholds for all routes
  "globalThresholds": {
    "performance": 50,
    "accessibility": 80,
    "best-practices": 80,
    "seo": 80
  },

  // Optional: Report output directory (default: ./lighthouse-reports)
  "reportDir": "./lighthouse-reports",

  // Optional: Auth cookies file path (default: ./auth.json)
  "authFile": "./auth.json",

  // Optional: Desktop viewport width (default: 1280)
  "viewportWidth": 1280,

  // Optional: Desktop viewport height (default: 720)
  "viewportHeight": 720,

  // Optional: Test timeout in ms (default: 180000)
  "timeout": 180000,

  // Optional: Verbose logging (default: false)
  "verbose": false
}
```

### Authentication Cookies (`auth.json`)

Export cookies from DevTools (DevTools > Application > Cookies > Export):

```json
{
  "Cookies": [
    {
      "domain": ".example.com",
      "expirationDate": 1234567890,
      "hostOnly": false,
      "httpOnly": true,
      "name": "sessionToken",
      "path": "/",
      "sameSite": "Lax",
      "secure": true,
      "session": false,
      "storeId": "0",
      "value": "token_value_here"
    }
  ]
}
```

## Usage Examples

### Simple Public Website

```json
{
  "baseUrl": "https://mysite.com",
  "routes": [
    { "name": "home", "path": "/" },
    { "name": "about", "path": "/about" },
    { "name": "contact", "path": "/contact" }
  ]
}
```

### Application with Auth

```json
{
  "baseUrl": "https://app.example.com",
  "routes": [
    {
      "name": "login",
      "path": "/login",
      "authenticated": false
    },
    {
      "name": "dashboard",
      "path": "/dashboard",
      "authenticated": true
    },
    {
      "name": "settings",
      "path": "/settings",
      "authenticated": true,
      "waitFor": "[data-testid='settings-loaded']"
    }
  ],
  "globalThresholds": {
    "performance": 60,
    "accessibility": 85,
    "best-practices": 85,
    "seo": 80
  }
}
```

### Per-Route Custom Thresholds

```json
{
  "baseUrl": "https://example.com",
  "globalThresholds": {
    "performance": 50,
    "accessibility": 80,
    "best-practices": 80,
    "seo": 80
  },
  "routes": [
    {
      "name": "home",
      "path": "/",
      "authenticated": false,
      "thresholds": {
        "performance": 75  // Override just performance
      }
    },
    {
      "name": "slow-dashboard",
      "path": "/dashboard",
      "authenticated": true,
      "thresholds": {
        "performance": 30  // More lenient for this route
      }
    }
  ]
}
```

## Output

### Console Output

```
============================================================
LIGHTHOUSE AUDIT SUMMARY
============================================================

  Route              Performance    Accessibility  Best Practices  SEO     Status
  ─────────────────────────────────────────────────────────────────────────────────
  home               78/100         92/100         88/100          95/100  PASS
  dashboard          45/100         85/100         80/100          88/100  FAIL
  settings           62/100         90/100         85/100          92/100  PASS

Total: 2/3 routes passed (67%)
⚠️  1 audit(s) failed

Reports saved to lighthouse-reports/
```

### HTML Reports

Interactive visual reports for each route:
- Color-coded metrics (green for pass, red for fail)
- Detailed score cards
- Timestamp and URL information
- Professional styling

**Files**: `lighthouse-reports/{route-name}-2025-12-03.html`

### JSON Reports

Machine-readable results for integration and analysis:

```json
{
  "timestamp": "2025-12-03T15:30:00.000Z",
  "route": {
    "name": "dashboard",
    "url": "https://example.com/dashboard"
  },
  "scores": {
    "performance": 0.45,
    "accessibility": 0.85,
    "best-practices": 0.80,
    "seo": 0.88
  },
  "thresholds": {
    "performance": 50,
    "accessibility": 80,
    "best-practices": 80,
    "seo": 80
  },
  "passed": false
}
```

**Files**: `lighthouse-reports/{route-name}-2025-12-03.json`

## API Reference

### `createLighthouseSuite(configPath: string)`

Main function to create all Lighthouse tests from configuration.

```typescript
import { createLighthouseSuite } from 'lighthouse-automation';

createLighthouseSuite('./routes.config.json');
export default {};
```

### `CookieManager`

Utility class for loading and managing cookies:

```typescript
import { CookieManager } from 'lighthouse-automation';

const manager = CookieManager.load('./auth.json');
const cookies = manager.asPlaywrightCookies();
const domainCookies = manager.getByDomain('example.com');
```

### `Logger`

Utility class for formatted console output:

```typescript
import { Logger } from 'lighthouse-automation';

const logger = new Logger(/* verbose */ false);
logger.printRouteResult(result);
logger.printSummary(results);
logger.info('Information message');
logger.warn('Warning message');
logger.error('Error message');
```

### `LighthouseRunner`

Core utility for running audits programmatically:

```typescript
import { LighthouseRunner } from 'lighthouse-automation';

const runner = new LighthouseRunner({
  baseUrl: 'https://example.com',
  route: { name: 'home', path: '/', authenticated: false },
  globalThresholds: { performance: 50 },
});

const result = await runner.run();
```

## Output & Reports

### Console Output

When you run tests, you'll see formatted output:

```
-------- playwright lighthouse audit reports --------

performance record is 78 and desired threshold was 50
accessibility record is 92 and desired threshold was 80
best-practices record is 88 and desired threshold was 80
seo record is 95 and desired threshold was 80

✓ PASS home
  URL: https://example.com
  Scores:
    Performance:      78/100 (threshold: 50/100)
    Accessibility:    92/100 (threshold: 80/100)
    Best Practices:   88/100 (threshold: 80/100)
    SEO:              95/100 (threshold: 80/100)
```

### HTML Reports

Native Lighthouse HTML reports are saved as:
- `lighthouse-reports/home-2025-12-03.html`
- `lighthouse-reports/dashboard-2025-12-03.html`

These files contain the full interactive Lighthouse viewer with:
- Performance metrics and opportunities
- Accessibility issues and fixes
- Best practices recommendations
- SEO analysis
- Detailed audit information

**View reports:**
```bash
# Open in browser
open lighthouse-reports/home-2025-12-03.html

# Or use Playwright's built-in report viewer
npm run test:report
```

## Error Handling

The package includes comprehensive error validation and helpful error messages for common mistakes.

### Configuration Validation Errors

#### Missing or Invalid Config File

**Error:**
```
Config file not found: /path/to/routes.config.json
Create a routes.config.json file in your project root with the following structure:
{
  "baseUrl": "https://example.com",
  "routes": [
    { "name": "home", "path": "/", "authenticated": false }
  ]
}
```

**Fix:** Create `routes.config.json` in your project root with valid routes.

#### Invalid JSON

**Error:**
```
Failed to parse config file at routes.config.json: Unexpected token } in JSON at position 45
Make sure the file is valid JSON.
```

**Fix:** Check your JSON syntax. Use a JSON validator: https://jsonlint.com/

#### Invalid Base URL

**Error:**
```
Invalid baseUrl: "not a url" is not a valid URL. Expected format: https://example.com
```

**Fix:** Ensure `baseUrl` is a valid URL:
- ✅ `https://example.com`
- ✅ `http://localhost:3000`
- ❌ `example.com` (missing protocol)
- ❌ `not a url`

### Route Validation Errors

#### Missing Path Slash

**Error:**
```
Route path must start with "/". Got: "home". Did you mean "/home"?
```

**Fix:** Always start route paths with `/`:
```json
{
  "name": "home",
  "path": "/home"  // ✅ Correct
}
```

#### Invalid Threshold Value

**Error:**
```
Threshold "performance" in route "home" must be a number between 0-100. Got: 150
```

**Fix:** Thresholds must be between 0-100:
```json
{
  "thresholds": {
    "performance": 75,    // ✅ Valid
    "accessibility": 80   // ✅ Valid
  }
}
```

#### Invalid Threshold Key

**Error:**
```
Invalid threshold key "perfomance" in route "home".
Valid keys are: performance, accessibility, best-practices, seo
```

**Fix:** Check the exact spelling of threshold keys:
```json
{
  "thresholds": {
    "performance": 50,        // ✅ Correct
    "accessibility": 80,      // ✅ Correct
    "best-practices": 80,     // ✅ Correct
    "seo": 80                 // ✅ Correct
  }
}
```

### Authentication Errors

#### Missing Auth File

**Error:**
```
Route "dashboard" requires authentication but no authFile is configured.
Add "authFile" to routes.config.json pointing to your auth.json file.
```

**Fix:** Either:
1. Add `"authFile": "./auth.json"` to your config
2. Or set `"authenticated": false` if the route doesn't need auth

#### Auth File Not Found

**Error:**
```
Failed to load authentication cookies for "dashboard":
Make sure:
  1. Auth file exists at: /path/to/auth.json
  2. Auth file is valid JSON
  3. Auth file has a "Cookies" array
  4. Cookies are not expired
```

**Fix:**
1. Create `auth.json` by exporting from DevTools (see Step 6)
2. Verify file location matches `authFile` in config
3. Ensure JSON is valid

#### Empty Cookies File

**Error:**
```
Auth file at auth.json has no cookies.
Export cookies from DevTools (DevTools → Application → Cookies → Right-click → Export)
```

**Fix:** Export fresh cookies from your browser:
1. Log into your application
2. Open DevTools (`F12`)
3. Go to **Application** → **Cookies**
4. Select your domain
5. Right-click → **Export** and save as `auth.json`

### Navigation Errors

#### Page Not Found (404)

**Error:**
```
Navigation failed with HTTP 404. The route may not exist or the server returned an error.
URL: https://example.com/nonexistent
```

**Fix:**
- Verify the route path exists: `https://example.com/nonexistent`
- Check `baseUrl` and `path` are correct
- Ensure the server is running (for localhost)

#### Connection Failed

**Error:**
```
Failed to navigate to https://example.com/home: net::ERR_NAME_NOT_RESOLVED
Troubleshooting:
  1. Check if baseUrl is correct: https://example.com
  2. Check if route path is correct: /home
  3. Check if the server is running and accessible
  4. Check your network connection
```

**Fix:**
- Test URL in browser: `https://example.com/home`
- Check internet connection
- Verify DNS resolution
- Check firewall/proxy settings

#### Selector Timeout

**Error:**
```
Selector "[data-ready]" not found on page after 10 seconds.
Check if the selector is correct and the page is fully loaded.
URL: https://example.com/dashboard
```

**Fix:**
- Verify selector exists: `[data-ready]` in DevTools
- Increase wait time by adjusting page load strategy
- Or remove `waitFor` if not needed

### Threshold Failures

When a page doesn't meet thresholds:

**Error:**
```
Lighthouse audit failed thresholds for route "dashboard":
  Performance: 25/100 (threshold: 50/100)
  Accessibility: 85/100 (threshold: 80/100)
  Best Practices: 62/100 (threshold: 60/100)
  SEO: 85/100 (threshold: 80/100)

To fix this, either:
  1. Improve the page's performance (consider your thresholds reasonable)
  2. Lower the thresholds in routes.config.json for this route
  3. Check for external services or ads affecting scores
```

**Fix:**
1. Check Lighthouse report to see what's causing low scores
2. Lower thresholds if they're unrealistic:
```json
{
  "name": "dashboard",
  "path": "/dashboard",
  "thresholds": {
    "performance": 40,  // Reduced from 50
    "accessibility": 80
  }
}
```

## Troubleshooting

### Cookies not working

**Issue**: Tests fail with 401/403 errors despite having `authenticated: true`

**Solution**:
1. Verify `auth.json` exists and is valid
2. Check cookie domains match your baseUrl
3. Enable verbose logging: `"verbose": true` in config
4. Export fresh cookies from DevTools (cookies expire!)

### Timeout errors

**Issue**: `Test timeout of 180000ms exceeded`

**Solution**:
1. Increase timeout in config: `"timeout": 300000`
2. Check your internet connection
3. Verify the URL is accessible and not blocking automation
4. Check if page has slow initial load

### Port conflicts

**Issue**: `Error: Failed to find available port`

**Solution**:
- Reduce number of parallel tests
- Kill processes using the port range (9000-9100)
- This is handled automatically; should not occur normally

### Reports not generating

**Issue**: Reports folder is empty

**Solution**:
1. Check `reportDir` path is writable
2. Verify no permission errors in verbose logs
3. Ensure enough disk space available

## CI/CD Integration

### GitHub Actions

```yaml
name: Lighthouse Audits

on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run Lighthouse audits
        run: npx playwright test

      - name: Upload reports
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: lighthouse-reports
          path: lighthouse-reports/
```

## Best Practices

1. **Separate authenticated and public routes** for clearer results
2. **Use meaningful route names** for easy identification
3. **Set realistic thresholds** for your pages (not all pages need 90+)
4. **Monitor trends over time** by storing reports in version control
5. **Test regularly** - add to your CI/CD pipeline
6. **Keep cookies fresh** - re-export when they expire
7. **Use `waitFor`** selector when page needs time to render

## License

MIT

## Support

For issues and feature requests, visit: https://github.com/your-company/lighthouse-automation

---

Made with ❤️ for QA teams everywhere
