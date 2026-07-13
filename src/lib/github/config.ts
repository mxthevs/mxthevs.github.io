export interface GitHubConfig {
  maxConcurrency: number;
  minIntervalMs: number;
  maxRetries: number;
  baseRetryDelayMs: number;
  maxRetryDelayMs: number;
  requestTimeoutMs: number;
  reposTtlMs: number;
  commitsTtlMs: number;
  rateLimitSafetyMargin: number; // Pause when remaining limit is at or below this number
  enableLocalStorage: boolean;
}

export const DEFAULT_CONFIG: GitHubConfig = {
  maxConcurrency: 2,
  minIntervalMs: 150,
  maxRetries: 3,
  baseRetryDelayMs: 1000,
  maxRetryDelayMs: 10000,
  requestTimeoutMs: 10000, // 10 seconds timeout
  reposTtlMs: 30 * 60 * 1000, // 30 minutes
  commitsTtlMs: 24 * 60 * 60 * 1000, // 24 hours
  rateLimitSafetyMargin: 5, // Pause REST calls if we have 5 or fewer remaining
  enableLocalStorage: true,
};
