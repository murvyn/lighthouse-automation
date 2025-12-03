import { AuditResult, LighthouseThresholds } from '../types/config';

/**
 * Color codes for console output
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Logger for Lighthouse audit results
 */
export class Logger {
  private verbose: boolean;

  constructor(verbose = false) {
    this.verbose = verbose;
  }

  /**
   * Print audit result for a single route
   */
  printRouteResult(result: AuditResult): void {
    const { routeName, scores, thresholds, passed } = result;
    const status = passed ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;

    console.log(`\n${colors.bright}${status} ${routeName}${colors.reset}`);
    console.log(`  URL: ${result.url}`);
    this.printScoresTable(scores, thresholds);
  }

  /**
   * Print summary table of all results
   */
  printSummary(results: AuditResult[]): void {
    console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(70)}${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}LIGHTHOUSE AUDIT SUMMARY${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}${'='.repeat(70)}${colors.reset}\n`);

    const table: Array<{
      Route: string;
      Performance: string;
      Accessibility: string;
      'Best Practices': string;
      SEO: string;
      Status: string;
    }> = [];

    for (const result of results) {
      table.push({
        Route: result.routeName,
        Performance: this.scoreToString(result.scores.performance, result.thresholds.performance),
        Accessibility: this.scoreToString(result.scores.accessibility, result.thresholds.accessibility),
        'Best Practices': this.scoreToString(result.scores['best-practices'], result.thresholds['best-practices']),
        SEO: this.scoreToString(result.scores.seo, result.thresholds.seo),
        Status: result.passed ? `${colors.green}PASS${colors.reset}` : `${colors.red}FAIL${colors.reset}`,
      });
    }

    this.printTable(table);

    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    const percentage = ((passed / total) * 100).toFixed(0);

    console.log(`\n${colors.bright}Total: ${passed}/${total} routes passed (${percentage}%)${colors.reset}`);

    if (passed === total) {
      console.log(`${colors.green}${colors.bright}🎉 All audits passed!${colors.reset}\n`);
    } else {
      console.log(`${colors.yellow}${colors.bright}⚠️  ${total - passed} audit(s) failed${colors.reset}\n`);
    }

    console.log(`${colors.cyan}Reports saved to lighthouse-reports/${colors.reset}`);
  }

  /**
   * Print individual route scores table
   */
  private printScoresTable(scores: AuditResult['scores'], thresholds: LighthouseThresholds): void {
    console.log('  Scores:');
    console.log(
      `    Performance:      ${this.scoreToString(scores.performance, thresholds.performance)} (threshold: ${thresholds.performance}/100)`
    );
    console.log(
      `    Accessibility:    ${this.scoreToString(scores.accessibility, thresholds.accessibility)} (threshold: ${thresholds.accessibility}/100)`
    );
    console.log(
      `    Best Practices:   ${this.scoreToString(scores['best-practices'], thresholds['best-practices'])} (threshold: ${thresholds['best-practices']}/100)`
    );
    console.log(
      `    SEO:              ${this.scoreToString(scores.seo, thresholds.seo)} (threshold: ${thresholds.seo}/100)`
    );
  }

  /**
   * Format score with color based on threshold
   */
  private scoreToString(score: number, threshold?: number): string {
    const percentage = Math.round(score * 100);
    const display = `${percentage}/100`;

    if (threshold === undefined) {
      return display;
    }

    if (percentage >= threshold) {
      return `${colors.green}${display}${colors.reset}`;
    } else if (percentage >= threshold - 10) {
      return `${colors.yellow}${display}${colors.reset}`;
    } else {
      return `${colors.red}${display}${colors.reset}`;
    }
  }

  /**
   * Simple table printer for console
   */
  private printTable(data: Array<Record<string, string>>): void {
    if (data.length === 0) return;

    const keys = Object.keys(data[0]);
    const columnWidths: Record<string, number> = {};

    // Calculate column widths
    for (const key of keys) {
      columnWidths[key] = Math.max(
        key.length,
        ...data.map(row => this.stripAnsi(row[key]).length)
      );
    }

    // Print header
    let header = '';
    for (const key of keys) {
      const width = columnWidths[key];
      header += `  ${colors.bright}${key.padEnd(width)}${colors.reset}`;
    }
    console.log(header);

    // Print separator
    let separator = '';
    for (const key of keys) {
      const width = columnWidths[key];
      separator += `  ${'-'.repeat(width)}`;
    }
    console.log(separator);

    // Print rows
    for (const row of data) {
      let line = '';
      for (const key of keys) {
        const value = row[key];
        const width = columnWidths[key];
        const strippedLength = this.stripAnsi(value).length;
        const padding = width - strippedLength;
        line += `  ${value}${' '.repeat(padding)}`;
      }
      console.log(line);
    }
  }

  /**
   * Remove ANSI color codes from string
   */
  private stripAnsi(str: string): string {
    return str.replace(/\x1b\[[0-9;]*m/g, '');
  }

  /**
   * Log debug message (only if verbose)
   */
  debug(message: string): void {
    if (this.verbose) {
      console.log(`${colors.dim}[DEBUG] ${message}${colors.reset}`);
    }
  }

  /**
   * Log info message
   */
  info(message: string): void {
    console.log(`${colors.blue}[INFO] ${message}${colors.reset}`);
  }

  /**
   * Log warning message
   */
  warn(message: string): void {
    console.log(`${colors.yellow}[WARN] ${message}${colors.reset}`);
  }

  /**
   * Log error message
   */
  error(message: string): void {
    console.log(`${colors.red}[ERROR] ${message}${colors.reset}`);
  }
}
