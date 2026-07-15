import { prisma } from "@/app/utils/prisma";
import { parseJsonResponse, requireCodeforcesBaseUrl } from "@/app/utils/helpers";
import type { CodeforcesSubmission } from "@/app/types";

/** How long a completed sync stays fresh before syncUserIfStale re-runs it. */
export const SYNC_TTL_MS = 30 * 60 * 1000;

/** A sync stuck in "running" longer than this is assumed dead and can be reclaimed. */
const STUCK_RUNNING_MS = 10 * 60 * 1000;

/** Submissions fetched per Codeforces API call. */
const PAGE_SIZE = 500;

/** Polite gap between consecutive Codeforces API calls. */
const PAGE_DELAY_MS = 2000;

/** Verdicts that may still change; rows with these get re-checked on later syncs. */
const NON_FINAL_VERDICTS = ["PENDING", "TESTING"];

export type SyncResult =
  | { status: "synced"; newSubmissions: number }
  | { status: "skipped"; reason: "fresh" | "already-running" | "no-handle" };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const problemKey = (problem: CodeforcesSubmission["problem"]) =>
  problem.contestId && problem.index
    ? `${problem.contestId}-${problem.index}`
    : `x-${problem.name ?? "unknown"}`;

/** Fetch one page of user.status with retry + exponential backoff. */
async function fetchSubmissionPage(handle: string, from: number, count: number): Promise<CodeforcesSubmission[]> {
  const url = `${requireCodeforcesBaseUrl()}/user.status?handle=${encodeURIComponent(handle)}&from=${from}&count=${count}`;

  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (attempt > 0) await sleep(1000 * 2 ** attempt);
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Codeforces responded ${res.status}`);
      const data = await parseJsonResponse<{ status?: string; comment?: string; result?: CodeforcesSubmission[] }>(res, url);
      if (data.status !== "OK" || !Array.isArray(data.result)) {
        throw new Error(data.comment ?? "Codeforces returned a non-OK payload");
      }
      return data.result;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Failed to fetch submissions");
}

/**
 * Incrementally sync a user's Codeforces submissions into the database.
 *
 * Pages newest-first through user.status and stops at the first submission
 * we already have a final verdict for, so steady-state syncs cost one API
 * call. Codeforces submission ids are the primary key, which makes inserts
 * idempotent. A "running" SyncState row acts as a lock against concurrent
 * syncs for the same user.
 */
export async function syncUser(userId: string): Promise<SyncResult> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { codeforcesUsername: true } });
  if (!user?.codeforcesUsername) return { status: "skipped", reason: "no-handle" };
  const handle = user.codeforcesUsername;

  // Claim the lock: create the row if missing, then flip status to "running"
  // only if no live sync holds it. updateMany returns the number of rows it
  // matched, so count === 0 means another sync is in flight.
  await prisma.syncState.upsert({ where: { userId }, create: { userId }, update: {} });
  const claimed = await prisma.syncState.updateMany({
    where: {
      userId,
      OR: [
        { status: { not: "running" } },
        { updatedAt: { lt: new Date(Date.now() - STUCK_RUNNING_MS) } },
      ],
    },
    data: { status: "running", error: null },
  });
  if (claimed.count === 0) return { status: "skipped", reason: "already-running" };

  try {
    const newest = await prisma.submission.findFirst({
      where: { userId },
      orderBy: { id: "desc" },
      select: { id: true },
    });
    const knownMaxId = newest?.id ?? 0;

    // Rows whose verdict was still being judged last time — re-check them
    // instead of stopping the walk when we reach their ids.
    const pending = await prisma.submission.findMany({
      where: { userId, verdict: { in: NON_FINAL_VERDICTS } },
      select: { id: true },
    });
    const pendingIds = new Set(pending.map((row) => row.id));

    const collected: CodeforcesSubmission[] = [];
    let from = 1;
    for (;;) {
      if (from > 1) await sleep(PAGE_DELAY_MS);
      const page = await fetchSubmissionPage(handle, from, PAGE_SIZE);

      let done = page.length < PAGE_SIZE;
      for (const submission of page) {
        if (submission.id <= knownMaxId && !pendingIds.has(submission.id)) {
          done = true;
          break;
        }
        collected.push(submission);
      }
      if (done) break;
      from += PAGE_SIZE;
    }

    // Leave still-judging submissions out; they'll be picked up once final.
    const finished = collected.filter(
      (submission) => submission.verdict && !NON_FINAL_VERDICTS.includes(submission.verdict),
    );

    const problems = new Map(finished.map((s) => [problemKey(s.problem), s.problem]));
    if (problems.size) {
      await prisma.problem.createMany({
        data: Array.from(problems.entries()).map(([id, problem]) => ({
          id,
          contestId: problem.contestId ?? null,
          index: problem.index ?? "?",
          name: problem.name ?? "Unknown problem",
          rating: problem.rating ?? null,
          tags: problem.tags ?? [],
        })),
        skipDuplicates: true,
      });
    }

    const reFetched = finished.filter((s) => pendingIds.has(s.id));
    const created = finished.length
      ? await prisma.submission.createMany({
          data: finished.map((submission) => ({
            id: submission.id,
            userId,
            problemId: problemKey(submission.problem),
            verdict: submission.verdict ?? "PENDING",
            language: submission.programmingLanguage ?? "unknown",
            submittedAt: new Date(submission.creationTimeSeconds * 1000),
          })),
          skipDuplicates: true,
        })
      : { count: 0 };

    // createMany skipped rows that already exist (the previously-pending
    // ones) — update their verdicts individually; there are at most a few.
    for (const submission of reFetched) {
      await prisma.submission.update({
        where: { id: submission.id },
        data: { verdict: submission.verdict ?? "PENDING" },
      });
    }

    await prisma.syncState.update({
      where: { userId },
      data: { status: "idle", lastSyncAt: new Date(), error: null },
    });
    return { status: "synced", newSubmissions: created.count };
  } catch (error) {
    await prisma.syncState
      .update({
        where: { userId },
        data: { status: "error", error: error instanceof Error ? error.message : "Sync failed" },
      })
      .catch(() => {});
    throw error;
  }
}

/**
 * Backfill ratings/tags for stored problems that had none when first synced.
 * Codeforces assigns ratings weeks after a contest, and incremental syncs
 * never revisit old submissions, so without this pass recent problems would
 * keep rating = null forever. Run from the nightly cron.
 */
export async function refreshProblemMetadata(): Promise<{ updated: number }> {
  const unrated = await prisma.problem.findMany({
    where: { rating: null, contestId: { not: null } },
    select: { id: true },
  });
  if (!unrated.length) return { updated: 0 };

  const url = `${requireCodeforcesBaseUrl()}/problemset.problems`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Codeforces responded ${res.status}`);
  const data = await parseJsonResponse<{
    status?: string;
    result?: { problems?: Array<{ contestId?: number; index?: string; rating?: number; tags?: string[] }> };
  }>(res, url);
  if (data.status !== "OK" || !Array.isArray(data.result?.problems)) {
    throw new Error("Codeforces returned a non-OK problemset payload");
  }

  const byId = new Map(
    data.result.problems
      .filter((p) => p.contestId && p.index)
      .map((p) => [`${p.contestId}-${p.index}`, p]),
  );

  let updated = 0;
  for (const { id } of unrated) {
    const fresh = byId.get(id);
    if (!fresh?.rating) continue;
    await prisma.problem.update({
      where: { id },
      data: { rating: fresh.rating, tags: fresh.tags ?? [] },
    });
    updated += 1;
  }
  return { updated };
}

/** Run syncUser only when the last successful sync is older than SYNC_TTL_MS. */
export async function syncUserIfStale(userId: string): Promise<SyncResult> {
  const state = await prisma.syncState.findUnique({ where: { userId } });
  if (state && state.status === "idle" && Date.now() - state.lastSyncAt.getTime() < SYNC_TTL_MS) {
    return { status: "skipped", reason: "fresh" };
  }
  return syncUser(userId);
}
