import { chromium, Cookie as PlaywrightCookie } from 'playwright';
import { playAudit } from 'playwright-lighthouse';
import * as getPort from 'get-port';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { Route, LighthouseThresholds, AuditResult, getRouteThresholds } from '../types/config';
import { CookieManager } from './cookie-manager';
import { Logger } from './logger';

/**
 * Configuration for Lighthouse runner
 */
export interface LighthouseRunnerOptions {
  baseUrl: string;
  route: Route;
  globalThresholds?: LighthouseThresholds;
  authFile?: string;
  reportDir?: string;
  viewportWidth?: number;
  viewportHeight?: number;
  verbose?: boolean;
}

/**
 * Core Lighthouse runner for executing audits
 */
export class LighthouseRunner {
  private logger: Logger;
  private options: LighthouseRunnerOptions;

  constructor(options: LighthouseRunnerOptions) {
    this.options = {
      viewportWidth: 1280,
      viewportHeight: 720,
      ...options,
    };
    this.logger = new Logger(options.verbose);
  }

  /**
   * Run Lighthouse audit for a route
   */
  async run(): Promise<AuditResult> {
    const { baseUrl, route, authFile, reportDir, viewportWidth, viewportHeight } = this.options;
    const port = await (getPort as any).default();
    const url = `${baseUrl}${route.path}`;

    this.logger.debug(`Starting audit for route: ${route.name}`);
    this.logger.debug(`URL: ${url}`);
    this.logger.debug(`Port: ${port}`);

    // Validate URL is accessible
    let isUrlValid = true;
    try {
      new URL(url);
    } catch {
      isUrlValid = false;
      throw new Error(`Invalid URL constructed: ${url}. Check baseUrl and route.path in config.`);
    }

    try {
      // Create persistent context directory
      const userDataDir = path.join(os.tmpdir(), 'lh-audit', `route-${route.name}-${Math.random()}`);
      if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
      }

      // Launch browser
      const context = await chromium.launchPersistentContext(userDataDir, {
        viewport: { width: viewportWidth || 1280, height: viewportHeight || 720 },
        args: [`--remote-debugging-port=${port}`],
      });

      try {
        // Add authentication cookies if route requires auth
        if (route.authenticated) {
          if (!authFile) {
            throw new Error(
              `Route "${route.name}" requires authentication but no authFile is configured. ` +
              `Add "authFile" to routes.config.json pointing to your auth.json file.`
            );
          }

          this.logger.debug(`Loading cookies from ${authFile}`);
          let cookieManager: CookieManager;
          try {
            cookieManager = CookieManager.load(authFile);
          } catch (error) {
            throw new Error(
              `Failed to load authentication cookies for "${route.name}": ${error}\n` +
              `Make sure:\n` +
              `  1. Auth file exists at: ${path.resolve(authFile)}\n` +
              `  2. Auth file is valid JSON\n` +
              `  3. Auth file has a "Cookies" array\n` +
              `  4. Cookies are not expired`
            );
          }

          if (cookieManager.isEmpty()) {
            throw new Error(
              `Auth file at ${authFile} has no cookies. ` +
              `Export cookies from DevTools (DevTools → Application → Cookies → Right-click → Export)`
            );
          }

          const rawCookies = cookieManager.asPlaywrightCookies();
          // Convert to Playwright-compatible format
          const playwrightCookies = rawCookies.map(cookie => ({
            name: cookie.name,
            value: cookie.value,
            domain: cookie.domain || '',
            path: cookie.path || '/',
            secure: cookie.secure,
            httpOnly: cookie.httpOnly,
            sameSite: cookie.sameSite as 'Strict' | 'Lax' | 'None' | undefined,
            expires: cookie.expirationDate,
          })) as PlaywrightCookie[];
          await context.addCookies(playwrightCookies);
          this.logger.debug(`Added ${playwrightCookies.length} cookies for route "${route.name}"`);
        }

        // Create page and navigate
        const page = await context.newPage();

        this.logger.debug(`Navigating to ${url}`);
        try {
          const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

          if (!response) {
            throw new Error(
              `Navigation to ${url} failed or was cancelled. ` +
              `Check if the URL is correct and the server is reachable.`
            );
          }

          const status = response.status();
          if (status >= 400) {
            throw new Error(
              `Navigation failed with HTTP ${status}. ` +
              `The route may not exist or the server returned an error. ` +
              `URL: ${url}`
            );
          }
        } catch (navError) {
          throw new Error(
            `Failed to navigate to ${url}: ${navError}\n` +
            `Troubleshooting:\n` +
            `  1. Check if baseUrl is correct: ${this.options.baseUrl}\n` +
            `  2. Check if route path is correct: ${route.path}\n` +
            `  3. Check if the server is running and accessible\n` +
            `  4. Check your network connection`
          );
        }

        // Wait for selector if specified
        if (route.waitFor) {
          this.logger.debug(`Waiting for selector: ${route.waitFor}`);
          try {
            await page.waitForSelector(route.waitFor, { timeout: 10000 });
          } catch (selectorError) {
            throw new Error(
              `Selector "${route.waitFor}" not found on page after 10 seconds. ` +
              `Check if the selector is correct and the page is fully loaded. ` +
              `URL: ${url}`
            );
          }
        }

        // Calculate thresholds
        const thresholds = getRouteThresholds(this.options.globalThresholds, route.thresholds);

        // Run Lighthouse audit
        this.logger.debug(`Running Lighthouse audit with thresholds: ${JSON.stringify(thresholds)}`);

        let lighthouseReport: any;

        try {
          // Pass thresholds of 0 to playAudit so it doesn't enforce checks
          // We'll check thresholds manually after getting the report
          const zeroThresholds: LighthouseThresholds = {
            performance: 0,
            accessibility: 0,
            'best-practices': 0,
            seo: 0,
          };

          this.logger.debug(`Running audit on port ${port}...`);
          lighthouseReport = await playAudit({
            page,
            port,
            // Pass zero thresholds so playAudit won't throw (it will pass any score >= 0)
            thresholds: zeroThresholds,
            opts: {
              formFactor: 'desktop',
              screenEmulation: {
                mobile: false,
                width: viewportWidth,
                height: viewportHeight,
                deviceScaleFactor: 1,
                disabled: false,
              },
              // Only audit these categories (PWA was removed from Lighthouse)
              onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
            },
            reports: {
              formats: {
                html: true,
                json: false,
              },
              directory: reportDir || './lighthouse-reports',
              name: `${route.name}-${new Date().toISOString().split('T')[0]}`,
            },
          });

          if (!lighthouseReport) {
            throw new Error('playAudit returned empty report');
          }
        } catch (error) {
          throw new Error(
            `Lighthouse audit failed for route "${route.name}": ${error}\n` +
            `Troubleshooting:\n` +
            `  1. Make sure the page is fully loaded and stable\n` +
            `  2. Check if the page uses modern web standards\n` +
            `  3. Check network requests are completing\n` +
            `  4. Try increasing timeouts if the page is slow\n` +
            `  5. Check Lighthouse is not blocked by CSP or other security headers`
          );
        }

        // Extract scores from report
        // playAudit returns an object with { lhr, artifacts, report }
        // The actual Lighthouse report is in the 'lhr' property
        let lhr = (lighthouseReport as any).lhr || lighthouseReport;
        let categories = (lhr as any).categories;

        if (!categories) {
          throw new Error(
            `Failed to extract Lighthouse categories from report for route "${route.name}". ` +
            `The Lighthouse report structure may be invalid.`
          );
        }

        let scores: any;
        try {
          scores = {
            performance: categories.performance?.score,
            accessibility: categories.accessibility?.score,
            'best-practices': categories['best-practices']?.score,
            seo: categories.seo?.score,
          };

          // Validate scores were extracted
          const missingScores = Object.entries(scores)
            .filter(([_, value]) => value === undefined)
            .map(([key]) => key);

          if (missingScores.length > 0) {
            throw new Error(`Missing scores for: ${missingScores.join(', ')}`);
          }

          // Normalize scores to 0-1 range (Lighthouse returns 0-100)
          if (scores.performance > 1) {
            // Scores are already 0-100, convert to 0-1
            scores = {
              performance: scores.performance / 100,
              accessibility: scores.accessibility / 100,
              'best-practices': scores['best-practices'] / 100,
              seo: scores.seo / 100,
            };
          }
        } catch (scoreError) {
          throw new Error(
            `Failed to extract audit scores for route "${route.name}": ${scoreError}`
          );
        }

        // Check if audit passed thresholds
        const passed =
          scores.performance >= (thresholds.performance ?? 0) / 100 &&
          scores.accessibility >= (thresholds.accessibility ?? 0) / 100 &&
          scores['best-practices'] >= (thresholds['best-practices'] ?? 0) / 100 &&
          scores.seo >= (thresholds.seo ?? 0) / 100;

        this.logger.debug(`Audit complete. Passed: ${passed}`);

        const result: AuditResult = {
          routeName: route.name,
          url,
          scores,
          thresholds,
          passed,
        };

        await context.close();
        return result;
      } catch (error) {
        await context.close();
        throw error;
      }
    } catch (error) {
      this.logger.error(`Audit failed for route ${route.name}: ${error}`);
      throw new Error(`Lighthouse audit failed for ${route.name}: ${error}`);
    }
  }

  /**
   * Run multiple audits in parallel
   */
  static async runBatch(
    routes: Route[],
    options: Omit<LighthouseRunnerOptions, 'route'>
  ): Promise<AuditResult[]> {
    const results = await Promise.all(
      routes.map(route => {
        const runner = new LighthouseRunner({ ...options, route });
        return runner.run();
      })
    );

    return results;
  }
}
