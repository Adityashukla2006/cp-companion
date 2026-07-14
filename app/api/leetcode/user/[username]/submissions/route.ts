import { NextResponse } from "next/server";
import { leetcodeUrl, parseJsonResponse } from "@/app/utils/helpers";

const getBaseUrl = () => {
    if (!leetcodeUrl) {
        throw new Error("NEXT_PUBLIC_LEETCODE_API_BASE_URL is not configured.");
    }

    return leetcodeUrl.replace(/\/$/, "");
};

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ username: string }> }
) {
    const { username } = await params;

    try {
        const res = await fetch(`${getBaseUrl()}/${username}/submission`);

        if (!res.ok) {
            return NextResponse.json({ error: "Failed to fetch submissions" }, { status: res.status });
        }

        const data = await parseJsonResponse<Record<string, unknown>>(res, `${getBaseUrl()}/${username}/submission`);
        return NextResponse.json(Array.isArray(data.submission) ? data.submission : []);
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch submissions" }, { status: 500 });
    }
}
