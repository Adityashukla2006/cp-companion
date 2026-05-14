import { NextResponse } from "next/server";
import { requireCodeforcesBaseUrl } from "@/app/utils/helpers";

export async function GET() {
  try {
    const res = await fetch(`${requireCodeforcesBaseUrl()}/contest.list`);

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch contests" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(Array.isArray(data.result) ? data.result : []);
  } catch {
    return NextResponse.json({ error: "Failed to fetch contests" }, { status: 500 });
  }
}
