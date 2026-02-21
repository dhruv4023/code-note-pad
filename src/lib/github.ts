// Parse GitHub permanent links and extract code info
export interface GitHubPermalink {
  owner: string;
  repo: string;
  commitHash: string;
  filePath: string;
  startLine: number;
  endLine: number;
  rawUrl: string;
  fileUrl: string;
  extension: string;
}

const PERMALINK_REGEX =
  /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([a-f0-9]+)\/(.+?)#L(\d+)(?:-L(\d+))?$/;

export function parseGitHubPermalink(url: string): GitHubPermalink | null {
  const match = url.match(PERMALINK_REGEX);
  if (!match) return null;

  const [, owner, repo, commitHash, filePath, startStr, endStr] = match;
  const startLine = parseInt(startStr, 10);
  const endLine = endStr ? parseInt(endStr, 10) : startLine;
  const extension = filePath.split(".").pop() || "";

  return {
    owner,
    repo,
    commitHash,
    filePath,
    startLine,
    endLine,
    extension,
    rawUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${commitHash}/${filePath}`,
    fileUrl: `https://github.com/${owner}/${repo}/blob/${commitHash}/${filePath}`,
  };
}

export function isGitHubPermalink(url: string): boolean {
  return PERMALINK_REGEX.test(url);
}

export async function fetchCodeFromPermalink(
  permalink: GitHubPermalink
): Promise<string[]> {
  try {
    const res = await fetch(permalink.rawUrl);
    if (!res.ok) throw new Error("Failed to fetch");
    const text = await res.text();
    const lines = text.split("\n");
    return lines.slice(permalink.startLine - 1, permalink.endLine);
  } catch {
    return [`// Failed to fetch code from ${permalink.rawUrl}`];
  }
}
