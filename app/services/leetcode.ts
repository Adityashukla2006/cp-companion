import {
  LeetcodeActivityDay,
  LeetcodeContest,
  LeetcodeDashboard,
  LeetcodeDailyQuestion,
  LeetcodeProfile,
  LeetcodeQuestionSearchResult,
  LeetcodeSubmission,
  RawSubmission,
} from "../types";
import { fetchJson, getTopicNames, slugFromTitle, toNumberOrNull, toStringArray } from "@/app/utils/helpers";

const normalizeSubmission = (submission: RawSubmission): LeetcodeSubmission => {
  const title = submission.title ?? "";
  const titleSlug = submission.titleSlug ?? (title ? slugFromTitle(title) : null);

  return {
    title,
    titleSlug,
    statusDisplay: submission.statusDisplay ?? "",
    timestamp: toNumberOrNull(submission.timestamp) ?? 0,
    lang: submission.lang ?? "",
    url: titleSlug ? `https://leetcode.com/problems/${titleSlug}/` : null,
  };
};

const buildActivity = (submissions: LeetcodeSubmission[]): LeetcodeActivityDay[] => {
  const counts = submissions.reduce<Map<string, number>>((acc, submission) => {
    if (!submission.timestamp) {
      return acc;
    }

    const date = new Date(submission.timestamp * 1000).toISOString().split("T")[0];
    acc.set(date, (acc.get(date) ?? 0) + 1);
    return acc;
  }, new Map());

  return Array.from(counts.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

export const leetcodeUserData = async (username: string): Promise<LeetcodeProfile> => {
  const data = await fetchJson<Record<string, unknown>>(`/api/leetcode/user/${encodeURIComponent(username)}`);
  const contestData = data.contest && typeof data.contest === "object" ? data.contest as Record<string, unknown> : {};
  const solvedData = data.problemStats && typeof data.problemStats === "object" ? data.problemStats as Record<string, unknown> : {};

  return {
    about: typeof data.about === "string" ? data.about : null,
    avatar: typeof data.avatar === "string" ? data.avatar : null,
    name: typeof data.name === "string" ? data.name : null,
    ranking: toNumberOrNull(data.ranking),
    skillTags: toStringArray(data.skillTags),
    contest: {
      contestRating: toNumberOrNull(contestData.contestRating),
      contestGlobalRanking: toNumberOrNull(contestData.contestGlobalRanking),
      contestAttend: toNumberOrNull(contestData.contestAttend),
      contestBadges: toStringArray(contestData.contestBadges),
    },
    problemStats: {
      solvedProblem: toNumberOrNull(solvedData.solvedProblem),
      easySolved: toNumberOrNull(solvedData.easySolved),
      mediumSolved: toNumberOrNull(solvedData.mediumSolved),
      hardSolved: toNumberOrNull(solvedData.hardSolved),
    },
  };
};

export const leetcodeUserSubmissions = async (username: string): Promise<LeetcodeSubmission[]> => {
  const data = await fetchJson<RawSubmission[]>(`/api/leetcode/user/${encodeURIComponent(username)}/submissions`);
  return Array.isArray(data) ? data.map(normalizeSubmission) : [];
};

export const leetcodeDailyQuestion = async (): Promise<LeetcodeDailyQuestion> => {
  const data = await fetchJson<Record<string, unknown>>("/api/leetcode/daily");

  return {
    questionLink: typeof data.questionLink === "string" ? data.questionLink : "",
    date: typeof data.date === "string" ? data.date : "",
    questionId: String(data.questionId ?? ""),
    questionTitle: typeof data.questionTitle === "string" ? data.questionTitle : "",
    difficulty: typeof data.difficulty === "string" ? data.difficulty : "",
    topics: Array.isArray(data.topics) ? toStringArray(data.topics) : getTopicNames(data.topicTags),
  };
};

export const leetcodeUpcomingContests = async (): Promise<LeetcodeContest[]> => {
  const data = await fetchJson<Array<Record<string, unknown>>>("/api/leetcode/contests/upcoming");

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((contest) => {
    const titleSlug = typeof contest.titleSlug === "string" ? contest.titleSlug : null;

    return {
      title: typeof contest.title === "string" ? contest.title : "",
      titleSlug,
      startTime: toNumberOrNull(contest.startTime),
      duration: toNumberOrNull(contest.duration),
      url: titleSlug ? `https://leetcode.com/contest/${titleSlug}/` : null,
    };
  });
};

const normalizeQuestion = (question: Record<string, unknown>): LeetcodeQuestionSearchResult => {
  const titleSlug = String(question.titleSlug ?? "");

  return {
    questionId: String(question.questionId ?? question.questionNumber ?? ""),
    title: String(question.title ?? ""),
    titleSlug,
    difficulty: String(question.difficulty ?? ""),
    acRate: toNumberOrNull(question.acRate),
    topicTags: Array.isArray(question.topicTags) ? toStringArray(question.topicTags) : getTopicNames(question.topicTags),
    problemUrl: typeof question.problemUrl === "string" ? question.problemUrl : `https://leetcode.com/problems/${titleSlug}/`,
    content: typeof question.content === "string" ? question.content : typeof question.description === "string" ? question.description : null,
    hints: toStringArray(question.hints),
  };
};

export const leetcodeSearchQuestionFromID = async (
  questionNumber: string
): Promise<LeetcodeQuestionSearchResult> => {
  const data = await fetchJson<Record<string, unknown>>(`/api/leetcode/question?id=${encodeURIComponent(questionNumber)}`);
  return normalizeQuestion(data);
};

export const leetcodeSearchQuestionFromSlug = async (
  titleSlug: string
): Promise<LeetcodeQuestionSearchResult> => {
  const data = await fetchJson<Record<string, unknown>>(`/api/leetcode/question/${encodeURIComponent(titleSlug)}`);
  return normalizeQuestion(data);
};

export const leetcodeDashboard = async (username: string): Promise<LeetcodeDashboard> => {
  const [profile, submissions, dailyQuestion, upcomingContests] = await Promise.all([
    leetcodeUserData(username),
    leetcodeUserSubmissions(username),
    leetcodeDailyQuestion(),
    leetcodeUpcomingContests(),
  ]);

  return {
    username,
    profile,
    submissions,
    dailyQuestion,
    upcomingContests,
    activity: buildActivity(submissions),
    fetchedAt: new Date().toISOString(),
  };
};
