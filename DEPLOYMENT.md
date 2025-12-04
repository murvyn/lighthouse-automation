# Deployment & Publishing Guide

## Pre-Publishing Checklist

Before publishing to npm, ensure:

- [ ] All tests pass: `npm test`
- [ ] Package builds successfully: `npm run build`
- [ ] README is comprehensive and accurate
- [ ] CHANGELOG is updated with all changes
- [ ] LICENSE file is included
- [ ] Version number is bumped in package.json (semver)
- [ ] All example files are present and working
- [ ] Git repository is set up and committed

## Publishing to npm

### 1. Prepare Account

```bash
npm login
# Enter username, password, and OTP if enabled
```

### 2. Verify Package

```bash
# Check what will be published
npm pack

# Verify the tarball contents
tar -tzf company-lighthouse-automation-1.0.0.tgz | head -20
```

### 3. Update Version

```bash
npm version patch   # For bug fixes (1.0.1)
npm version minor   # For new features (1.1.0)
npm version major   # For breaking changes (2.0.0)
```

This automatically:
- Updates package.json version
- Updates package-lock.json
- Creates a git tag

### 4. Publish to npm

```bash
npm publish --access=public
# or for private registry
npm publish --registry=https://your-private-registry.com
```

### 5. Verify Publication

```bash
npm info lighthouse-automation
# or visit https://www.npmjs.com/package/lighthouse-automation
```

## Private npm Registry (Optional)

If publishing to a private registry (GitHub Packages, Verdaccio, etc.):

### GitHub Packages

1. Update package.json:
```json
{
  "name": "@your-org/lighthouse-automation",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

2. Create `.npmrc`:
```
@your-org:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

3. Publish:
```bash
npm publish
```

### Verdaccio (Self-Hosted)

1. Configure registry in `.npmrc`:
```
registry=http://localhost:4873
```

2. Publish:
```bash
npm publish
```

## Installation After Publishing

Users can then install with:

```bash
npm install --save-dev lighthouse-automation
```

## Updating Package

### Patch Release (Bug Fix)
```bash
# 1. Fix the bug
# 2. Update CHANGELOG.md
npm version patch
npm publish
```

### Minor Release (New Feature)
```bash
# 1. Add new feature
# 2. Update CHANGELOG.md
npm version minor
npm publish
```

### Major Release (Breaking Changes)
```bash
# 1. Make breaking changes
# 2. Update CHANGELOG.md
# 3. Update documentation
npm version major
npm publish
```

## Documentation After Publishing

After publishing, update:

1. **GitHub Repository**
   - README should reference npm installation
   - Add installation badge if desired
   - Link to npm page

2. **Internal Wiki/Docs**
   - Installation instructions
   - Migration guide if upgrading major versions
   - Troubleshooting guide

3. **Team Communication**
   - Announce new version to team
   - Provide upgrade path for existing users
   - Highlight breaking changes if any

## NPM Scripts

```bash
npm run build       # Compile TypeScript
npm run dev         # Watch mode for development
npm test            # Run tests
```

## Version History

### 1.0.0 (Initial Release)
- Config-driven Lighthouse test generation
- Support for authenticated and public routes
- HTML and JSON report generation
- Desktop-only audits
- Full TypeScript support

See CHANGELOG.md for detailed history.

## Support

For issues or questions about publishing, see the main README.md
