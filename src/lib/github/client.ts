import { RateLimitManager } from "./rate-limit";
import { GitHubConfig } from "./config";
import { 
  GitHubError, 
  GitHubRateLimitError, 
  GitHubTimeoutError, 
  GitHubNetworkError, 
  GitHubNotFoundError, 
  GitHubPermissionError
} from "./errors";

export interface FetchResponse<T> {
  status: number;
  data?: T;
  etag?: string;
}

export class GitHubClient {
  constructor(
    private config: GitHubConfig,
    private rateLimitManager: RateLimitManager
  ) {}

  /**
   * Executes an HTTP fetch request against the GitHub API, handling timeouts, conditional headers, and errors.
   */
  async request<T>(
    url: string,
    etag?: string,
    signal?: AbortSignal
  ): Promise<FetchResponse<T>> {
    const controller = new AbortController();
    const onAbort = () => controller.abort();
    
    if (signal) {
      if (signal.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }
      signal.addEventListener("abort", onAbort);
    }

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
    };

    if (etag) {
      headers["If-None-Match"] = etag;
    }

    // Wrap request with a timer for custom client timeouts
    const timeoutTimer = setTimeout(() => {
      controller.abort();
    }, this.config.requestTimeoutMs);

    try {
      const response = await fetch(url, {
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutTimer);
      if (signal) {
        signal.removeEventListener("abort", onAbort);
      }

      // Automatically feed headers into rate limit manager
      this.rateLimitManager.update(response.headers);

      const responseEtag = response.headers.get("etag") || undefined;

      if (response.status === 304) {
        return { status: 304, etag: responseEtag };
      }

      if (!response.ok) {
        throw this.handleHttpError(response, url);
      }

      const data = await response.json();
      return { status: response.status, data, etag: responseEtag };
    } catch (error: any) {
      clearTimeout(timeoutTimer);
      if (signal) {
        signal.removeEventListener("abort", onAbort);
      }

      if (error?.name === "AbortError" || signal?.aborted) {
        if (signal?.aborted) {
          throw new DOMException("Aborted", "AbortError");
        } else {
          throw new GitHubTimeoutError(`GitHub request timed out after ${this.config.requestTimeoutMs}ms`);
        }
      }

      if (error instanceof GitHubError) {
        throw error;
      }

      throw new GitHubNetworkError(`Network failure while requesting ${url}: ${error.message}`, error);
    }
  }

  private handleHttpError(response: Response, url: string): GitHubError {
    const status = response.status;
    const info = this.rateLimitManager.getInfo();

    if (status === 403 || status === 429) {
      if (this.rateLimitManager.isExhausted() || response.headers.has("retry-after")) {
        return new GitHubRateLimitError(
          "GitHub API rate limit exceeded.",
          info.reset,
          info.retryAfterSecs
        );
      }
      return new GitHubPermissionError(`Forbidden access to ${url}. Limit exceeded or block.`, status);
    }

    if (status === 404) {
      return new GitHubNotFoundError(`Resource not found: ${url}`);
    }

    if (status === 401) {
      return new GitHubPermissionError(`Unauthorized access. Check credentials.`, status);
    }

    return new GitHubError(`GitHub API request failed with status code ${status}`, status);
  }
}
export default GitHubClient;
