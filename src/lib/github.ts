/**
 * Dedicated GitHub Integration Service (Facade)
 * Delegates to highly organized, production-grade layers:
 * Client, RateLimitManager, CacheProvider, RequestScheduler, RepositoryService, CommitService, and CommitNormalizer.
 */

import { DEFAULT_CONFIG } from "./github/config";
import { RateLimitManager } from "./github/rate-limit";
import { CacheProvider } from "./github/cache";
import { GitHubClient } from "./github/client";
import { RequestScheduler } from "./github/scheduler";
import { RepositoryService, CommitService } from "./github/services";
import { GitHubRepo, NormalizedCommit } from "./github/types";

export type { GitHubRepo, NormalizedCommit };

// Instantiate singletons for the application life cycle
const config = DEFAULT_CONFIG;
const rateLimitManager = new RateLimitManager(config);
const cacheProvider = new CacheProvider(config);
const client = new GitHubClient(config, rateLimitManager);
const scheduler = new RequestScheduler(config, rateLimitManager);

const repositoryService = new RepositoryService(config, client, scheduler, cacheProvider);
const commitService = new CommitService(config, client, scheduler, cacheProvider);

/**
 * Public API: Fetches repositories for a user with conditional caching and deduplication.
 */
export async function getRepositories(username: string, signal?: AbortSignal): Promise<GitHubRepo[]> {
  return repositoryService.getRepositories(username, signal);
}

/**
 * Public API: Fetches commits for a specific repository and date.
 */
export async function getCommitsForRepoAndDate(
  username: string,
  repo: GitHubRepo,
  date: string,
  signal?: AbortSignal
): Promise<NormalizedCommit[]> {
  return commitService.getCommitsForRepoAndDate(username, repo, date, signal);
}

/**
 * Public API: Orchestrates repository retrieval and parallel, paced commit checking.
 */
export async function getContributionCommits(
  username: string,
  date: string,
  onProgress?: (status: { step: "repos" | "commits" | "done"; loadedRepos?: number; totalRepos?: number }) => void,
  signal?: AbortSignal
): Promise<{ commits: NormalizedCommit[]; privateCount: number }> {
  return commitService.getContributionCommits(username, date, repositoryService, onProgress, signal);
}
