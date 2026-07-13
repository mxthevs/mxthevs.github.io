import { GitHubRepo, NormalizedCommit, CachedData } from "./types";
import { GitHubConfig } from "./config";

export class CacheProvider {
  private memoryRepos = new Map<string, GitHubRepo[]>();
  private memoryCommits = new Map<string, NormalizedCommit[]>();
  private memoryEtags = new Map<string, string>(); // key -> etag
  
  // Track in-flight promises to deduplicate identical concurrent requests
  private inFlight = new Map<string, Promise<any>>();

  constructor(private config: GitHubConfig) {}

  getInFlight<T>(key: string): Promise<T> | undefined {
    return this.inFlight.get(key);
  }

  setInFlight<T>(key: string, promise: Promise<T>): void {
    this.inFlight.set(key, promise);
  }

  deleteInFlight(key: string): void {
    this.inFlight.delete(key);
  }

  // --- REPOS CACHE ---

  getRepos(username: string): { data: GitHubRepo[]; etag?: string; isExpired: boolean } | null {
    const key = username.toLowerCase();
    
    // Check in-memory first
    if (this.memoryRepos.has(key)) {
      const etag = this.memoryEtags.get(`repos:${key}`);
      return { data: this.memoryRepos.get(key)!, etag, isExpired: false };
    }

    // Check localStorage
    if (this.config.enableLocalStorage) {
      const store = this.getLocalStorageStore<GitHubRepo[]>("gh_repos_cache");
      const cached = store[key];
      if (cached) {
        const isExpired = Date.now() - cached.timestamp > this.config.reposTtlMs;
        // Seed memory cache
        if (!isExpired) {
          this.memoryRepos.set(key, cached.data);
          if (cached.etag) this.memoryEtags.set(`repos:${key}`, cached.etag);
        }
        return { data: cached.data, etag: cached.etag, isExpired };
      }
    }

    return null;
  }

  setRepos(username: string, data: GitHubRepo[], etag?: string): void {
    const key = username.toLowerCase();
    this.memoryRepos.set(key, data);
    if (etag) {
      this.memoryEtags.set(`repos:${key}`, etag);
    } else {
      this.memoryEtags.delete(`repos:${key}`);
    }

    if (this.config.enableLocalStorage) {
      const store = this.getLocalStorageStore<GitHubRepo[]>("gh_repos_cache");
      store[key] = {
        timestamp: Date.now(),
        data,
        etag,
      };
      this.setLocalStorageStore("gh_repos_cache", store);
    }
  }

  // --- COMMITS CACHE ---

  getCommits(cacheKey: string): { data: NormalizedCommit[]; etag?: string } | null {
    const key = cacheKey.toLowerCase();
    
    // Check in-memory first
    if (this.memoryCommits.has(key)) {
      const etag = this.memoryEtags.get(`commits:${key}`);
      return { data: this.memoryCommits.get(key)!, etag };
    }

    // Check localStorage
    if (this.config.enableLocalStorage) {
      const store = this.getLocalStorageStore<NormalizedCommit[]>("gh_commits_cache");
      const cached = store[key];
      if (cached) {
        // Seed memory cache
        this.memoryCommits.set(key, cached.data);
        if (cached.etag) this.memoryEtags.set(`commits:${key}`, cached.etag);
        return { data: cached.data, etag: cached.etag };
      }
    }

    return null;
  }

  setCommits(cacheKey: string, data: NormalizedCommit[], etag?: string): void {
    const key = cacheKey.toLowerCase();
    this.memoryCommits.set(key, data);
    if (etag) {
      this.memoryEtags.set(`commits:${key}`, etag);
    } else {
      this.memoryEtags.delete(`commits:${key}`);
    }

    if (this.config.enableLocalStorage) {
      const store = this.getLocalStorageStore<NormalizedCommit[]>("gh_commits_cache");
      store[key] = {
        timestamp: Date.now(),
        data,
        etag,
      };
      this.setLocalStorageStore("gh_commits_cache", store);
    }
  }

  // --- STORAGE HELPERS ---

  private getLocalStorageStore<T>(storeKey: string): Record<string, CachedData<T>> {
    try {
      const raw = localStorage.getItem(storeKey);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  private setLocalStorageStore<T>(storeKey: string, data: Record<string, CachedData<T>>): void {
    try {
      localStorage.setItem(storeKey, JSON.stringify(data));
    } catch (e) {
      // If quota exceeded, prune older cache entries
      this.pruneCache();
      try {
        localStorage.setItem(storeKey, JSON.stringify(data));
      } catch (e2) {
        // Safe fallback if storage remains full or disabled
      }
    }
  }

  /**
   * Prunes the oldest 30% of cache entries to free up localStorage.
   */
  private pruneCache(): void {
    try {
      const storeKeys = ["gh_repos_cache", "gh_commits_cache"];
      for (const storeKey of storeKeys) {
        const raw = localStorage.getItem(storeKey);
        if (!raw) continue;
        const store = JSON.parse(raw) as Record<string, CachedData<any>>;
        const entries = Object.entries(store);
        if (entries.length === 0) continue;

        // Sort by timestamp ascending (oldest first)
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        
        // Delete oldest 30%
        const pruneCount = Math.ceil(entries.length * 0.3);
        const prunedStore = { ...store };
        for (let i = 0; i < pruneCount; i++) {
          delete prunedStore[entries[i][0]];
        }
        localStorage.setItem(storeKey, JSON.stringify(prunedStore));
      }
    } catch (e) {
      // Safe fallback
    }
  }
}
export default CacheProvider;
