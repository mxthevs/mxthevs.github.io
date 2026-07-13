import { GitHubRepo, NormalizedCommit, ProgressCallback } from "./types";
import { GitHubConfig } from "./config";
import { CacheProvider } from "./cache";
import { RequestScheduler } from "./scheduler";
import { GitHubClient } from "./client";
import { CommitNormalizer } from "./normalizer";

export class RepositoryService {
  constructor(
    private config: GitHubConfig,
    private client: GitHubClient,
    private scheduler: RequestScheduler,
    private cache: CacheProvider
  ) {}

  /**
   * Fetches all repositories owned by the selected user (handling pagination and conditional ETag caching).
   */
  async getRepositories(username: string, signal?: AbortSignal): Promise<GitHubRepo[]> {
    const normUser = username.toLowerCase();

    // 1. Check Cache
    const cachedInfo = this.cache.getRepos(normUser);
    if (cachedInfo && !cachedInfo.isExpired) {
      return cachedInfo.data;
    }

    // 2. Deduplicate in-flight requests
    const inFlightKey = `repos:${normUser}`;
    const inFlightPromise = this.cache.getInFlight<GitHubRepo[]>(inFlightKey);
    if (inFlightPromise) {
      return inFlightPromise;
    }

    const fetchPromise = this.scheduler.execute(async (taskSignal) => {
      let allRepos: GitHubRepo[] = [];
      let page = 1;
      let hasMore = true;
      let useCachedData = false;
      let firstPageResponseEtag: string | undefined = undefined;

      const firstPageEtag = cachedInfo?.etag;

      while (hasMore) {
        if (taskSignal?.aborted) {
          throw new DOMException("Aborted", "AbortError");
        }

        const url = `https://api.github.com/users/${username}/repos?per_page=100&page=${page}&type=owner`;
        
        // Only apply conditional GET (ETag) to the first page request
        const etagToUse = page === 1 ? firstPageEtag : undefined;
        const response = await this.client.request<any[]>(url, etagToUse, taskSignal);

        if (response.status === 304 && page === 1) {
          // 304 Not Modified! The cached repo list is fully valid.
          useCachedData = true;
          break;
        }

        const data = response.data;
        if (!data || !Array.isArray(data) || data.length === 0) {
          break;
        }

        if (page === 1) {
          firstPageResponseEtag = response.etag;
        }

        const parsed = data.map((item: any) => ({
          name: item.name,
          owner: item.owner?.login || username,
          isPrivate: !!item.private,
          isFork: !!item.fork,
          url: item.html_url,
          pushedAt: item.pushed_at || "",
          createdAt: item.created_at || "",
          archived: !!item.archived,
        }));

        allRepos = [...allRepos, ...parsed];

        if (data.length < 100) {
          hasMore = false;
        } else {
          page++;
        }
      }

      if (useCachedData && cachedInfo) {
        // Extend the TTL of the cached item since server confirmed it's still fresh
        this.cache.setRepos(normUser, cachedInfo.data, cachedInfo.etag);
        return cachedInfo.data;
      }

      // Save new repos to cache
      this.cache.setRepos(normUser, allRepos, firstPageResponseEtag);
      return allRepos;
    }, signal);

    this.cache.setInFlight(inFlightKey, fetchPromise);

    try {
      return await fetchPromise;
    } finally {
      this.cache.deleteInFlight(inFlightKey);
    }
  }
}

export class CommitService {
  constructor(
    private config: GitHubConfig,
    private client: GitHubClient,
    private scheduler: RequestScheduler,
    private cache: CacheProvider
  ) {}

  private isToday(dateStr: string): boolean {
    const utcTodayStr = new Date().toISOString().split("T")[0];
    const localToday = new Date();
    const localTodayStr = `${localToday.getFullYear()}-${String(localToday.getMonth() + 1).padStart(2, "0")}-${String(localToday.getDate()).padStart(2, "0")}`;
    return dateStr === utcTodayStr || dateStr === localTodayStr;
  }

  private getCommitsCacheKey(username: string, repoName: string, date: string): string {
    return `${username.toLowerCase()}/${repoName.toLowerCase()}/${date}`;
  }

