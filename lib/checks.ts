import type { Submission } from '@/lib/submissions';

export type CheckResult = {
  id: string;
  label: string;
  pass: boolean;
  summary: string;
};

const GITHUB_RE = /^https?:\/\/(www\.)?github\.com\/([^/\s]+)\/([^/\s#?]+)/i;
const URL_RE = /^https?:\/\/[^\s]+$/i;

function isWellFormedUrl(value: string): boolean {
  return URL_RE.test(value.trim());
}

// Fast, deterministic checks that need no network calls — safe to run for every
// submission in a list view.
export function runInstantChecks(submission: Submission, all: Submission[]): CheckResult[] {
  const checks: CheckResult[] = [];

  const wordCount = submission.description.trim().split(/\s+/).filter(Boolean).length;
  checks.push({
    id: 'description-length',
    label: 'Description is substantive',
    pass: wordCount >= 8,
    summary:
      wordCount >= 8
        ? `Description has ${wordCount} words`
        : `Description is only ${wordCount} word${wordCount === 1 ? '' : 's'} — ask for more detail`,
  });

  const repoIsGithub = GITHUB_RE.test(submission.repoLink.trim());
  checks.push({
    id: 'repo-url-format',
    label: 'Repo link points to GitHub',
    pass: repoIsGithub,
    summary: repoIsGithub
      ? 'Repo link is a github.com URL'
      : `Repo link "${submission.repoLink}" doesn't look like a GitHub URL`,
  });

  const demoOk = isWellFormedUrl(submission.demoLink);
  checks.push({
    id: 'demo-url-format',
    label: 'Demo link looks valid',
    pass: demoOk,
    summary: demoOk ? 'Demo link is a well-formed URL' : `Demo link "${submission.demoLink}" isn't a valid URL`,
  });

  const hackatimeOk = /hackatime/i.test(submission.hackatimeLink) && isWellFormedUrl(submission.hackatimeLink);
  checks.push({
    id: 'hackatime-link-format',
    label: 'Hackatime link looks valid',
    pass: hackatimeOk,
    summary: hackatimeOk
      ? 'Hackatime link looks valid'
      : `Hackatime link "${submission.hackatimeLink}" doesn't look like a Hackatime URL`,
  });

  const normalizedRepo = submission.repoLink.trim().toLowerCase().replace(/\/+$/, '');
  const duplicates = all.filter(
    (s) =>
      s.id !== submission.id &&
      s.repoLink.trim().toLowerCase().replace(/\/+$/, '') === normalizedRepo &&
      normalizedRepo.length > 0
  );
  checks.push({
    id: 'duplicate-repo',
    label: 'No duplicate submissions',
    pass: duplicates.length === 0,
    summary:
      duplicates.length === 0
        ? 'No other submission uses this repo link'
        : `${duplicates.length} other submission(s) use the same repo link: ${duplicates
            .map((d) => d.name)
            .join(', ')}`,
  });

  return checks;
}

// Hits the GitHub API, so only run this on-demand (e.g. the detail view), not
// for every row in a list.
export async function runGithubCheck(submission: Submission): Promise<CheckResult> {
  const match = submission.repoLink.trim().match(GITHUB_RE);
  if (!match) {
    return {
      id: 'github-repo-public',
      label: 'Repo is public on GitHub',
      pass: false,
      summary: 'Skipped — repo link is not a GitHub URL',
    };
  }

  const owner = match[2];
  const repo = match[3].replace(/\.git$/, '');

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'edge-review-board' },
      signal: AbortSignal.timeout(5000),
    });

    if (res.status === 404) {
      return {
        id: 'github-repo-public',
        label: 'Repo is public on GitHub',
        pass: false,
        summary: `${owner}/${repo} was not found — repo may be private, deleted, or renamed`,
      };
    }

    if (!res.ok) {
      return {
        id: 'github-repo-public',
        label: 'Repo is public on GitHub',
        pass: true,
        summary: `Skipped — GitHub API returned ${res.status}`,
      };
    }

    const data = (await res.json()) as { private?: boolean; full_name?: string };
    return {
      id: 'github-repo-public',
      label: 'Repo is public on GitHub',
      pass: data.private !== true,
      summary:
        data.private === true
          ? `${data.full_name ?? `${owner}/${repo}`} is private`
          : `${data.full_name ?? `${owner}/${repo}`} is public`,
    };
  } catch {
    return {
      id: 'github-repo-public',
      label: 'Repo is public on GitHub',
      pass: true,
      summary: 'Skipped — could not reach the GitHub API',
    };
  }
}
