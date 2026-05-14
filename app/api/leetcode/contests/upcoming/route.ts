import { NextResponse } from "next/server";
import { leetcodeUrl } from "@/app/utils/helpers";

const getBaseUrl = () => {
    if (!leetcodeUrl) {
        throw new Error("NEXT_PUBLIC_LEETCODE_API_BASE_URL is not configured.");
    }

    return leetcodeUrl.replace(/\/$/, "");
};

export async function GET() {
    try {
        const res = await fetch(`${getBaseUrl()}/contests/upcoming`);

        if (!res.ok) {
            return NextResponse.json({ error: "Failed to fetch upcoming contests" }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(Array.isArray(data.contests) ? data.contests : []);
    } catch {
        return NextResponse.json({ error: "Failed to fetch upcoming contests" }, { status: 500 });
    }
}
