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

    const res = await fetch(`${requireCodeforcesBaseUrl()}/user.rating?handle=${encodeURIComponent(handle)}`, { next: { revalidate: 300 } });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch user rating" }, { status: res.status });
    }

    const data = await parseJsonResponse<Record<string, unknown>>(res, `${requireCodeforcesBaseUrl()}/user.rating`);
    return NextResponse.json(Array.isArray(data.result) ? data.result : []);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch user rating" }, { status: 500 });
  }
}
