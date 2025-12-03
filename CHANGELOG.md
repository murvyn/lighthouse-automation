# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-03

### Added

#### Core Features
- ✨ **Config-driven test generation**: Define routes in JSON, automatically generate Lighthouse tests
- 🚀 **One test per route**: Each URL becomes an independent Playwright test
- 🔐 **Mixed authentication support**: Mix authenticated and public routes in one suite
- 📊 **Multiple report formats**: Generate HTML (visual) and JSON (programmatic) reports
- 🎯 **Flexible thresholds**: Global defaults with per-route overrides
- ⚡ **Parallel execution**: Run multiple audits in parallel via Playwright
- 🖥️ **Desktop audits**: Optimized for desktop performance testing (1280x720)

#### Components
- `CookieManager`: Load, normalize, and manage authentication cookies
- `Logger`: Formatted console output with color-coded results
- `ReportGenerator`: Generate HTML and JSON reports
- `LighthouseRunner`: Core audit execution engine
- `createLighthouseSuite`: Main API for creating test suite from config

#### Configuration
- Comprehensive TypeScript configuration types
- Support for per-route custom thresholds
- Optional wait-for selectors before audits
- Customizable viewport dimensions
- Configurable report output directory
- Authentication file path configuration

#### Documentation
- Complete README with quick start guide
- Detailed configuration format documentation
- Usage examples (public sites, auth apps, custom thresholds)
- API reference for all utilities
- Troubleshooting guide
- CI/CD integration examples (GitHub Actions)
- Best practices guide

#### Examples
- `routes.config.example.json`: Example configuration with various route types
- `playwright.config.example.ts`: Example Playwright setup

### Features

- **Configuration-driven**: No code changes needed - just update JSON config
- **DevTools cookie export**: Direct compatibility with Chrome DevTools cookie export
- **Automatic test generation**: Creates one test per route from config
- **Color-coded console output**: Easy-to-scan results with visual indicators
- **Beautiful HTML reports**: Professional-looking visual reports
- **Machine-readable JSON**: Easy to parse and integrate with other tools
- **Error handling**: Clear error messages and debug logging
- **TypeScript support**: Full type safety throughout the package

### Dependencies

- `playwright` (peer dependency): ^1.40.0
- `playwright-lighthouse`: ^4.0.0
- `get-port`: ^5.1.1
- `@types/node`: ^20.0.0
- `typescript`: ^5.0.0

---

## Future Roadmap

### Planned for v1.1.0
- [ ] Mobile form factor support
- [ ] Emulation presets (mobile devices)
- [ ] Multiple browser support (Chrome, Edge, Firefox)
- [ ] Custom Lighthouse configurations
- [ ] Budget (performance budget) support
- [ ] Trend analysis across runs

### Planned for v2.0.0
- [ ] Database integration (PostgreSQL, MongoDB)
- [ ] Web dashboard for results
- [ ] Slack/Email notifications
- [ ] Scheduled automated runs
- [ ] Historical comparison reports
- [ ] Performance regression detection
- [ ] Custom metric assertions
- [ ] Multi-project support

---

## Notes

### Breaking Changes

None - this is the initial release.

### Migration Guide

N/A

### Known Issues

None known at this time. Please report issues at:
https://github.com/your-company/lighthouse-automation/issues

---

## Contributors

- Your Company QA Team

## Support

For questions and support, please open an issue on GitHub:
https://github.com/your-company/lighthouse-automation/issues
