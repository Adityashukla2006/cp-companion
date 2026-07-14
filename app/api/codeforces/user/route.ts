import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { parseJsonResponse, requireCodeforcesBaseUrl } from "@/app/utils/helpers";

export async function GET() {
  try {
    const session = await auth();
    const handle = session?.user?.codeforcesUsername;
    if (!handle) {
      return NextResponse.json({ error: "Codeforces handle not set" }, { status: 401 });
    }

    const res = await fetch(`${requireCodeforcesBaseUrl()}/user.info?handles=${encodeURIComponent(handle)}`);

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch user info" }, { status: res.status });
    }

    const data = await parseJsonResponse<Record<string, unknown>>(res, `${requireCodeforcesBaseUrl()}/user.info`);
    return NextResponse.json(Array.isArray(data.result) ? data.result[0] ?? null : null);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch user info" }, { status: 500 });
  }
}
