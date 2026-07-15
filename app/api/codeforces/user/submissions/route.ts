import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/app/utils/prisma";
import { syncUserIfStale } from "@/app/services/sync";
import { parseJsonResponse, requireCodeforcesBaseUrl } from "@/app/utils/helpers";
import type { CodeforcesSubmission } from "@/app/types";

/** First-time syncs walk full history at ~2s per page — allow up to a minute. */
export const maxDuration = 60;

/** Cap on rows returned to the client; covers full history for most users. */
const MAX_ROWS = 5000;

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const handle = session?.user?.codeforcesUsername;
    if (!userId || !handle) {
      return NextResponse.json({ error: "Codeforces handle not set" }, { status: 401 });
    }

    // Refresh from Codeforces when stale; a failure here still lets us serve
    // whatever history is already stored.
    try {
      await syncUserIfStale(userId);
    } catch (error) {
      console.error("Codeforces sync failed:", error);
    }

    const rows = await prisma.submission.findMany({
      where: { userId },
      orderBy: { submittedAt: "desc" },
      take: MAX_ROWS,
      include: { problem: true },
    });

    if (rows.length) {
      const submissions: CodeforcesSubmission[] = rows.map((row) => ({
        id: row.id,
        contestId: row.problem.contestId ?? undefined,
        creationTimeSeconds: Math.floor(row.submittedAt.getTime() / 1000),
        problem: {
          contestId: row.problem.contestId ?? undefined,
          index: row.problem.index,
          name: row.problem.name,
          rating: row.problem.rating ?? undefined,
          tags: row.problem.tags,
        },
        programmingLanguage: row.language,
        verdict: row.verdict,
      }));
      return NextResponse.json(submissions);
    }

    // Nothing stored yet (e.g. first sync failed) — fall back to a live fetch.
    const res = await fetch(`${requireCodeforcesBaseUrl()}/user.status?handle=${encodeURIComponent(handle)}&from=1&count=200`, { next: { revalidate: 300 } });
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch submissions" }, { status: res.status });
    }
    const data = await parseJsonResponse<Record<string, unknown>>(res, `${requireCodeforcesBaseUrl()}/user.status`);
    return NextResponse.json(Array.isArray(data.result) ? data.result : []);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch submissions" }, { status: 500 });
  }
}
