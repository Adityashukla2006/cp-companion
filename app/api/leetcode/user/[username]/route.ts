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
        const baseUrl = getBaseUrl();
        const [profileRes, solvedRes, contestRes] = await Promise.all([
            fetch(`${baseUrl}/${username}`),
            fetch(`${baseUrl}/${username}/solved`),
            fetch(`${baseUrl}/${username}/contest`),
        ]);

        if (!profileRes.ok || !solvedRes.ok || !contestRes.ok) {
            return NextResponse.json({ error: "Failed to fetch user data" }, { status: 502 });
        }

        const [profileData, solvedData, contestData] = await Promise.all([
            profileRes.json(),
            solvedRes.json(),
            contestRes.json(),
        ]);

        return NextResponse.json({
            about: profileData.about,
            avatar: profileData.avatar,
            name: profileData.name,
            ranking: profileData.ranking,
            skillTags: profileData.skillTags,
            contest: {
                contestRating: contestData.contestRating,
                contestGlobalRanking: contestData.contestGlobalRanking,
                contestAttend: contestData.contestAttend,
                contestBadges: contestData.contestBadges,
            },
            problemStats: {
                solvedProblem: solvedData.solvedProblem,
                easySolved: solvedData.easySolved,
                mediumSolved: solvedData.mediumSolved,
                hardSolved: solvedData.hardSolved,
            },
        });
    } catch {
        return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
    }
}
