/**
 * Configuration types for lighthouse-automation package
 */

export interface LighthouseThresholds {
  performance?: number;
  accessibility?: number;
  'best-practices'?: number;
  seo?: number;
}

export interface Route {
  /**
   * Unique identifier for the route (used in report filenames)
   * @example "home-page", "dashboard", "pricing"
   */
  name: string;

  /**
   * URL path (appended to baseUrl)
   * @example "/home", "/dashboard", "/products"
   */
  path: string;

  /**
   * Whether this route requires authentication
   * If true, cookies from auth.json will be added to the browser context
   * @default false
   */
  authenticated?: boolean;

  /**
   * Optional per-route thresholds that override global thresholds
   */
  thresholds?: LighthouseThresholds;

  /**
   * Optional custom name for display in reports
   */
  displayName?: string;

  /**
   * Optional wait selector before running Lighthouse audit
   * Waits for this selector to be visible before starting the audit
   */
  waitFor?: string;
}

export interface LighthouseAutomationConfig {
  /**
   * Base URL for all routes
   * @example "https://example.com", "https://staging-app.com"
   */
  baseUrl: string;

  /**
   * Array of routes to audit
   */
  routes: Route[];

  /**
   * Global Lighthouse thresholds applied to all routes (unless overridden per-route)
   */
  globalThresholds?: LighthouseThresholds;

  /**
   * Directory where reports will be saved
   * @default "./lighthouse-reports"
   */
  reportDir?: string;

  /**
   * Path to authentication cookies file (JSON format)
   * @default "./auth.json"
   */
  authFile?: string;

  /**
   * Lighthouse desktop viewport width
   * @default 1280
   */
  viewportWidth?: number;

  /**
   * Lighthouse desktop viewport height
   * @default 720
   */
  viewportHeight?: number;

  /**
   * Timeout for each test in milliseconds
   * @default 180000 (3 minutes)
   */
  timeout?: number;

  /**
   * Enable verbose logging
   * @default false
   */
  verbose?: boolean;
}

/**
 * Cookie object format from Lighthouse DevTools Protocol
 */
export interface Cookie {
  domain: string;
  name: string;
  value: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None' | 'unspecified' | 'strict' | 'lax' | 'no_restriction';
  expirationDate?: number;
  session?: boolean;
  storeId?: string;
}

/**
 * Cookie file format (matches Playwright/DevTools export)
 */
export interface CookieFile {
  Cookies: Cookie[];
}

/**
 * Lighthouse audit result summary
 */
export interface AuditResult {
  routeName: string;
  url: string;
  scores: {
    performance: number;
    accessibility: number;
    'best-practices': number;
    seo: number;
  };
  thresholds: LighthouseThresholds;
  passed: boolean;
}

/**
 * Validate configuration structure
 */
export function validateConfig(config: any): config is LighthouseAutomationConfig {
  if (!config || typeof config !== 'object') {
    throw new Error('Config must be an object');
  }

  if (!config.baseUrl || typeof config.baseUrl !== 'string') {
    throw new Error('Config must have baseUrl (string)');
  }

  // Validate baseUrl format
  try {
    new URL(config.baseUrl);
  } catch {
    throw new Error(`Invalid baseUrl: "${config.baseUrl}" is not a valid URL. Expected format: https://example.com`);
  }

  if (!Array.isArray(config.routes) || config.routes.length === 0) {
    throw new Error('Config must have routes array with at least one route');
  }

  for (const route of config.routes) {
    if (!route.name || typeof route.name !== 'string') {
      throw new Error(`Route must have a name (string). Got: ${JSON.stringify(route)}`);
    }
    if (!route.path || typeof route.path !== 'string') {
      throw new Error(`Route must have a path (string). Got: ${JSON.stringify(route)}`);
    }
    // Validate path starts with /
    if (!route.path.startsWith('/')) {
      throw new Error(`Route path must start with "/". Got: "${route.path}". Did you mean "/${route.path}"?`);
    }
    // Validate thresholds if provided
    if (route.thresholds) {
      validateThresholds(route.thresholds, `route "${route.name}"`);
    }
  }

  // Validate global thresholds if provided
  if (config.globalThresholds) {
    validateThresholds(config.globalThresholds, 'globalThresholds');
  }

  return true;
}

/**
 * Validate threshold values
 */
function validateThresholds(thresholds: any, context: string): void {
  const validKeys = ['performance', 'accessibility', 'best-practices', 'seo'];

  for (const [key, value] of Object.entries(thresholds)) {
    if (!validKeys.includes(key)) {
      throw new Error(`Invalid threshold key "${key}" in ${context}. Valid keys are: ${validKeys.join(', ')}`);
    }
    if (typeof value !== 'number' || value < 0 || value > 100) {
      throw new Error(`Threshold "${key}" in ${context} must be a number between 0-100. Got: ${value}`);
    }
  }
}

/**
 * Get merged thresholds for a route (global + route-specific overrides)
 */
export function getRouteThresholds(
  globalThresholds: LighthouseThresholds = {},
  routeThresholds?: LighthouseThresholds
): LighthouseThresholds {
  return {
    performance: routeThresholds?.performance ?? globalThresholds.performance ?? 25,
    accessibility: routeThresholds?.accessibility ?? globalThresholds.accessibility ?? 50,
    'best-practices': routeThresholds?.['best-practices'] ?? globalThresholds['best-practices'] ?? 50,
    seo: routeThresholds?.seo ?? globalThresholds.seo ?? 50,
  };
}

/**
 * Normalize sameSite cookie attribute to Playwright format
 */
export function normalizeSameSite(sameSite?: string): 'Strict' | 'Lax' | 'None' {
  if (!sameSite) return 'Lax';

  const lower = sameSite.toLowerCase();
  if (lower === 'strict') return 'Strict';
  if (lower === 'lax') return 'Lax';
  if (lower === 'none' || lower === 'no_restriction') return 'None';

  return 'Lax'; // Default
}
