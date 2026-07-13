export interface GitHubRepo {
  name: string;
  owner: string;
  isPrivate: boolean;
  isFork: boolean;
  url: string;
  pushedAt?: string;
  createdAt?: string;
  archived?: boolean;
}

export interface NormalizedCommit {
  sha: string;
  repo: string;
  message: string;
  url: string;
  date: string; // ISO String
  time: string; // HH:MM
  author: {
    login: string;
    avatarUrl: string;
  };
}

export interface CachedData<T> {
  timestamp: number;
  data: T;
  etag?: string;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
  retryAfterSecs?: number;
}

export interface ProgressStatus {
  step: "repos" | "commits" | "done";
  loadedRepos?: number;
  totalRepos?: number;
}

export type ProgressCallback = (status: ProgressStatus) => void;
