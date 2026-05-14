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
        const res = await fetch(`${getBaseUrl()}/daily`);

        if (!res.ok) {
            return NextResponse.json({ error: "Failed to fetch daily question" }, { status: res.status });
        }

        const data = await res.json();

        return NextResponse.json({
            questionLink: data.questionLink,
            date: data.date,
            questionId: data.questionFrontendId,
            questionTitle: data.questionTitle,
            difficulty: data.difficulty,
            topics: Array.isArray(data.topicTags) ? data.topicTags.map((tag: { name: string }) => tag.name) : [],
        });
    } catch {
        return NextResponse.json({ error: "Failed to fetch daily question" }, { status: 500 });
    }
}
