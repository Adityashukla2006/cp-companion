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
        const res = await fetch(`${getBaseUrl()}/daily`, { next: { revalidate: 3600 } });

        if (!res.ok) {
            return NextResponse.json({ error: "Failed to fetch daily question" }, { status: res.status });
        }

        const data = await parseJsonResponse<Record<string, unknown>>(res, `${getBaseUrl()}/daily`);

        return NextResponse.json({
            questionLink: data.questionLink,
            date: data.date,
            questionId: data.questionFrontendId,
            questionTitle: data.questionTitle,
            difficulty: data.difficulty,
            topics: Array.isArray(data.topicTags)
                ? data.topicTags
                    .map((tag) => typeof tag === "object" && tag ? (tag as { name?: string }).name : null)
                    .filter((name): name is string => Boolean(name))
                : [],
        });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch daily question" }, { status: 500 });
    }
}
