import { NextResponse } from "next/server";
import { leetcodeUrl, parseJsonResponse } from "@/app/utils/helpers";

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

        const data = await parseJsonResponse<Record<string, unknown>>(res, `${getBaseUrl()}/contests/upcoming`);
        return NextResponse.json(Array.isArray(data.contests) ? data.contests : []);
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch upcoming contests" }, { status: 500 });
    }
}
