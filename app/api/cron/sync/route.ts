import { NextResponse } from "next/server";
import { prisma } from "@/app/utils/prisma";
import { refreshProblemMetadata, syncUser } from "@/app/services/sync";

/** Sequential per-user syncs against a rate-limited API need headroom. */
export const maxDuration = 300;

/**
 * Nightly sync of every linked account, triggered by Vercel Cron
 * (see vercel.json). Authenticated via the CRON_SECRET bearer token,
 * which Vercel attaches to cron invocations automatically.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { codeforcesUsername: { not: null } },
    select: { id: true, codeforcesUsername: true },
  });

  const results: Array<{ userId: string; status: string; detail?: string }> = [];
  for (const user of users) {
    try {
      const result = await syncUser(user.id);
      results.push({
        userId: user.id,
        status: result.status,
        detail: result.status === "synced" ? `${result.newSubmissions} new` : result.reason,
      });
    } catch (error) {
      results.push({
        userId: user.id,
        status: "error",
        detail: error instanceof Error ? error.message : "Sync failed",
      });
    }
  }

  let problemsUpdated = 0;
  try {
    problemsUpdated = (await refreshProblemMetadata()).updated;
  } catch (error) {
    results.push({
      userId: "-",
      status: "metadata-error",
      detail: error instanceof Error ? error.message : "Metadata refresh failed",
    });
  }

  return NextResponse.json({ users: users.length, problemsUpdated, results });
}
