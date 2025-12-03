# Troubleshooting Guide

Comprehensive guide for diagnosing and fixing issues.

## Before You Start

1. **Check Node version**: `node --version` (need 16+)
2. **Check npm version**: `npm --version`
3. **Verify package installed**: `npm list @company/lighthouse-automation`
4. **Verify browsers installed**: `npx playwright install --with-deps`

## Setup Issues

### "Cannot find module @company/lighthouse-automation"

**Problem:** npm can't find the package

**Solutions:**

1. **Verify installation:**
```bash
npm list @company/lighthouse-automation
npm list @playwright/test
npm list playwright
```

2. **Reinstall if needed:**
```bash
npm uninstall @company/lighthouse-automation @playwright/test playwright
npm install --save-dev @company/lighthouse-automation @playwright/test playwright
```

3. **Clear npm cache:**
```bash
npm cache clean --force
npm install
```

### "Config file not found: routes.config.json"

**Problem:** Package can't find your configuration file

**Solutions:**

1. **Check file exists:**
```bash
ls -la routes.config.json  # Should show the file
```

2. **Check you're in the right directory:**
```bash
pwd  # Should show your project directory
ls   # Should list routes.config.json
```

3. **Verify file path in code:**
```typescript
// In tests/lighthouse.spec.ts
createLighthouseSuite('./routes.config.json', test);
// ^ Current directory must contain routes.config.json
```

4. **Use absolute path as last resort:**
```typescript
import path from 'path';
createLighthouseSuite(path.join(__dirname, '..', 'routes.config.json'), test);
```

## Configuration Issues

### "Failed to parse config file... JSON.parse error"

**Problem:** Your JSON is invalid

**Solutions:**

1. **Validate JSON online:**
   - Visit https://jsonlint.com/
   - Paste your `routes.config.json` content
   - Fix any errors shown

2. **Common JSON mistakes:**

```json
// ❌ WRONG: Trailing comma
{
  "baseUrl": "https://example.com",
  "routes": [],
  // <- This comma causes error!
}

// ✅ CORRECT: No trailing commas
{
  "baseUrl": "https://example.com",
  "routes": []
}
```

3. **Check special characters:**
```json
// ❌ WRONG: Unescaped quotes
{
  "baseUrl": "https://example.com/page?query="value""
}

// ✅ CORRECT: Escaped quotes
{
  "baseUrl": "https://example.com/page?query=\\\"value\\\""
}
```

4. **Enable verbose mode to see exact location:**
```json
{
  "baseUrl": "https://example.com",
  "verbose": true
}
```

### "Invalid baseUrl: ... is not a valid URL"

**Problem:** Your `baseUrl` format is wrong

**Solutions:**

```json
// ❌ WRONG: Missing protocol
{ "baseUrl": "example.com" }

// ✅ CORRECT: With https://
{ "baseUrl": "https://example.com" }

// ❌ WRONG: With trailing path
{ "baseUrl": "https://example.com/app" }

// ✅ CORRECT: Base URL only
{ "baseUrl": "https://example.com" }
// Then use "path": "/app" in routes

// ❌ WRONG: Typo
{ "baseUrl": "htp://example.com" }

// ✅ CORRECT
{ "baseUrl": "http://example.com" }

// ✅ CORRECT: Localhost
{ "baseUrl": "http://localhost:3000" }
```

### "Route path must start with '/'"

**Problem:** Your route path doesn't start with `/`

**Solutions:**

```json
// ❌ WRONG
{
  "routes": [
    { "name": "home", "path": "home" }
  ]
}

// ✅ CORRECT
{
  "routes": [
    { "name": "home", "path": "/home" }
  ]
}

// ✅ ALSO CORRECT
{
  "routes": [
    { "name": "root", "path": "/" }
  ]
}
```

### "Threshold must be between 0-100"

**Problem:** Threshold value is out of range

**Solutions:**

```json
// ❌ WRONG
{
  "thresholds": {
    "performance": 150  // Too high!
  }
}

// ✅ CORRECT
{
  "thresholds": {
    "performance": 75   // Valid 0-100
  }
}

// ❌ WRONG: Negative
{
  "thresholds": {
    "performance": -10
  }
}

// ✅ CORRECT
{
  "thresholds": {
    "performance": 25
  }
}
```

### "Invalid threshold key"

**Problem:** Misspelled threshold key name

**Solutions:**

```json
// ❌ WRONG: Typos in key names
{
  "thresholds": {
    "perfomance": 50,     // Wrong! Should be "performance"
    "bestpractices": 80,  // Wrong! Should be "best-practices"
    "a11y": 80            // Wrong! Should be "accessibility"
  }
}

// ✅ CORRECT: Exact spelling
{
  "thresholds": {
    "performance": 50,
    "accessibility": 80,
    "best-practices": 80,
    "seo": 80
  }
}
```

## Authentication Issues

### "Route requires authentication but no authFile configured"

**Problem:** Route needs auth but you didn't provide `authFile`

**Solutions:**

