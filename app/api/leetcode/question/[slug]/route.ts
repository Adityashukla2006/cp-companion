import { NextResponse } from "next/server";
import { parseJsonResponse } from "@/app/utils/helpers";

const GRAPHQL_QUERY = `
  query getQuestion($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionFrontendId
      title
      titleSlug
      difficulty
      content
      topicTags { name slug }
    }
  }
`;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json({ error: "Missing route param: slug" }, { status: 400 });
  }

  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: GRAPHQL_QUERY, variables: { titleSlug: slug } }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch question" }, { status: res.status });
    }

    const data = await parseJsonResponse<Record<string, unknown>>(res, "https://leetcode.com/graphql");
    const graphData = data.data && typeof data.data === "object" ? data.data as Record<string, unknown> : {};
    const question = graphData.question && typeof graphData.question === "object" ? graphData.question as Record<string, unknown> : null;

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json({
      questionId: question.questionFrontendId,
      title: question.title,
      titleSlug: question.titleSlug,
      difficulty: question.difficulty,
      content: question.content,
      topicTags: Array.isArray(question.topicTags)
        ? question.topicTags
          .map((item) => typeof item === "object" && item ? (item as { name?: string }).name : null)
          .filter((name): name is string => Boolean(name))
        : [],
      problemUrl: `https://leetcode.com/problems/${question.titleSlug}/`,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch question" }, { status: 500 });
  }
}