  /**
   * Fetches commits for a specific repository and date.
   */
  async getCommitsForRepoAndDate(
    username: string,
    repo: GitHubRepo,
    date: string,
    signal?: AbortSignal
  ): Promise<NormalizedCommit[]> {
    const cacheKey = this.getCommitsCacheKey(username, repo.name, date);
    const isDateToday = this.isToday(date);

    // 1. Check cache (only for historical, immutable dates)
    if (!isDateToday) {
      const cached = this.cache.getCommits(cacheKey);
      if (cached) {
        return cached.data;
      }
    }

    // 2. Deduplicate in-flight requests
    const inFlightKey = `commits:${cacheKey}`;
    const inFlightPromise = this.cache.getInFlight<NormalizedCommit[]>(inFlightKey);
    if (inFlightPromise) {
      return inFlightPromise;
    }

    const fetchPromise = this.scheduler.execute(async (taskSignal) => {
      const since = `${date}T00:00:00Z`;
      const until = `${date}T23:59:59Z`;
      const url = `https://api.github.com/repos/${repo.owner}/${repo.name}/commits?since=${since}&until=${until}&author=${username}&per_page=100`;

      // Conditional request (If-None-Match) for intelligent server-side diff caching
      const cached = !isDateToday ? this.cache.getCommits(cacheKey) : null;
      const response = await this.client.request<any[]>(url, cached?.etag, taskSignal);

      if (response.status === 304 && cached) {
        return cached.data;
      }

      const data = response.data;
      if (!data || !Array.isArray(data)) {
        if (!isDateToday) {
          this.cache.setCommits(cacheKey, [], response.etag);
        }
        return [];
      }

      const normUsername = username.toLowerCase();
      const commits = data
        .filter((item: any) => {
          const authorLogin = item.author?.login || item.commit?.author?.name || "";
          return (
            authorLogin.toLowerCase() === normUsername ||
            item.commit?.author?.email?.includes(normUsername)
          );
        })
        .map((item: any) => CommitNormalizer.normalizeRestCommit(item, `${repo.owner}/${repo.name}`, username));

      // Cache historical dates permanently
      if (!isDateToday) {
        this.cache.setCommits(cacheKey, commits, response.etag);
      }

      return commits;
    }, signal);

    this.cache.setInFlight(inFlightKey, fetchPromise);

    try {
      return await fetchPromise;
    } finally {
      this.cache.deleteInFlight(inFlightKey);
    }
  }

  /**
   * Orchestrates fetching commits across active repositories, utilizing intelligent metadata filtering.
   */
  async getContributionCommits(
    username: string,
    date: string,
    repositoryService: RepositoryService,
    onProgress?: ProgressCallback,
    signal?: AbortSignal
  ): Promise<{ commits: NormalizedCommit[]; privateCount: number }> {
    if (onProgress) onProgress({ step: "repos" });

    // 1. Fetch repositories
    const repos = await repositoryService.getRepositories(username, signal);

    // 2. Intelligent filtering
    const targetDateStartMs = new Date(`${date}T00:00:00Z`).getTime();
    const bufferMs = 24 * 60 * 60 * 1000; // 24-hour timezone/clock skew buffer
    
    const activeRepos = repos.filter((repo) => {
      // Rule 1: Never fetch forks
      if (repo.isFork) return false;

      // Rule 2: Creation date filter
      // If the repo was created after the target date (with 24hr buffer), it cannot have commits on the target date.
      if (repo.createdAt) {
        const createdTime = new Date(repo.createdAt).getTime();
        if (createdTime > targetDateStartMs + bufferMs) {
          return false;
        }
      }

      // Rule 3: Last pushed date filter
      // If the last push to this repo occurred before the target date (with 24hr buffer), it cannot have commits on the target date.
      if (repo.pushedAt) {
        const pushedTime = new Date(repo.pushedAt).getTime();
        if (pushedTime < targetDateStartMs - bufferMs) {
          return false;
        }
      }

      return true;
    });

    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    if (onProgress) {
      onProgress({ step: "commits", loadedRepos: 0, totalRepos: activeRepos.length });
    }

    // 3. Batch/Queue commit fetching
    let loadedCount = 0;
    const commitPromises = activeRepos.map(async (repo) => {
      try {
        const commits = await this.getCommitsForRepoAndDate(username, repo, date, signal);
        loadedCount++;
        if (onProgress) {
          onProgress({ step: "commits", loadedRepos: loadedCount, totalRepos: activeRepos.length });
        }
        return commits;
      } catch (err) {
        console.warn(`[CommitService] Failed to load commits for ${repo.name}:`, err);
        loadedCount++;
        if (onProgress) {
          onProgress({ step: "commits", loadedRepos: loadedCount, totalRepos: activeRepos.length });
        }
        return [];
      }
    });

    const results = await Promise.all(commitPromises);
    const allCommits = results.flat();

    // Sort by commit date descending (newest first)
    allCommits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (onProgress) onProgress({ step: "done" });

    return {
      commits: allCommits,
      privateCount: 0,
    };
  }
}
export default CommitService;