1. **Add authFile to config:**
```json
{
  "routes": [
    { "name": "dashboard", "path": "/dashboard", "authenticated": true }
  ],
  "authFile": "./auth.json"  // <- Add this line
}
```

2. **Or disable authentication if route doesn't need it:**
```json
{
  "routes": [
    { "name": "dashboard", "path": "/dashboard", "authenticated": false }
  ]
}
```

### "Failed to load authentication cookies"

**Problem:** Can't read your `auth.json` file

**Solutions:**

1. **Verify file exists:**
```bash
ls -la auth.json
file auth.json
```

2. **Verify it's valid JSON:**
```bash
cat auth.json | node -e "console.log(JSON.parse(require('fs').readFileSync(0, 'utf-8')))"
# If this works, JSON is valid
```

3. **Verify it has Cookies array:**
```json
{
  "Cookies": [
    // <- Must have this exact key
    { "name": "sessionToken", ... }
  ]
}
```

4. **Check file permissions:**
```bash
# File should be readable
ls -la auth.json | grep -q "r" && echo "Readable" || echo "NOT readable"
```

### "Auth file at auth.json has no cookies"

**Problem:** Your `auth.json` has an empty Cookies array

**Solutions:**

1. **Verify you exported cookies from DevTools:**

   Chrome/Edge:
   - DevTools → Application → Cookies
   - Select domain
   - Right-click → Export

   Firefox:
   - DevTools → Storage → Cookies
   - Copy cookies manually

2. **Verify cookies aren't expired:**
```bash
# Check cookie expiration dates
cat auth.json | grep expirationDate
# If all dates are in the past, cookies are expired
# Re-export fresh cookies from DevTools
```

3. **Make sure you logged in before exporting:**
   - Log into your application
   - THEN go to DevTools
   - THEN export cookies
   - Cookies only exist after login

### Tests fail with 401/403 despite having auth.json

**Problem:** Cookies aren't being applied correctly

**Solutions:**

1. **Check domain matches:**

```json
// If baseUrl is https://example.com
{
  "baseUrl": "https://example.com",
  "Cookies": [
    // Domain should match:
    // ✅ ".example.com"
    // ✅ "example.com"
    // ❌ ".other-domain.com"
    { "domain": ".example.com", "name": "sessionToken", ... }
  ]
}

// If baseUrl is https://api.example.com
{
  "baseUrl": "https://api.example.com",
  "Cookies": [
    // ✅ ".example.com" (matches wildcard)
    // ✅ ".api.example.com" (matches subdomain)
    // ❌ "example.com" (missing subdomain)
    { "domain": ".example.com", ... }
  ]
}

// If baseUrl is http://localhost:3000
{
  "baseUrl": "http://localhost:3000",
  "Cookies": [
    // ✅ "localhost"
    // ❌ ".localhost"
    { "domain": "localhost", ... }
  ]
}
```

2. **Enable verbose logging:**
```json
{
  "verbose": true
}
```

3. **Try re-exporting cookies:**
   - Log out and log back in
   - Export cookies again from DevTools
   - Replace `auth.json` with fresh cookies

4. **Check if cookies are httpOnly:**
```json
{
  "Cookies": [
    {
      "name": "sessionToken",
      "httpOnly": true,  // <- Should still work
      ...
    }
  ]
}
```

## Navigation Issues

### "Failed to navigate to https://example.com: net::ERR_NAME_NOT_RESOLVED"

**Problem:** URL can't be reached (DNS or network issue)

**Solutions:**

1. **Test URL in browser:**
   - Open in your browser manually
   - Can you access it?

2. **Check internet connection:**
```bash
ping example.com
# Should get responses
```

3. **Check DNS:**
```bash
nslookup example.com
# Should resolve to an IP address
```

4. **Check firewall:**
   - Is a firewall/VPN blocking the request?
   - Try disabling VPN if using one

5. **For localhost, verify server is running:**
```bash
# If baseUrl is http://localhost:3000
curl http://localhost:3000
# Should get response, not "Connection refused"
```

### "Navigation failed with HTTP 404"

**Problem:** Route doesn't exist

**Solutions:**

1. **Verify URL is correct:**
   - Test in browser: `https://example.com/dashboard`
   - Check the path in config

2. **Common mistakes:**

```json
// ❌ WRONG: baseUrl includes path
{
  "baseUrl": "https://example.com/app",
  "routes": [{ "name": "home", "path": "/" }]
  // Result: https://example.com/app/
}

// ✅ CORRECT: baseUrl is root, path is appended
{
  "baseUrl": "https://example.com",
  "routes": [{ "name": "home", "path": "/app" }]
  // Result: https://example.com/app
}
```

3. **Check server logs:**
   - Is the route registered on server?
   - Are there any errors in server logs?

### "Navigation failed with HTTP 403/401"

**Problem:** Access denied even with cookies

**Solutions:**

See "Authentication Issues" section above.

### "Timeout of 180000ms exceeded"

**Problem:** Test took too long (network slow or page stuck)

**Solutions:**

1. **Increase timeout:**
```json
{
  "timeout": 300000  // 5 minutes instead of 3
}
```

