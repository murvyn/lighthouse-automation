# @company/lighthouse-automation - Complete Index

Welcome! This is your automated Lighthouse testing npm package. Here's a guide to all the files and where to start.

## 🚀 Getting Started

### For First-Time Users
1. **Read**: [README.md](./README.md) - Complete guide with examples
2. **Setup**: Copy [examples/routes.config.example.json](./examples/routes.config.example.json) to your project
3. **Configure**: Update with your URLs
4. **Run**: `npm test`

### For Publishers
1. **Read**: [QUICK_START_PUBLISH.md](./QUICK_START_PUBLISH.md) - 3-step publishing guide
2. **Details**: [DEPLOYMENT.md](./DEPLOYMENT.md) - Full publishing instructions
3. **Execute**: `npm login` then `npm publish --access=public`

### For Package Developers
1. **Overview**: [PACKAGE_SUMMARY.md](./PACKAGE_SUMMARY.md) - What's in the package
2. **Build**: `npm run build`
3. **Develop**: `npm run dev` (watch mode)
4. **Source**: See [src/](./src/) directory

---

## 📁 File Structure

### 📄 Documentation Files

| File | Purpose | Size | Read Time |
|------|---------|------|-----------|
| [README.md](./README.md) | Complete usage guide, API reference, examples | 67 KB | 15 min |
| [CHANGELOG.md](./CHANGELOG.md) | Version history, features, roadmap | 8 KB | 5 min |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Publishing, CI/CD, private registry setup | 6 KB | 5 min |
| [QUICK_START_PUBLISH.md](./QUICK_START_PUBLISH.md) | 3-step publishing checklist | 2 KB | 2 min |
| [PACKAGE_SUMMARY.md](./PACKAGE_SUMMARY.md) | Package overview, statistics, architecture | 8 KB | 5 min |
| [INDEX.md](./INDEX.md) | This file - navigation guide | 4 KB | 5 min |

### 📦 Package Files

| File | Purpose |
|------|---------|
| [package.json](./package.json) | npm package metadata |
| [tsconfig.json](./tsconfig.json) | TypeScript configuration |
| [LICENSE](./LICENSE) | MIT License |
| [.gitignore](./.gitignore) | Git ignore rules |

### 💻 Source Code

| File | Purpose | Lines |
|------|---------|-------|
| [src/index.ts](./src/index.ts) | Main exports | 12 |
| [src/types/config.ts](./src/types/config.ts) | TypeScript types & validation | 180 |
| [src/utils/cookie-manager.ts](./src/utils/cookie-manager.ts) | Auth cookie handling | 80 |
| [src/utils/lighthouse-runner.ts](./src/utils/lighthouse-runner.ts) | Lighthouse audit engine | 170 |
| [src/utils/logger.ts](./src/utils/logger.ts) | Console formatting | 200 |
| [src/utils/report-generator.ts](./src/utils/report-generator.ts) | Report generation | 250 |
| [src/fixtures/lighthouse-fixture.ts](./src/fixtures/lighthouse-fixture.ts) | Playwright test generator | 70 |

### 📋 Examples

| File | Purpose |
|------|---------|
| [examples/routes.config.example.json](./examples/routes.config.example.json) | Example route configuration |
| [examples/playwright.config.example.ts](./examples/playwright.config.example.ts) | Example Playwright setup |

### 📦 Build Output

```
dist/                           # Compiled JavaScript
├── index.js                    # Main entry point
├── types/
├── utils/
└── fixtures/
```

---

## 🎯 Quick Reference

### For Different User Types

#### 👤 QA Team Member
**Goal**: Run Lighthouse tests for your website
1. Install: `npm install --save-dev @company/lighthouse-automation`
2. Read: [README.md](./README.md) - Quick Start section
3. Copy: [examples/routes.config.example.json](./examples/routes.config.example.json)
4. Follow: Setup instructions in README
5. Run: `npx playwright test`

#### 🏗️ DevOps/Platform Engineer
**Goal**: Set up automation in CI/CD
1. Read: [DEPLOYMENT.md](./DEPLOYMENT.md) - CI/CD Integration section
2. Reference: [CHANGELOG.md](./CHANGELOG.md) - Features list
3. Configure: Your CI/CD pipeline
4. Test: Locally first with [examples/](./examples/)

#### 📦 Package Maintainer
**Goal**: Update and maintain the package
1. Review: [PACKAGE_SUMMARY.md](./PACKAGE_SUMMARY.md)
2. Code: Located in [src/](./src/) directory
3. Build: `npm run build`
4. Update: [CHANGELOG.md](./CHANGELOG.md) with changes
5. Publish: Follow [QUICK_START_PUBLISH.md](./QUICK_START_PUBLISH.md)

