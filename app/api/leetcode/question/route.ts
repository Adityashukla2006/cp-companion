import { NextRequest, NextResponse } from "next/server";

const GRAPHQL_QUERY = `
  query SearchQuestion($keyword: String!) {
    problemsetQuestionList: questionList(
      categorySlug: "algorithms"
      limit: 1
      skip: 0
      filters: { searchKeywords: $keyword }
    ) {
      questions: data {
        questionFrontendId
        title
        titleSlug
        difficulty
        acRate
        topicTags { name slug }
      }
    }
  }
`;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const questionNumber = searchParams.get("id");

  if (!questionNumber) {
    return NextResponse.json({ error: "Missing query param: id" }, { status: 400 });
  }

  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: GRAPHQL_QUERY, variables: { keyword: questionNumber } }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch question" }, { status: res.status });
    }

    const data = await res.json();
    const question = data.data?.problemsetQuestionList?.questions?.[0];

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json({
      questionId: question.questionFrontendId,
      title: question.title,
      titleSlug: question.titleSlug,
      difficulty: question.difficulty,
      acRate: question.acRate,
      topicTags: Array.isArray(question.topicTags) ? question.topicTags.map((item: { name: string }) => item.name) : [],
      problemUrl: `https://leetcode.com/problems/${question.titleSlug}/`,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch question" }, { status: 500 });
  }
}