2. **Check internet connection:**
   - Is network slow?
   - Try running again

3. **Check page load issues:**
   - Is page stuck loading?
   - Are there infinite spinners?
   - Check server logs for errors

4. **Check lighthouse audit taking too long:**
   - Lighthouse can take 60-120 seconds
   - Normal for complex pages
   - Try increasing timeout more

## Selector Issues

### "Selector '[data-ready]' not found on page"

**Problem:** `waitFor` selector doesn't exist

**Solutions:**

1. **Verify selector exists:**
   - Open page in browser
   - Open DevTools (`F12`)
   - Run in console: `document.querySelector('[data-ready]')`
   - Should return the element, not `null`

2. **Check selector syntax:**

```json
// ❌ WRONG: Extra quotes
{ "waitFor": "\"[data-ready]\"" }

// ✅ CORRECT
{ "waitFor": "[data-ready]" }

// ❌ WRONG: CSS selector with extra symbols
{ "waitFor": "$[data-ready]" }

// ✅ CORRECT: Valid CSS selector
{ "waitFor": "[data-ready]" }
```

3. **Wait for different selector:**
```json
{
  "routes": [
    {
      "name": "dashboard",
      "path": "/dashboard",
      // Try waiting for different element that appears first
      "waitFor": ".dashboard-container"
    }
  ]
}
```

4. **Remove waitFor if not needed:**
```json
{
  "routes": [
    {
      "name": "dashboard",
      "path": "/dashboard"
      // Remove waitFor if page loads quickly
    }
  ]
}
```

## Report Issues

### "Reports not being generated"

**Problem:** No HTML/JSON files in `lighthouse-reports/`

**Solutions:**

1. **Check directory exists:**
```bash
ls -la lighthouse-reports/
# Should exist and be writable
```

2. **Check permissions:**
```bash
# Should be writable (w flag)
ls -ld lighthouse-reports/
# drwxr-xr-x <- Should have 'w' flag
```

3. **Fix permissions:**
```bash
chmod 755 lighthouse-reports/
```

4. **Check disk space:**
```bash
df -h
# Need at least few MB free
```

5. **Check reportDir in config:**
```json
{
  "reportDir": "./lighthouse-reports"
  // Should be valid directory path
}
```

6. **Enable verbose mode:**
```json
{
  "verbose": true
}
```

### "Reports are in wrong location"

**Problem:** Files saved somewhere unexpected

**Solutions:**

1. **Check reportDir config:**
```json
{
  "reportDir": "./lighthouse-reports"
}
```

2. **Verify current working directory:**
```bash
pwd
# Should be your project root
```

3. **Use absolute path:**
```json
{
  "reportDir": "/home/user/my-project/lighthouse-reports"
}
```

## Performance Issues

### "Tests are slow"

**Problem:** Takes a long time to run

**Normal for Lighthouse:**
- Each audit takes 60-120 seconds
- Multiple audits run sequentially
- 5 routes × 100 seconds each = 500 seconds (~8 minutes)

**Solutions:**

1. **Run audits in parallel in CI:**
   - Split routes into multiple CI jobs
   - Each job runs different routes

2. **Only audit critical routes:**
```json
{
  "routes": [
    // Keep only important routes for regular testing
    { "name": "home", "path": "/" },
    { "name": "checkout", "path": "/checkout" }
    // Remove less critical routes
  ]
}
```

3. **Increase timeout to allow full audits:**
```json
{
  "timeout": 240000  // 4 minutes
}
```

## Common Lighthouse Failures

### "Performance score too low"

**Solutions:**

1. **Lower thresholds temporarily:**
```json
{
  "thresholds": {
    "performance": 40  // More lenient
  }
}
```

2. **Check for common issues:**
   - Large images not optimized
   - Unminified JavaScript
   - Too many third-party scripts
   - Poor server response time

3. **View Lighthouse report:**
   - Open HTML report from `lighthouse-reports/`
   - Check "Opportunities" section
   - Fix suggestions provided

### "Accessibility score too low"

**Solutions:**

1. **Common issues:**
   - Missing alt text on images
   - Contrast too low
   - Form inputs missing labels
   - Keyboard navigation broken

2. **Fix in code, then re-audit**

### "SEO score too low"

**Solutions:**

1. **Common issues:**
   - Missing meta description
   - Viewport not set
   - Page not mobile-friendly
   - No valid robots.txt

2. **Check HTML head:**
```html
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="...">
  <!-- Other meta tags -->
</head>
```

## Getting More Help

1. **Enable verbose mode for detailed logs:**
```json
{
  "verbose": true
}
```

2. **Check Lighthouse report HTML:**
   - Opens in browser
   - Shows exactly what's failing
   - Provides specific fixes

3. **Run with debug mode:**
```bash
npx playwright test --debug
```

4. **Check server logs:**
   - Any errors when navigating?
   - Are endpoints returning errors?

5. **Test manually in browser:**
   - Can you load the page?
   - Are you logged in?
   - Do cookies work?

---

Still having issues? Check the main [README.md](./README.md) for more details.
