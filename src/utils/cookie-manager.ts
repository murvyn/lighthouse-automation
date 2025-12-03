import * as fs from 'fs';
import * as path from 'path';
import { Cookie, CookieFile, normalizeSameSite } from '../types/config';

/**
 * Cookie manager for handling authentication cookies
 */
export class CookieManager {
  private cookies: Cookie[] = [];

  /**
   * Load cookies from JSON file
   */
  static load(authFilePath: string): CookieManager {
    const manager = new CookieManager();
    manager.loadFromFile(authFilePath);
    return manager;
  }

  /**
   * Load cookies from file
   */
  private loadFromFile(authFilePath: string): void {
    try {
      const absolutePath = path.resolve(authFilePath);

      if (!fs.existsSync(absolutePath)) {
        throw new Error(`Auth file not found: ${absolutePath}`);
      }

      const fileContent = fs.readFileSync(absolutePath, 'utf-8');
      const cookieData: CookieFile = JSON.parse(fileContent);

      if (!Array.isArray(cookieData.Cookies)) {
        throw new Error('Auth file must have Cookies array');
      }

      this.cookies = cookieData.Cookies;
    } catch (error) {
      throw new Error(`Failed to load cookies from ${authFilePath}: ${error}`);
    }
  }

  /**
   * Normalize all cookies to Playwright-compatible format
   */
  getNormalized(): Cookie[] {
    return this.cookies.map(cookie => ({
      ...cookie,
      sameSite: normalizeSameSite(cookie.sameSite as string),
    }));
  }

  /**
   * Get cookies filtered by domain
   */
  getByDomain(domain: string): Cookie[] {
    return this.getNormalized().filter(cookie => {
      const cookieDomain = cookie.domain || '';
      // Match both exact domain and wildcard domains (e.g., .example.com matches example.com)
      return cookieDomain === domain || cookieDomain === `.${domain}` || domain.endsWith(cookieDomain);
    });
  }

  /**
   * Get all normalized cookies
   */
  getAll(): Cookie[] {
    return this.getNormalized();
  }

  /**
   * Get all cookies as Playwright BrowserContext.addCookies() format
   */
  asPlaywrightCookies(): Cookie[] {
    return this.getNormalized();
  }

  /**
   * Check if any cookies are loaded
   */
  isEmpty(): boolean {
    return this.cookies.length === 0;
  }

  /**
   * Get cookie count
   */
  count(): number {
    return this.cookies.length;
  }

  /**
   * Get cookie by name
   */
  getByName(name: string): Cookie | undefined {
    return this.getNormalized().find(cookie => cookie.name === name);
  }
}
