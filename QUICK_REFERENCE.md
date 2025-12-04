# Quick Reference Guide

Fast lookup guide for common tasks.

## File Checklist

Before running tests, make sure you have:

```
my-project/
├── ✅ playwright.config.ts
├── ✅ tests/lighthouse.spec.ts
├── ✅ routes.config.json
├── ⚠️  auth.json (only if authenticated routes)
└── ✅ package.json (with scripts)
```

## Essential Commands

```bash
# Install package
npm install --save-dev lighthouse-automation @playwright/test playwright

# Install browsers
npx playwright install --with-deps

# Run all tests
npm test

# Run with UI
npm run test:ui

# View reports
npm run test:report
```

## Configuration Template

### Minimal `routes.config.json`

```json
{
  "baseUrl": "https://example.com",
  "routes": [
    { "name": "home", "path": "/" }
  ]
}
```

### Full `routes.config.json`

```json
{
  "baseUrl": "https://example.com",
  "routes": [
    {
      "name": "home",
      "path": "/",
      "authenticated": false,
      "displayName": "Home Page",
      "thresholds": {
        "performance": 50,
        "accessibility": 80,
        "best-practices": 80,
        "seo": 80
      },
      "waitFor": "[data-ready]"
    }
  ],
  "globalThresholds": {
    "performance": 50,
    "accessibility": 80,
    "best-practices": 80,
    "seo": 80
  },
  "reportDir": "./lighthouse-reports",
  "authFile": "./auth.json",
  "viewportWidth": 1280,
  "viewportHeight": 720,
  "timeout": 180000,
  "verbose": false
}
```

### `playwright.config.ts`

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

### `tests/lighthouse.spec.ts`

```typescript
import { test } from '@playwright/test';
import { createLighthouseSuite } from 'lighthouse-automation';

createLighthouseSuite('./routes.config.json', test);
```

## Configuration Validation Rules

| Field | Rules | Example |
|-------|-------|---------|
| `baseUrl` | MUST be valid URL, start with http:// or https:// | ✅ `https://example.com` |
| `name` | Alphanumeric, no spaces, used in filenames | ✅ `home`, `dashboard`, `user_profile` |
| `path` | MUST start with `/` | ✅ `/home`, ❌ `home` |
| `authenticated` | Boolean, optional | `true` or `false` |
| `thresholds` | Numbers 0-100 | `{ "performance": 50 }` |
| `reportDir` | Valid directory path | `./lighthouse-reports` |
| `timeout` | Number in milliseconds | `180000` (3 minutes) |

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| Config file not found | Create `routes.config.json` in project root |
| Route path must start with "/" | Change `"path": "home"` to `"path": "/home"` |
| Invalid baseUrl | Change to valid URL: `https://example.com` |
| Threshold must be 0-100 | Use number between 0 and 100 |
| Auth file not found | Export cookies from DevTools and save as `auth.json` |
| Navigation failed with HTTP 404 | Check route path exists: visit URL in browser |
| Test timeout exceeded | Increase `"timeout"` in config |
| Selector not found | Verify selector exists in browser DevTools |

## Cookie Export Steps

### Chrome/Chromium/Edge

1. Open DevTools (`F12`)
2. **Application** → **Cookies** → Select domain
3. Right-click → **Export**
4. Save as `auth.json`

### Firefox

1. Open DevTools (`F12`)
2. **Storage** → **Cookies** → Select domain
3. Copy `name` and `value` for each cookie
4. Manually create `auth.json` structure

### Safari

1. Open DevTools (`Cmd + Option + U`)
2. **Storage** → **Cookies** → Select domain
3. Copy cookies manually to `auth.json`

## Package.json Scripts Template

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

## Threshold Recommendations

| Page Type | Performance | Accessibility | Best Practices | SEO |
|-----------|-------------|----------------|-----------------|-----|
| Public homepage | 60-75 | 85+ | 80+ | 90+ |
| Product page | 50-65 | 85+ | 80+ | 90+ |
| Blog post | 70+ | 85+ | 80+ | 90+ |
| Dashboard (auth) | 40-50 | 80+ | 75+ | 80+ |
| Admin panel | 30-40 | 75+ | 70+ | 70+ |

## Report File Locations

```
lighthouse-reports/
├── home-2025-12-03.html          # Native Lighthouse report
├── home-2025-12-03.json          # Summary JSON
├── dashboard-2025-12-03.html
└── dashboard-2025-12-03.json
```

## Troubleshooting Checklist

### Tests Fail to Run
- [ ] Is `routes.config.json` valid JSON? (Use https://jsonlint.com/)
- [ ] Is `baseUrl` a valid URL starting with http:// or https://?
- [ ] Do all route paths start with `/`?

### Authentication Fails
- [ ] Is `authenticated: true` in the route config?
- [ ] Does `auth.json` exist?
- [ ] Are cookies still valid (not expired)?
- [ ] Does cookie domain match `baseUrl` domain?
- [ ] Try re-exporting cookies from DevTools

### Page Won't Load
- [ ] Can you visit the URL in your browser manually?
- [ ] Is `path` spelled correctly?
- [ ] Is the server running (for localhost)?
- [ ] Check firewall/proxy settings

### Thresholds Failing
- [ ] Are thresholds unrealistic for this page?
- [ ] Check Lighthouse report for specific issues
- [ ] Lower thresholds if appropriate
- [ ] Check for external services (ads, analytics) affecting scores

### Timeout Errors
- [ ] Increase `timeout` in config (try 300000 ms)
- [ ] Check internet connection
- [ ] Check if page is intentionally slow
- [ ] Check for infinite loading spinners

## Tips & Tricks

1. **Enable verbose mode**: Set `"verbose": true` in config for detailed logs
2. **Test locally first**: Start with a simple public page to verify setup
3. **Use displayName**: Makes reports clearer: `"displayName": "User Dashboard"`
4. **Monitor trends**: Keep reports in git to track performance over time
5. **Regular audits**: Add to CI/CD pipeline to catch regressions early
6. **Fresh cookies**: Re-export cookies if tests start failing with auth errors
7. **Use waitFor**: For pages with delayed content: `"waitFor": "[data-loaded]"`

## Getting Help

1. **Check the full README**: `README.md` has comprehensive documentation
2. **Enable verbose logs**: Set `"verbose": true` to see detailed debug info
3. **Validate JSON**: Use https://jsonlint.com/ to validate config files
4. **Check Lighthouse report**: HTML reports contain detailed audit info
5. **Test URL manually**: Try accessing the route in your browser first
6. **Check DevTools**: Verify cookies exist and are valid

---

For more details, see the full [README.md](./README.md)
