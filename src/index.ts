/**
 * lighthouse-automation
 * Automated Lighthouse performance testing for Playwright projects
 */

// Export types
export * from './types/config';

// Export utilities
export { CookieManager } from './utils/cookie-manager';
export { Logger } from './utils/logger';
export { LighthouseRunner, type LighthouseRunnerOptions } from './utils/lighthouse-runner';

// Export fixture and main API
export { createLighthouseSuite, default } from './fixtures/lighthouse-fixture';
