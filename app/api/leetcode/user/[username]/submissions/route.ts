import { NextResponse } from "next/server";
import { leetcodeUrl } from "@/app/utils/helpers";

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

        const data = await res.json();
        return NextResponse.json(Array.isArray(data.submission) ? data.submission : []);
    } catch {
        return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
    }
}
