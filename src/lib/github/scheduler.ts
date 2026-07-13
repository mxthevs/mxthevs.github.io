import { RateLimitManager } from "./rate-limit";
import { GitHubConfig } from "./config";
import { GitHubTimeoutError, GitHubRateLimitError } from "./errors";

export class RequestScheduler {
  private queue: (() => Promise<void>)[] = [];
  private activeCount = 0;
  private lastLaunchTime = 0;
  private timeoutId: any = null;

  constructor(
    private config: GitHubConfig,
    private rateLimitManager: RateLimitManager
  ) {}

  /**
   * Enqueues a task and returns a promise for its eventual resolution.
   */
  async execute<T>(
    task: (signal?: AbortSignal) => Promise<T>,
    signal?: AbortSignal
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const runTask = async () => {
        if (signal?.aborted) {
          reject(new DOMException("Aborted", "AbortError"));
          return;
        }

        this.activeCount++;
        try {
          const result = await this.executeWithRetry(task, signal);
          resolve(result);
        } catch (err) {
          reject(err);
        } finally {
          this.activeCount--;
          this.next();
        }
      };

      this.queue.push(runTask);
      this.next();
    });
  }

  /**
   * Orchestrates the execution of a task with retries for transient failures and rate-limit safety checks.
   */
  private async executeWithRetry<T>(
    task: (signal?: AbortSignal) => Promise<T>,
    signal?: AbortSignal,
    attempt = 1
  ): Promise<T> {
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    try {
      // 1. Check if we need to pause due to rate limits or cooldowns
      const waitTime = this.rateLimitManager.getWaitTimeMs();
      if (waitTime > 0) {
        console.warn(`[GitHub Scheduler] Rate limit safety or Retry-After active. Pausing request for ${waitTime}ms...`);
        await this.delay(waitTime, signal);
      }

      // 2. Execute task
      return await task(signal);
    } catch (error: any) {
      if (signal?.aborted || error?.name === "AbortError" || error?.status === undefined && error?.message?.includes("Aborted")) {
        throw new DOMException("Aborted", "AbortError");
      }

      const isTransient = this.isTransientError(error);
      const canRetry = attempt <= this.config.maxRetries;

      if (isTransient && canRetry) {
        const delayMs = this.calculateBackoff(attempt);
        console.warn(
          `[GitHub Scheduler] Transient failure (Attempt ${attempt}/${this.config.maxRetries}). Retrying in ${delayMs}ms. Error: ${error.message}`
        );
        await this.delay(delayMs, signal);
        return this.executeWithRetry(task, signal, attempt + 1);
      }

      // If we hit a rate limit specifically, we can wait for its reset even if it's a "hard" limit
      if (error instanceof GitHubRateLimitError && canRetry) {
        const resetDelay = this.rateLimitManager.getWaitTimeMs();
        if (resetDelay > 0) {
          console.warn(`[GitHub Scheduler] Encountered Rate Limit error. Waiting ${resetDelay}ms for quota reset before retry.`);
          await this.delay(resetDelay, signal);
          return this.executeWithRetry(task, signal, attempt + 1);
        }
      }

      throw error;
    }
  }

  private isTransientError(error: any): boolean {
    if (error instanceof GitHubTimeoutError) return true;
    
    // API server failures
    if (error?.status >= 500 && error?.status < 600) return true;
    
    // Network-level errors
    if (error?.name === "TypeError" && error?.message?.toLowerCase().includes("fetch")) return true;
    
    return false;
  }

  private calculateBackoff(attempt: number): number {
    const power = Math.pow(2, attempt);
    const delay = this.config.baseRetryDelayMs * power;
    // Add jitter (± 20% randomization)
    const jitter = (Math.random() * 0.4 - 0.2) * delay;
    const finalDelay = Math.max(0, delay + jitter);
    return Math.min(this.config.maxRetryDelayMs, finalDelay);
  }

  private delay(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        return reject(new DOMException("Aborted", "AbortError"));
      }

      const onAbort = () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      };

      const timer = setTimeout(() => {
        signal?.removeEventListener("abort", onAbort);
        resolve();
      }, ms);

      signal?.addEventListener("abort", onAbort);
    });
  }

  private next() {
    if (this.activeCount >= this.config.maxConcurrency || this.queue.length === 0) {
      return;
    }

    const now = Date.now();
    const timeSinceLast = now - this.lastLaunchTime;

    if (timeSinceLast < this.config.minIntervalMs) {
      if (!this.timeoutId) {
        const delay = this.config.minIntervalMs - timeSinceLast;
        this.timeoutId = setTimeout(() => {
          this.timeoutId = null;
          this.next();
        }, delay);
      }
      return;
    }

    const nextTask = this.queue.shift();
    if (nextTask) {
      this.lastLaunchTime = Date.now();
      nextTask();
      this.next();
    }
  }
}
export default RequestScheduler;
