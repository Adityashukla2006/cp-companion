import type { CodeforcesSubmission, LeetcodeActivityDay } from "@/app/types";

/* ---------- Verdicts ---------- */

const VERDICT_LABELS: Record<string, string> = {
  OK: "Accepted",
  WRONG_ANSWER: "Wrong answer",
  TIME_LIMIT_EXCEEDED: "Time limit",
  MEMORY_LIMIT_EXCEEDED: "Memory limit",
  RUNTIME_ERROR: "Runtime error",
  COMPILATION_ERROR: "Compile error",
  IDLENESS_LIMIT_EXCEEDED: "Idleness limit",
  CHALLENGED: "Hacked",
  SKIPPED: "Skipped",
  TESTING: "Testing",
  PARTIAL: "Partial",
};

export type VerdictSlice = { verdict: string; label: string; count: number };

export function verdictBreakdown(submissions: CodeforcesSubmission[]): VerdictSlice[] {
  const counts = new Map<string, number>();
  submissions.forEach((submission) => {
    const verdict = submission.verdict ?? "PENDING";
    counts.set(verdict, (counts.get(verdict) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([verdict, count]) => ({ verdict, label: VERDICT_LABELS[verdict] ?? verdict.toLowerCase().replace(/_/g, " "), count }))
    .sort((a, b) => b.count - a.count);
}

export function verdictInsight(slices: VerdictSlice[]): string | null {
  const total = slices.reduce((sum, slice) => sum + slice.count, 0);
  if (total < 10) return null;

  const share = (verdict: string) => (slices.find((slice) => slice.verdict === verdict)?.count ?? 0) / total;
  const wa = share("WRONG_ANSWER");
  const tle = share("TIME_LIMIT_EXCEEDED");
  const ok = share("OK");

  if (ok >= 0.7) return "Strong accept rate — consider attempting harder problems.";
  if (tle >= 0.25) return "Many time-limit verdicts — review complexity before submitting.";
  if (wa >= 0.35) return "Wrong answers dominate — slow down and test edge cases first.";
  if (ok < 0.3) return "Low accept rate — drop difficulty slightly and rebuild momentum.";
  return null;
}

/* ---------- Difficulty histogram ---------- */

export type DifficultyBucket = { bucket: string; from: number; solved: number };

/** Unique accepted problems grouped into 200-point rating buckets. */
export function difficultyBuckets(submissions: CodeforcesSubmission[]): DifficultyBucket[] {
  const solved = new Map<string, number>();
  submissions.forEach((submission) => {
    const rating = submission.problem.rating;
    if (submission.verdict !== "OK" || typeof rating !== "number") return;
    const key = `${submission.problem.contestId}-${submission.problem.index}-${submission.problem.name}`;
    if (!solved.has(key)) solved.set(key, rating);
  });

  if (!solved.size) return [];

  const buckets = new Map<number, number>();
  solved.forEach((rating) => {
    const from = Math.floor(rating / 200) * 200;
    buckets.set(from, (buckets.get(from) ?? 0) + 1);
  });

  const froms = Array.from(buckets.keys());
  const min = Math.min(...froms);
  const max = Math.max(...froms);
  const result: DifficultyBucket[] = [];
  for (let from = min; from <= max; from += 200) {
    result.push({ bucket: `${from}`, from, solved: buckets.get(from) ?? 0 });
  }
  return result;
}

export function solveZoneInsight(buckets: DifficultyBucket[], userRating: number | null): string | null {
  if (!buckets.length) return null;
  const top = buckets.reduce((best, bucket) => (bucket.solved > best.solved ? bucket : best), buckets[0]);
  const zone = `${top.from}–${top.from + 199}`;

  if (userRating === null) return `Most of your solves land in the ${zone} band.`;
  if (top.from + 199 < userRating - 100) {
    return `Most solves are in ${zone}, well below your ${userRating} rating — push into ${userRating}–${userRating + 300} to grow.`;
  }
  if (top.from > userRating + 100) {
    return `You practice above your ${userRating} rating — great for growth if accept rate holds.`;
  }
  return `Your solve zone (${zone}) matches your rating — mix in problems rated ${userRating + 200}+ to stretch.`;
}

/* ---------- Tags ---------- */

export type TagStat = { tag: string; solved: number; failed: number };

/** Per-tag accepted/failed counts across unique problems, strongest first. */
export function tagStats(submissions: CodeforcesSubmission[], limit = 8): TagStat[] {
  type Attempt = { tags: string[]; accepted: boolean };
  const problems = new Map<string, Attempt>();

  submissions.forEach((submission) => {
    const tags = submission.problem.tags ?? [];
    if (!tags.length) return;
    const key = `${submission.problem.contestId}-${submission.problem.index}-${submission.problem.name}`;
    const existing = problems.get(key);
    const accepted = submission.verdict === "OK";
    if (existing) {
      existing.accepted = existing.accepted || accepted;
    } else {
      problems.set(key, { tags, accepted });
    }
  });

  const stats = new Map<string, { solved: number; failed: number }>();
  problems.forEach(({ tags, accepted }) => {
    tags.forEach((tag) => {
      const entry = stats.get(tag) ?? { solved: 0, failed: 0 };
      if (accepted) entry.solved += 1;
      else entry.failed += 1;
      stats.set(tag, entry);
    });
  });

  return Array.from(stats.entries())
    .map(([tag, { solved, failed }]) => ({ tag, solved, failed }))
    .sort((a, b) => b.solved + b.failed - (a.solved + a.failed))
    .slice(0, limit);
}

export function weakTags(stats: TagStat[], minAttempts = 3): string[] {
  return stats
    .filter(({ solved, failed }) => solved + failed >= minAttempts && failed > solved)
    .map(({ tag }) => tag);
}

/* ---------- Consistency ---------- */

export type ConsistencyStats = {
  currentStreak: number;
  longestStreak: number;
  activeDays: number;
  windowDays: number;
  avgPerActiveDay: number;
  bestWeekday: string | null;
};

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const dayKey = (date: Date) => date.toISOString().split("T")[0];

export function consistencyStats(activity: LeetcodeActivityDay[], windowDays = 90): ConsistencyStats | null {
  if (!activity.length) return null;

  const counts = new Map(activity.map((day) => [day.date, day.count]));
  const today = new Date();

  // Current streak: consecutive active days ending today or yesterday.
  let currentStreak = 0;
  const cursor = new Date(today);
  if (!counts.get(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while ((counts.get(dayKey(cursor)) ?? 0) > 0) {
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Longest streak across all recorded days.
  const activeDates = activity.filter((day) => day.count > 0).map((day) => day.date).sort();
  let longestStreak = 0;
  let run = 0;
  let previous: string | null = null;
  activeDates.forEach((date) => {
    if (previous) {
      const gap = (new Date(date).getTime() - new Date(previous).getTime()) / 86400000;
      run = gap === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    longestStreak = Math.max(longestStreak, run);
    previous = date;
  });

  // Window stats.
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - windowDays);
  const inWindow = activity.filter((day) => new Date(day.date) >= cutoff && day.count > 0);
  const totalSolves = inWindow.reduce((sum, day) => sum + day.count, 0);

  const weekdayTotals = new Array(7).fill(0);
  inWindow.forEach((day) => {
    weekdayTotals[new Date(day.date).getDay()] += day.count;
  });
  const bestIndex = weekdayTotals.indexOf(Math.max(...weekdayTotals));

  return {
    currentStreak,
    longestStreak,
    activeDays: inWindow.length,
    windowDays,
    avgPerActiveDay: inWindow.length ? Math.round((totalSolves / inWindow.length) * 10) / 10 : 0,
    bestWeekday: totalSolves > 0 ? WEEKDAYS[bestIndex] : null,
  };
}

/* ---------- Contest readiness ---------- */

export type ReadinessFactor = { label: string; score: number; max: number; note: string };
export type Readiness = { score: number; verdict: string; factors: ReadinessFactor[] };

export function readinessScore(
  submissions: CodeforcesSubmission[],
  activity: LeetcodeActivityDay[],
  weakTagCount: number,
): Readiness {
  const now = Date.now();
  const day = 86400000;

  // Recency — days since the last practice on either platform.
  const lastCf = submissions.length ? Math.max(...submissions.map((s) => s.creationTimeSeconds)) * 1000 : 0;
  const lastLc = activity.length ? Math.max(...activity.filter((d) => d.count > 0).map((d) => new Date(d.date).getTime()), 0) : 0;
  const daysSince = (now - Math.max(lastCf, lastLc)) / day;
  const recency: ReadinessFactor =
    daysSince <= 1.5 ? { label: "Recency", score: 25, max: 25, note: "Practiced in the last day" }
    : daysSince <= 3 ? { label: "Recency", score: 18, max: 25, note: "Practiced this week" }
    : daysSince <= 7 ? { label: "Recency", score: 10, max: 25, note: `${Math.round(daysSince)} days since last practice` }
    : { label: "Recency", score: 3, max: 25, note: "Over a week since last practice" };

  // Consistency — current streak.
  const streak = consistencyStats(activity)?.currentStreak ?? 0;
  const consistency: ReadinessFactor =
    streak >= 7 ? { label: "Consistency", score: 25, max: 25, note: `${streak}-day streak` }
    : streak >= 3 ? { label: "Consistency", score: 18, max: 25, note: `${streak}-day streak` }
    : streak >= 1 ? { label: "Consistency", score: 10, max: 25, note: `${streak}-day streak` }
    : { label: "Consistency", score: 4, max: 25, note: "No active streak" };

  // Volume — solves across both platforms in the last 14 days.
  const cutoff = now - 14 * day;
  const cfRecent = new Set(
    submissions
      .filter((s) => s.verdict === "OK" && s.creationTimeSeconds * 1000 >= cutoff)
      .map((s) => `${s.problem.contestId}-${s.problem.index}-${s.problem.name}`),
  ).size;
  const lcRecent = activity
    .filter((d) => new Date(d.date).getTime() >= cutoff)
    .reduce((sum, d) => sum + d.count, 0);
  const solves = cfRecent + lcRecent;
  const volume: ReadinessFactor =
    solves >= 20 ? { label: "Volume", score: 25, max: 25, note: `${solves} solves in 14 days` }
    : solves >= 10 ? { label: "Volume", score: 18, max: 25, note: `${solves} solves in 14 days` }
    : solves >= 5 ? { label: "Volume", score: 10, max: 25, note: `${solves} solves in 14 days` }
    : solves >= 1 ? { label: "Volume", score: 6, max: 25, note: `${solves} solves in 14 days` }
    : { label: "Volume", score: 0, max: 25, note: "No solves in 14 days" };

  // Coverage — weak tags drag readiness down.
  const coverage: ReadinessFactor =
    weakTagCount === 0 ? { label: "Topic coverage", score: 25, max: 25, note: "No weak topics detected" }
    : weakTagCount === 1 ? { label: "Topic coverage", score: 17, max: 25, note: "1 weak topic" }
    : weakTagCount === 2 ? { label: "Topic coverage", score: 10, max: 25, note: "2 weak topics" }
    : { label: "Topic coverage", score: 5, max: 25, note: `${weakTagCount} weak topics` };

  const factors = [recency, consistency, volume, coverage];
  const score = factors.reduce((sum, factor) => sum + factor.score, 0);
  const verdict =
    score >= 80 ? "Contest ready"
    : score >= 60 ? "Nearly there"
    : score >= 40 ? "Warming up"
    : "Needs practice";

  return { score, verdict, factors };
}
