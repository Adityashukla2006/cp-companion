export interface RawTopicTag {
  name?: string;
  slug?: string;
}

export interface RawSubmission {
  title?: string;
  titleSlug?: string;
  statusDisplay?: string;
  timestamp?: number | string;
  lang?: string;
}

export interface LeetcodeContestStats {
  contestAttend: number | null;
  contestRating: number | null;
  contestBadges: string[];
  contestGlobalRanking: number | null;
}

export interface LeetcodeStats {
  solvedProblem: number | null;
  easySolved: number | null;
  mediumSolved: number | null;
  hardSolved: number | null;
}

export interface LeetcodeProfile {
  about: string | null;
  avatar: string | null;
  name: string | null;
  ranking: number | null;
  skillTags: string[];
  contest: LeetcodeContestStats;
  problemStats: LeetcodeStats;
}

export interface LeetcodeSubmission {
  title: string;
  titleSlug: string | null;
  statusDisplay: string;
  timestamp: number;
  lang: string;
  url: string | null;
}

export interface LeetcodeDailyQuestion {
  questionLink: string;
  date: string;
  questionId: string;
  questionTitle: string;
  difficulty: string;
  topics: string[];
}

export interface LeetcodeContest {
  title: string;
  titleSlug: string | null;
  startTime: number | null;
  duration: number | null;
  url: string | null;
}

export interface LeetcodeActivityDay {
  date: string;
  count: number;
}

export interface LeetcodeQuestionSearchResult {
  questionId: string;
  title: string;
  titleSlug: string;
  difficulty: string;
  acRate?: number | null;
  topicTags: string[];
  problemUrl: string;
  content?: string | null;
  hints?: string[];
}

export interface LeetcodeDashboard {
  username: string;
  profile: LeetcodeProfile | null;
  submissions: LeetcodeSubmission[];
  dailyQuestion: LeetcodeDailyQuestion | null;
  upcomingContests: LeetcodeContest[];
  activity: LeetcodeActivityDay[];
  fetchedAt: string;
}

export interface CodeforcesUser {
  handle: string;
  rating: number | null;
  maxRating: number | null;
  rank: string | null;
  maxRank: string | null;
  avatar: string | null;
  titlePhoto: string | null;
}

export interface CodeforcesRatingChange {
  contestId: number;
  contestName: string;
  handle: string;
  rank: number;
  ratingUpdateTimeSeconds: number;
  oldRating: number;
  newRating: number;
}

export interface CodeforcesContest {
  id: number;
  name: string;
  type: string;
  phase: string;
  startTimeSeconds: number | null;
  durationSeconds: number | null;
  platform: "Codeforces";
  url: string;
}

export interface CodeforcesProblem {
  contestId?: number;
  index?: string;
  name?: string;
  type?: string;
  rating?: number;
  tags?: string[];
}

export interface CodeforcesSubmission {
  id: number;
  contestId?: number;
  creationTimeSeconds: number;
  relativeTimeSeconds?: number;
  problem: CodeforcesProblem;
  programmingLanguage?: string;
  verdict?: string;
}

export interface CodeforcesDashboard {
  username: string;
  user: CodeforcesUser | null;
  ratingHistory: CodeforcesRatingChange[];
  upcomingContests: CodeforcesContest[];
  recentSubmissions: CodeforcesSubmission[];
  solvedCount: number;
}

export interface UnifiedContest {
  id: string;
  name: string;
  platform: "Codeforces" | "LeetCode";
  startTimeSeconds: number | null;
  durationSeconds: number | null;
  url: string | null;
}
