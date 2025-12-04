# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is `lighthouse-automation`, a TypeScript package that automates Google Lighthouse performance testing for Playwright projects. The package allows developers to define routes in a JSON config file and automatically generates Playwright tests that run Lighthouse audits on each route, producing HTML reports with pass/fail results based on configurable thresholds.

## Development Commands

### Build and Development
```bash
# Build TypeScript to dist/
npm run build

# Watch mode for development
npm run dev

# Run tests (Playwright tests)
npm test

# Prepare for publishing
npm run prepublishOnly
```

### Testing the Package
Since this is a package meant to be consumed by other projects, test it by:
1. Building: `npm run build`
2. Creating a test project that uses the built package
3. Running Playwright tests in that project

## Architecture Overview

### Entry Point Flow
1. **Consumer project** imports `createLighthouseSuite()` from `src/index.ts`
2. **Config loading** happens in `src/fixtures/lighthouse-fixture.ts::loadConfig()`
3. **Test generation** - one Playwright test is created per route in the config
4. **Test execution** - each test uses `LighthouseRunner` to run the audit

### Core Components

**`src/fixtures/lighthouse-fixture.ts`** - Main API
- `createLighthouseSuite(configPath, testInstance?)` - Generates Playwright tests from config
- `loadConfig()` - Loads and validates routes.config.json
- Creates one test per route, each using `LighthouseRunner`

**`src/utils/lighthouse-runner.ts`** - Audit Execution
- `LighthouseRunner` class - Core logic for running Lighthouse on a route
- Launches Chromium with persistent context for CDP connection
- Applies authentication cookies if `route.authenticated === true`
- Runs `playAudit()` from `playwright-lighthouse` with zero thresholds (to prevent early failures)
- Extracts scores manually and compares against configured thresholds
- Returns `AuditResult` with pass/fail status

**`src/utils/cookie-manager.ts`** - Cookie Handling
- `CookieManager` class - Loads and manages authentication cookies from auth.json
- Converts cookie formats between DevTools export format and Playwright format
- Filters cookies by domain for authenticated routes

**`src/utils/logger.ts`** - Output Formatting
- `Logger` class - Pretty-prints audit results to console
- Formats scores as tables with pass/fail indicators
- Handles verbose logging when enabled

**`src/types/config.ts`** - Type Definitions and Validation
- TypeScript interfaces for all config structures
- `validateConfig()` - Comprehensive validation with helpful error messages
- `getRouteThresholds()` - Merges global and per-route thresholds

### Key Design Patterns

**Zero-Threshold Pattern**: The runner passes zero thresholds to `playAudit()` to prevent it from throwing errors, then manually checks scores against configured thresholds. This gives better error messages and control over pass/fail logic.

**Test Instance Injection**: `createLighthouseSuite()` accepts optional `testInstance` parameter to avoid Playwright version conflicts when the consumer project uses a different Playwright version than this package.

**Persistent Context**: Uses `chromium.launchPersistentContext()` instead of regular browser launch to enable Chrome DevTools Protocol connection required by Lighthouse.

**Port Discovery**: Uses `get-port` package to find available ports for CDP connections, avoiding conflicts when running tests in parallel.

## Configuration Structure

### Routes Config (`routes.config.json`)
- **Required**: `baseUrl` (full URL with protocol), `routes` array
- **Optional**: `globalThresholds`, `reportDir`, `authFile`, viewport settings, `timeout`, `verbose`
- **Route object**: `name` (for filenames), `path` (must start with /), `authenticated`, optional `thresholds`, `displayName`, `waitFor` selector

### Auth Cookies (`auth.json`)
- DevTools export format: `{ "Cookies": [ {...}, {...} ] }`
- Each cookie needs: `domain`, `name`, `value`
- Optional: `path`, `secure`, `httpOnly`, `sameSite`, `expirationDate`

## File Structure

```
src/
├── index.ts                      # Package exports
├── fixtures/
│   └── lighthouse-fixture.ts     # Main API, test generation
├── types/
│   └── config.ts                 # Types, validation, helpers
└── utils/
    ├── cookie-manager.ts         # Cookie loading/conversion
    ├── lighthouse-runner.ts      # Lighthouse audit execution
    └── logger.ts                 # Console output formatting

dist/                             # Compiled JavaScript (generated)
examples/                         # Example configs for users
```

## Common Issues and Troubleshooting

### Port Conflicts
If ports 9000-9100 are in use, `get-port` will find the next available port automatically. The runner creates one port per test execution.

### Cookie Domain Matching
Cookies must have a domain that matches the `baseUrl`. Use `.example.com` format (with leading dot) for wildcard subdomain matching. See `CookieManager.asPlaywrightCookies()` for conversion logic.

### Lighthouse Scores Format
Lighthouse can return scores as 0-1 or 0-100 depending on version. The runner normalizes to 0-1 by checking if scores are > 1 (src/utils/lighthouse-runner.ts:263-271).

### Test Timeout
Default timeout is 180000ms (3 minutes). Lighthouse audits are CPU-intensive. If tests timeout, increase `timeout` in routes.config.json or reduce parallel workers in Playwright config.

### Authentication Failures
If authenticated routes fail with 401/403:
1. Check `auth.json` exists at configured `authFile` path
2. Verify cookie domains match the navigation URL
3. Ensure cookies haven't expired (check `expirationDate`)
4. Enable `verbose: true` to see cookie loading logs

## Testing and Validation

When modifying validation logic in `src/types/config.ts`:
- Add clear error messages that guide users to fix the issue
- Include "Did you mean...?" suggestions when applicable
- Show the exact value that failed validation
- Point to docs or examples when relevant

When modifying the audit logic in `src/utils/lighthouse-runner.ts`:
- Preserve error context through try/catch chains
- Add "Troubleshooting:" sections to errors with numbered steps
- Log debug info when `verbose: true`
- Always close browser contexts in finally blocks

## Publishing Workflow

1. Update version in `package.json`
2. Update `CHANGELOG.md` with changes
3. Run `npm run build` to compile TypeScript
4. Run tests to verify package works
5. Run `npm publish` (prepublishOnly hook runs build automatically)

Package publishes these files only: `dist/`, `README.md`, `LICENSE` (see `files` field in package.json)

## Important Constraints

- **Peer dependencies**: Package requires `@playwright/test` and `playwright` ^1.40.0 as peer deps
- **Node.js**: Minimum version is Node 16+ (uses ES2020 features)
- **TypeScript**: Target ES2020, CommonJS modules (for Node compatibility)
- **Lighthouse categories**: Only audits `performance`, `accessibility`, `best-practices`, `seo` (PWA was removed from modern Lighthouse)
- **Desktop only**: Currently hardcoded to desktop viewport (1280x720 default). Mobile testing not implemented.

## Code Patterns to Follow

1. **Error messages**: Always include context, troubleshooting steps, and what the user should do next
2. **Validation**: Validate early (at config load time) with specific error messages
3. **Logging**: Use `Logger` class with debug/info/warn/error levels, respect `verbose` flag
4. **Types**: Export all public types from `src/index.ts` for consumers
5. **Defaults**: Set sensible defaults in `loadConfig()` (line 51-56 of lighthouse-fixture.ts)
