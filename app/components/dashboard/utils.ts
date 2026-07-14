import type { CodeforcesSubmission, UnifiedContest } from "@/app/types";

export const displayValue = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === "") {
    return "--";
  }

  return value;
};

export const formatSigned = (value: number | null | undefined) => {
  if (typeof value !== "number") {
    return null;
  }

  return value > 0 ? `+${value}` : String(value);
};

export const formatPercent = (value: number | null | undefined) => {
  if (typeof value !== "number") {
    return null;
  }

  return `${value.toFixed(1)}%`;
};

export const formatCountdownFrom = (timestamp: number | null | undefined, nowSeconds: number | null) => {
  if (!timestamp || !nowSeconds) {
    return "--";
  }

  const diffSeconds = Math.max(0, Math.floor(timestamp - nowSeconds));
  const days = Math.floor(diffSeconds / 86400);
  const hours = Math.floor((diffSeconds % 86400) / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
};

export const countdownParts = (timestamp: number | null | undefined, nowSeconds: number | null) => {
  if (!timestamp || !nowSeconds) {
    return { days: "--", hours: "--", minutes: "--", isLive: false };
  }

  const diff = Math.floor(timestamp - nowSeconds);
  if (diff <= 0) {
    return { days: "00", hours: "00", minutes: "00", isLive: true };
  }

  const pad = (value: number) => String(value).padStart(2, "0");
  return {
    days: pad(Math.floor(diff / 86400)),
    hours: pad(Math.floor((diff % 86400) / 3600)),
    minutes: pad(Math.floor((diff % 3600) / 60)),
    isLive: false,
  };
};

export const difficultyClass = (difficulty: string) => `difficulty ${difficulty.toLowerCase()}`;

export const platformClass = (platform: UnifiedContest["platform"]) => `platform-badge ${platform.toLowerCase()}`;

export const codeforcesProblemUrl = (submission: CodeforcesSubmission) => {
  if (!submission.problem.contestId || !submission.problem.index) {
    return null;
  }

  return `https://codeforces.com/contest/${submission.problem.contestId}/problem/${submission.problem.index}`;
};

export const buildUnifiedContests = ({
  codeforces,
  leetcode,
}: {
  codeforces: import("@/app/types").CodeforcesDashboard | null;
  leetcode: import("@/app/types").LeetcodeDashboard | null;
}): UnifiedContest[] => {
  const codeforcesContests: UnifiedContest[] = (codeforces?.upcomingContests ?? []).map((contest) => ({
    id: `cf-${contest.id}`,
    name: contest.name,
    platform: "Codeforces",
    startTimeSeconds: contest.startTimeSeconds,
    durationSeconds: contest.durationSeconds,
    url: contest.url,
  }));

  const leetcodeContests: UnifiedContest[] = (leetcode?.upcomingContests ?? []).map((contest) => ({
    id: `lc-${contest.titleSlug ?? contest.title}`,
    name: contest.title,
    platform: "LeetCode",
    startTimeSeconds: contest.startTime,
    durationSeconds: contest.duration,
    url: contest.url,
  }));

  return [...codeforcesContests, ...leetcodeContests]
    .filter((contest) => contest.startTimeSeconds)
    .sort((a, b) => (a.startTimeSeconds ?? 0) - (b.startTimeSeconds ?? 0))
    .slice(0, 8);
};
