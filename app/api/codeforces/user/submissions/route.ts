import { NextResponse } from "next/server";
import { requireCodeforcesBaseUrl } from "@/app/utils/helpers";

const CODEFORCES_HANDLE = "adityas140";

export async function GET() {
  try {
    const res = await fetch(`${requireCodeforcesBaseUrl()}/user.status?handle=${CODEFORCES_HANDLE}&from=1&count=25`);

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch submissions" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(Array.isArray(data.result) ? data.result : []);
  } catch {
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}
