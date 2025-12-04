/**
 * Example Playwright configuration for using lighthouse-automation
 *
 * To use this package in your Playwright project:
 *
 * 1. Install the package:
 *    npm install --save-dev lighthouse-automation
 *
 * 2. Copy routes.config.example.json to your project root as routes.config.json
 *
 * 3. Replace your playwright.config.ts with this file (adjusted for your needs)
 *
 * 4. Run tests:
 *    npx playwright test
 */

import { createLighthouseSuite } from 'lighthouse-automation';

// Create all tests from configuration
createLighthouseSuite('./routes.config.json');

// Export minimal Playwright config
export default {};
