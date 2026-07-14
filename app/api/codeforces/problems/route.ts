import { NextResponse } from "next/server";
import { parseJsonResponse, requireCodeforcesBaseUrl } from "@/app/utils/helpers";

export async function GET() {
  try {
    const res = await fetch(`${requireCodeforcesBaseUrl()}/problemset.problems`);

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch problems" }, { status: res.status });
    }

    const data = await parseJsonResponse<Record<string, unknown>>(res, `${requireCodeforcesBaseUrl()}/problemset.problems`);
    const result = data.result && typeof data.result === "object" ? data.result as Record<string, unknown> : {};
    return NextResponse.json(Array.isArray(result.problems) ? result.problems : []);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch problems" }, { status: 500 });
  }
}
