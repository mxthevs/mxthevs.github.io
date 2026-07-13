import { NormalizedCommit } from "./types";

export class CommitNormalizer {
  /**
   * Transforms raw GitHub REST API commit item into a normalized commit schema.
   */
  static normalizeRestCommit(item: any, repoFullName: string, defaultUsername: string): NormalizedCommit {
    const commitDate = item.commit?.author?.date || item.commit?.committer?.date || "";
    let timeStr = "12:00";
    if (commitDate) {
      const parsedDate = new Date(commitDate);
      const h = String(parsedDate.getUTCHours()).padStart(2, "0");
      const m = String(parsedDate.getUTCMinutes()).padStart(2, "0");
      timeStr = `${h}:${m}`;
    }

    return {
      sha: item.sha,
      repo: repoFullName,
      message: item.commit?.message || "No commit message",
      url: item.html_url || `https://github.com/${repoFullName}/commit/${item.sha}`,
      date: commitDate,
      time: timeStr,
      author: {
        login: item.author?.login || defaultUsername,
        avatarUrl: item.author?.avatar_url || "https://github.com/identicons/git.png",
      },
    };
  }
}
export default CommitNormalizer;
