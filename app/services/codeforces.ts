import {
  CodeforcesContest,
  CodeforcesDashboard,
  CodeforcesProblem,
  CodeforcesRatingChange,
  CodeforcesSubmission,
  CodeforcesUser,
} from "../types";
import { fetchJson, toNumberOrNull } from "@/app/utils/helpers";

export const CODEFORCES_USERNAME = "adityas140";

const normalizeUser = (data: Record<string, unknown> | null): CodeforcesUser | null => {
  if (!data) {
    return null;
  }

  return {
    handle: String(data.handle ?? CODEFORCES_USERNAME),
    rating: toNumberOrNull(data.rating),
    maxRating: toNumberOrNull(data.maxRating),
    rank: typeof data.rank === "string" ? data.rank : null,
    maxRank: typeof data.maxRank === "string" ? data.maxRank : null,
    avatar: typeof data.avatar === "string" ? data.avatar : null,
    titlePhoto: typeof data.titlePhoto === "string" ? data.titlePhoto : null,
  };
};

const normalizeContest = (contest: Record<string, unknown>): CodeforcesContest => {
  const id = Number(contest.id);
  const startTimeSeconds = toNumberOrNull(contest.startTimeSeconds);

  return {
    id,
    name: String(contest.name ?? ""),
    type: String(contest.type ?? ""),
    phase: String(contest.phase ?? ""),
    startTimeSeconds,
    durationSeconds: toNumberOrNull(contest.durationSeconds),
    platform: "Codeforces",
    url: Number.isFinite(id) ? `https://codeforces.com/contest/${id}` : "https://codeforces.com/contests",
  };
};

const normalizeSubmission = (submission: Record<string, unknown>): CodeforcesSubmission => ({
  id: Number(submission.id),
  contestId: toNumberOrNull(submission.contestId) ?? undefined,
  creationTimeSeconds: toNumberOrNull(submission.creationTimeSeconds) ?? 0,
  relativeTimeSeconds: toNumberOrNull(submission.relativeTimeSeconds) ?? undefined,
  problem: typeof submission.problem === "object" && submission.problem
    ? submission.problem as CodeforcesProblem
    : {},
  programmingLanguage: typeof submission.programmingLanguage === "string" ? submission.programmingLanguage : undefined,
  verdict: typeof submission.verdict === "string" ? submission.verdict : undefined,
});

export const codeforcesUser = async (): Promise<CodeforcesUser | null> => {
  const data = await fetchJson<Record<string, unknown> | null>("/api/codeforces/user");
  return normalizeUser(data);
};

export const codeforcesRatingHistory = async (): Promise<CodeforcesRatingChange[]> => {
  const data = await fetchJson<CodeforcesRatingChange[]>("/api/codeforces/user/history");
  return Array.isArray(data) ? data : [];
};

export const codeforcesUpcomingContests = async (): Promise<CodeforcesContest[]> => {
  const data = await fetchJson<Array<Record<string, unknown>>>("/api/codeforces/contests");
  return Array.isArray(data)
    ? data.map(normalizeContest).filter((contest) => contest.phase === "BEFORE")
      .sort((a, b) => (a.startTimeSeconds ?? 0) - (b.startTimeSeconds ?? 0))
    : [];
};

export const codeforcesRecentSubmissions = async (): Promise<CodeforcesSubmission[]> => {
  const data = await fetchJson<Array<Record<string, unknown>>>("/api/codeforces/user/submissions");
  return Array.isArray(data) ? data.map(normalizeSubmission) : [];
};

export const codeforcesDashboard = async (): Promise<CodeforcesDashboard> => {
  const [user, ratingHistory, upcomingContests, recentSubmissions] = await Promise.all([
    codeforcesUser(),
    codeforcesRatingHistory(),
    codeforcesUpcomingContests(),
    codeforcesRecentSubmissions(),
  ]);

  const solvedCount = new Set(
    recentSubmissions
      .filter((submission) => submission.verdict === "OK")
      .map((submission) => `${submission.problem.contestId}-${submission.problem.index}-${submission.problem.name}`)
  ).size;

  return {
    username: CODEFORCES_USERNAME,
    user,
    ratingHistory,
    upcomingContests,
    recentSubmissions,
    solvedCount,
  };
};
