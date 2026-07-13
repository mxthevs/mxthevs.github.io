import { RateLimitInfo } from "./types";
import { GitHubConfig } from "./config";

export class RateLimitManager {
  private current: RateLimitInfo = {
    limit: 60,
    remaining: 60,
    reset: new Date(Date.now() + 60 * 1000), // Default reset in 1 minute
  };

  constructor(private config: GitHubConfig) {}

  /**
   * Updates rate limit state based on HTTP headers
   */
  update(headers: Headers): void {
    const limitHeader = headers.get("x-ratelimit-limit");
    const remainingHeader = headers.get("x-ratelimit-remaining");
    const resetHeader = headers.get("x-ratelimit-reset");
    const retryAfterHeader = headers.get("retry-after");

    const limit = limitHeader ? parseInt(limitHeader, 10) : this.current.limit;
    const remaining = remainingHeader ? parseInt(remainingHeader, 10) : this.current.remaining;
    
    let reset = this.current.reset;
    if (resetHeader) {
      const resetUnixSecs = parseInt(resetHeader, 10);
      if (!isNaN(resetUnixSecs)) {
        reset = new Date(resetUnixSecs * 1000);
      }
    }

    let retryAfterSecs: number | undefined;
    if (retryAfterHeader) {
      const seconds = parseInt(retryAfterHeader, 10);
      if (!isNaN(seconds)) {
        retryAfterSecs = seconds;
      }
    }

    this.current = {
      limit,
      remaining,
      reset,
      retryAfterSecs,
    };
  }

  /**
   * Returns current rate limit information
   */
  getInfo(): RateLimitInfo {
    return { ...this.current };
  }

  /**
   * Checks if we have hit or are extremely close to hitting our rate limit ceiling
   */
  isExhausted(): boolean {
    return this.current.remaining <= this.config.rateLimitSafetyMargin;
  }

  /**
   * Returns the remaining milliseconds until the rate limit window resets
   */
  getResetDelayMs(): number {
    const now = Date.now();
    const resetTime = this.current.reset.getTime();
    return Math.max(0, resetTime - now);
  }

  /**
   * Calculates the delay we should introduce before launching more requests.
   * If Rate limits are exhausted or Retry-After is specified, returns the wait period in ms.
   */
  getWaitTimeMs(): number {
    if (this.current.retryAfterSecs && this.current.retryAfterSecs > 0) {
      return this.current.retryAfterSecs * 1000;
    }

    if (this.isExhausted()) {
      const delay = this.getResetDelayMs();
      // Wait for reset, plus a small 2-second safety margin to handle server/client clock drift
      return delay > 0 ? delay + 2000 : 5000;
    }

    return 0;
  }
}
export default RateLimitManager;
