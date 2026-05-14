import { NextResponse } from "next/server";

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

    const data = await res.json();
    const question = data.data?.question;

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json({
      questionId: question.questionFrontendId,
      title: question.title,
      titleSlug: question.titleSlug,
      difficulty: question.difficulty,
      content: question.content,
      topicTags: Array.isArray(question.topicTags) ? question.topicTags.map((item: { name: string }) => item.name) : [],
      problemUrl: `https://leetcode.com/problems/${question.titleSlug}/`,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch question" }, { status: 500 });
  }
}
