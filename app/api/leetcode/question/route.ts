import { NextRequest, NextResponse } from "next/server";
import { parseJsonResponse } from "@/app/utils/helpers";

const GRAPHQL_QUERY = `
query SearchQuestion($keyword: String!) {
  problemsetQuestionList: questionList(
    categorySlug: "algorithms"
    limit: 1
    skip: 0
    filters: { searchKeywords: $keyword }
  ) {
    questions: data {
      questionId
      questionFrontendId
      title
      titleSlug
      content
      difficulty
      likes
      dislikes
      acRate
      isPaidOnly
      hints
      exampleTestcases

      topicTags {
        name
        slug
      }

      codeSnippets {
        lang
        code
      }
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

    const data = await parseJsonResponse<Record<string, unknown>>(res, "https://leetcode.com/graphql");
    const graphData = data.data && typeof data.data === "object" ? data.data as Record<string, unknown> : {};
    const questionList = graphData.problemsetQuestionList && typeof graphData.problemsetQuestionList === "object" ? graphData.problemsetQuestionList as Record<string, unknown> : {};
    const questions = Array.isArray(questionList.questions) ? questionList.questions as Array<Record<string, unknown>> : [];
    const question = questions[0];

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json({
      questionId: question.questionFrontendId,
      title: question.title,
      content: question.content,
      description: question.content,
      difficulty: question.difficulty,
      hints: question.hints,
      acRate: question.acRate,
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
