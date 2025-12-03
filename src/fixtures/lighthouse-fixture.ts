import * as fs from 'fs';
import * as path from 'path';
import { LighthouseAutomationConfig, validateConfig } from '../types/config';
import { LighthouseRunner } from '../utils/lighthouse-runner';
import { Logger } from '../utils/logger';

/**
 * Load configuration from file
 */
function loadConfig(configPath: string): LighthouseAutomationConfig {
  const absolutePath = path.resolve(configPath);

  // Check if config file exists
  if (!fs.existsSync(absolutePath)) {
    throw new Error(
      `Config file not found: ${absolutePath}\n` +
      `Create a routes.config.json file in your project root with the following structure:\n` +
      `{\n` +
      `  "baseUrl": "https://example.com",\n` +
      `  "routes": [\n` +
      `    { "name": "home", "path": "/", "authenticated": false }\n` +
      `  ]\n` +
      `}`
    );
  }

  // Load and parse config
  let config: any;
  try {
    const configContent = fs.readFileSync(absolutePath, 'utf-8');
    config = JSON.parse(configContent);
  } catch (error) {
    throw new Error(
      `Failed to parse config file at ${absolutePath}: ${error}\n` +
      `Make sure the file is valid JSON.`
    );
  }

  // Validate config
  try {
    if (!validateConfig(config)) {
      throw new Error('Invalid configuration');
    }
  } catch (validationError) {
    throw new Error(
      `Configuration validation failed:\n${validationError}`
    );
  }

  // Set defaults
  config.reportDir ??= './lighthouse-reports';
  config.authFile ??= './auth.json';
  config.viewportWidth ??= 1280;
  config.viewportHeight ??= 720;
  config.timeout ??= 180000;
  config.verbose ??= false;

  return config;
}

/**
 * Create Lighthouse tests from configuration
 *
 * @param configPath - Path to routes.config.json
 * @param testInstance - Optional: Pass your project's test instance to avoid version conflicts.
 *                       If not provided, will use require('@playwright/test')
 */
export function createLighthouseSuite(configPath: string, testInstance?: any) {
  // Use provided test instance or require from @playwright/test
  // This allows users to pass their own test instance to avoid duplicate version conflicts
  const base = testInstance || require('@playwright/test').test;

  const config = loadConfig(configPath);
  const logger = new Logger(config.verbose);

  if (config.verbose) {
    logger.info(`Loaded config from ${configPath}`);
    logger.info(`Base URL: ${config.baseUrl}`);
    logger.info(`Routes: ${config.routes.length}`);
  }

  // Create test for each route
  for (const route of config.routes) {
    base(`${route.displayName || route.name} - Lighthouse audit`, async () => {
      // Timeout is set in test options below

      const runner = new LighthouseRunner({
        baseUrl: config.baseUrl,
        route,
        globalThresholds: config.globalThresholds,
        authFile: config.authFile,
        reportDir: config.reportDir,
        viewportWidth: config.viewportWidth,
        viewportHeight: config.viewportHeight,
        verbose: config.verbose,
      });

      try {
        const result = await runner.run();

        // Log result
        logger.printRouteResult(result);

        // Fail test if audit didn't pass
        if (!result.passed) {
          const performancePct = Math.round(result.scores.performance * 100);
          const accessibilityPct = Math.round(result.scores.accessibility * 100);
          const bestPracticesPct = Math.round(result.scores['best-practices'] * 100);
          const seoPct = Math.round(result.scores.seo * 100);

          throw new Error(
            `Lighthouse audit failed thresholds for route "${route.name}":\n` +
            `  Performance: ${performancePct}/100 (threshold: ${result.thresholds.performance}/100)\n` +
            `  Accessibility: ${accessibilityPct}/100 (threshold: ${result.thresholds.accessibility}/100)\n` +
            `  Best Practices: ${bestPracticesPct}/100 (threshold: ${result.thresholds['best-practices']}/100)\n` +
            `  SEO: ${seoPct}/100 (threshold: ${result.thresholds.seo}/100)\n\n` +
            `To fix this, either:\n` +
            `  1. Improve the page's performance (consider your thresholds reasonable)\n` +
            `  2. Lower the thresholds in routes.config.json for this route\n` +
            `  3. Check for external services or ads affecting scores`
          );
        }
      } catch (error) {
        logger.error(`Test failed for route "${route.name}"`);
        // Re-throw with additional context if not already an error
        if (error instanceof Error) {
          throw error;
        } else {
          throw new Error(`Test failed for route "${route.name}": ${error}`);
        }
      }
    });
  }
}

/**
 * Playwright fixture-style API
 * Usage in playwright.config.ts:
 * ```
 * import { createLighthouseSuite } from '@company/lighthouse-automation';
 * createLighthouseSuite('./routes.config.json');
 * export default {};
 * ```
 */
export default createLighthouseSuite;
