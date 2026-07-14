import { NextResponse } from "next/server";
import { parseJsonResponse, requireCodeforcesBaseUrl } from "@/app/utils/helpers";

export async function GET() {
  try {
    const res = await fetch(`${requireCodeforcesBaseUrl()}/contest.list`, { next: { revalidate: 1800 } });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch contests" }, { status: res.status });
    }

    const data = await parseJsonResponse<Record<string, unknown>>(res, `${requireCodeforcesBaseUrl()}/contest.list`);
    return NextResponse.json(Array.isArray(data.result) ? data.result : []);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch contests" }, { status: 500 });
  }
}
