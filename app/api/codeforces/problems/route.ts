import { NextResponse } from "next/server";
import { requireCodeforcesBaseUrl } from "@/app/utils/helpers";

export async function GET() {
  try {
    const res = await fetch(`${requireCodeforcesBaseUrl()}/problemset.problems`);

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch problems" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data.result?.problems ?? []);
  } catch {
    return NextResponse.json({ error: "Failed to fetch problems" }, { status: 500 });
  }
}
