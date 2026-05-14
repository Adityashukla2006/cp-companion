import { NextResponse } from "next/server";
import { requireCodeforcesBaseUrl } from "@/app/utils/helpers";

const CODEFORCES_HANDLE = "adityas140";

export async function GET() {
  try {
    const res = await fetch(`${requireCodeforcesBaseUrl()}/user.rating?handle=${CODEFORCES_HANDLE}`);

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch user rating" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(Array.isArray(data.result) ? data.result : []);
  } catch {
    return NextResponse.json({ error: "Failed to fetch user rating" }, { status: 500 });
  }
}