#### 🔧 Developer (Contributing)
**Goal**: Extend or modify the package
1. Setup: `npm install` in package directory
2. Develop: `npm run dev` (watch mode)
3. Code: In [src/](./src/) directory
4. Build: `npm run build`
5. Test: With your own configurations
6. Contribute: Submit PR with changelog updates

---

## 📚 Reading Guide

### By Topic

**Configuration & Setup**
- [README.md](./README.md#quick-start) - Quick start
- [examples/routes.config.example.json](./examples/routes.config.example.json) - Config example
- [examples/playwright.config.example.ts](./examples/playwright.config.example.ts) - Playwright example

**Usage & Examples**
- [README.md](./README.md#usage-examples) - Usage examples section
- [README.md](./README.md#troubleshooting) - Troubleshooting guide
- [README.md](./README.md#best-practices) - Best practices

**API Reference**
- [README.md](./README.md#api-reference) - All available APIs
- [src/types/config.ts](./src/types/config.ts) - Type definitions

**Publishing & Deployment**
- [QUICK_START_PUBLISH.md](./QUICK_START_PUBLISH.md) - Quick 3-step guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment guide
- [DEPLOYMENT.md](./DEPLOYMENT.md#github-actions) - GitHub Actions CI/CD

**Package Information**
- [PACKAGE_SUMMARY.md](./PACKAGE_SUMMARY.md) - Overview
- [CHANGELOG.md](./CHANGELOG.md) - Version history
- [package.json](./package.json) - Dependencies

---

## 🔗 External Resources

- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Playwright Documentation](https://playwright.dev/)
- [npm Documentation](https://docs.npmjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

## 💡 Common Tasks

### Publish the Package
```bash
npm login
cd /path/to/lighthouse-automation
npm publish --access=public
```
**Read**: [QUICK_START_PUBLISH.md](./QUICK_START_PUBLISH.md)

### Use the Package in Your Project
```bash
npm install --save-dev @company/lighthouse-automation
cp node_modules/@company/lighthouse-automation/examples/routes.config.example.json ./routes.config.json
# Edit routes.config.json with your URLs
npx playwright test
```
**Read**: [README.md](./README.md#quick-start)

### Update the Package
```bash
# Make changes in src/
npm run build
npm version patch  # or minor/major
npm publish
# Update CHANGELOG.md!
```
**Read**: [DEPLOYMENT.md](./DEPLOYMENT.md#updating-package)

### Set Up CI/CD Pipeline
1. Read: [DEPLOYMENT.md](./DEPLOYMENT.md#cicd-integration)
2. Copy: GitHub Actions workflow example
3. Customize: For your repository
4. Commit: Workflow file to repo

---

## 📊 Package Statistics

- **Version**: 1.0.0
- **TypeScript Files**: 7
- **Lines of Code**: ~1,000
- **Documentation**: ~20 KB
- **Dependencies**: 25 (3 direct, 22 transitive)
- **Supported Node**: >=14.0.0
- **License**: MIT

---

## ✅ Verification Checklist

Before publishing or using, verify:

- [ ] Read [README.md](./README.md)
- [ ] Reviewed [examples/](./examples/) directory
- [ ] Updated [package.json](./package.json) author field (if needed)
- [ ] Checked [CHANGELOG.md](./CHANGELOG.md) for features
- [ ] Tested locally with example config
- [ ] Reviewed [DEPLOYMENT.md](./DEPLOYMENT.md)
- [ ] Ready to publish or integrate

---

## 🆘 Need Help?

1. **Getting Started**: Read [README.md](./README.md)
2. **Troubleshooting**: See [README.md](./README.md#troubleshooting)
3. **Publishing**: See [QUICK_START_PUBLISH.md](./QUICK_START_PUBLISH.md)
4. **Configuration**: Check [examples/routes.config.example.json](./examples/routes.config.example.json)
5. **API Usage**: Review [README.md](./README.md#api-reference)

---

## 🎯 Next Steps

Choose your path:

1. **🚀 Publish to npm**: [QUICK_START_PUBLISH.md](./QUICK_START_PUBLISH.md)
2. **📖 Learn to Use**: [README.md](./README.md)
3. **💻 Develop/Extend**: [src/](./src/) + [DEPLOYMENT.md](./DEPLOYMENT.md)
4. **📊 Deploy to CI/CD**: [DEPLOYMENT.md](./DEPLOYMENT.md#cicd-integration)

---

**Package**: @company/lighthouse-automation v1.0.0
**Status**: ✅ Production Ready
**Last Updated**: December 3, 2025

---

Made with ❤️ for automated Lighthouse testing
