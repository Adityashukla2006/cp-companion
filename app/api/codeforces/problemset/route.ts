import { NextRequest, NextResponse } from "next/server";
import { parseJsonResponse, requireCodeforcesBaseUrl } from "@/app/utils/helpers";

type RawProblem = {
  contestId?: number;
  index?: string;
  name?: string;
  rating?: number;
  tags?: string[];
};

/**
 * Filtered slice of the Codeforces problemset for practice recommendations.
 * Query params: min / max (problem rating bounds), tags (comma-separated, OR semantics).
 * The upstream problemset (~10k problems) is cached for a day; filtering happens here
 * so the client only ever receives a small sample.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const min = Number(searchParams.get("min") ?? 800);
  const max = Number(searchParams.get("max") ?? 3500);
  const tags = (searchParams.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);

  try {
    const res = await fetch(`${requireCodeforcesBaseUrl()}/problemset.problems`, { next: { revalidate: 86400 } });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch problemset" }, { status: res.status });
    }

    const data = await parseJsonResponse<Record<string, unknown>>(res, `${requireCodeforcesBaseUrl()}/problemset.problems`);
    const result = data.result && typeof data.result === "object" ? data.result as Record<string, unknown> : {};
    const problems = Array.isArray(result.problems) ? result.problems as RawProblem[] : [];

    const matches = problems.filter((problem) => {
      if (typeof problem.rating !== "number" || problem.rating < min || problem.rating > max) return false;
      if (!problem.contestId || !problem.index || !problem.name) return false;
      if (!tags.length) return true;
      const problemTags = (problem.tags ?? []).map((tag) => tag.toLowerCase());
      return tags.some((tag) => problemTags.includes(tag));
    });

    // Random sample so repeat visits surface different problems.
    for (let i = matches.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [matches[i], matches[j]] = [matches[j], matches[i]];
    }

    return NextResponse.json(
      matches.slice(0, 30).map((problem) => ({
        contestId: problem.contestId,
        index: problem.index,
        name: problem.name,
        rating: problem.rating,
        tags: problem.tags ?? [],
        url: `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`,
      })),
    );
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch problemset" }, { status: 500 });
  }
}
