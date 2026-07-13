export class GitHubError extends Error {
  constructor(
    message: string,
    public status?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = "GitHubError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class GitHubRateLimitError extends GitHubError {
  constructor(
    message: string,
    public resetTime: Date,
    public retryAfterSecs?: number
  ) {
    super(message, 403);
    this.name = "GitHubRateLimitError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class GitHubTimeoutError extends GitHubError {
  constructor(message: string) {
    super(message, 408);
    this.name = "GitHubTimeoutError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class GitHubNetworkError extends GitHubError {
  constructor(message: string, originalError: any) {
    super(message, undefined, originalError);
    this.name = "GitHubNetworkError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class GitHubNotFoundError extends GitHubError {
  constructor(message: string) {
    super(message, 404);
    this.name = "GitHubNotFoundError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class GitHubPermissionError extends GitHubError {
  constructor(message: string, status: number) {
    super(message, status);
    this.name = "GitHubPermissionError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class GitHubAbortedError extends GitHubError {
  constructor(message: string) {
    super(message, undefined);
    this.name = "GitHubAbortedError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
