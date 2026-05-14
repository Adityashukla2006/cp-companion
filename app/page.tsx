"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Code2,
  ExternalLink,
  Loader2,
  RefreshCcw,
  Sparkles,
  Trophy,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CODEFORCES_USERNAME, codeforcesDashboard } from "./services/codeforces";
import { leetcodeDashboard } from "./services/leetcode";
import {
  CodeforcesDashboard,
  CodeforcesRatingChange,
  CodeforcesSubmission,
  LeetcodeDashboard,
  UnifiedContest,
} from "./types";
import { formatCountdown, formatDate, formatDateTime, formatDuration, formatInteger } from "./utils/helpers";

const LEETCODE_USERNAME = "adityas_140";

type DashboardState = {
  codeforces: CodeforcesDashboard | null;
  leetcode: LeetcodeDashboard | null;
};

const emptyState: DashboardState = {
  codeforces: null,
  leetcode: null,
};

const displayValue = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === "") {
    return "--";
  }

  return value;
};

const difficultyClass = (difficulty: string) => `difficulty ${difficulty.toLowerCase()}`;

function StatCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string | number | null | undefined;
  helper?: string | null;
  icon: React.ElementType;
}) {
  return (
    <article className="stat-card">
      <div className="stat-icon">
        <Icon size={19} />
      </div>
      <div>
        <p className="label">{label}</p>
        <strong>{displayValue(value)}</strong>
        {helper && <span>{helper}</span>}
      </div>
    </article>
  );
}

function PanelHeader({ title, eyebrow }: { title: string; eyebrow?: string | null }) {
  return (
    <div className="panel-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
      </div>
    </div>
  );
}

function Skeleton({ rows = 1 }: { rows?: number }) {
  return (
    <div className="skeleton-stack">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="skeleton-line" />
      ))}
    </div>
  );
}

function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="error-notice">
      <AlertCircle size={18} />
      <span>{message}</span>
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="empty-state">{children}</div>;
}

function RatingChart({ history }: { history: CodeforcesRatingChange[] }) {
  const chartData = history.map((item, index) => ({
    index: index + 1,
    rating: item.newRating,
    contest: item.contestName,
    date: formatDate(item.ratingUpdateTimeSeconds),
    delta: item.newRating - item.oldRating,
  }));

  if (!chartData.length) {
    return <EmptyState>Codeforces rating history is not available yet.</EmptyState>;
  }

  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={286}>
        <AreaChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="ratingFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="index" tickLine={false} axisLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} width={42} />
          <Tooltip
            cursor={{ stroke: "#c7d2fe", strokeWidth: 1 }}
            contentStyle={{
              border: "1px solid #e5e7eb",
              borderRadius: 16,
              boxShadow: "0 18px 50px rgba(15, 23, 42, 0.12)",
              color: "#111827",
            }}
            formatter={(value, name, props) => [value, name === "rating" ? `Rating (${props.payload.delta >= 0 ? "+" : ""}${props.payload.delta})` : name]}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.contest ?? "Contest"}
          />
          <Area type="monotone" dataKey="rating" stroke="#4f46e5" strokeWidth={3} fill="url(#ratingFill)" dot={false} activeDot={{ r: 5, fill: "#4f46e5", stroke: "#ffffff", strokeWidth: 3 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function DailyProblem({ data }: { data: LeetcodeDashboard | null }) {
  const daily = data?.dailyQuestion;

  if (!daily) {
    return <Skeleton rows={4} />;
  }

  return (
    <article className="daily-card">
      <div>
        <div className="card-topline">
          <span className={difficultyClass(daily.difficulty)}>{daily.difficulty}</span>
          <span className="muted">#{daily.questionId}</span>
        </div>
        <h3>{daily.questionTitle}</h3>
        <div className="topic-row">
          {daily.topics.map((topic) => (
            <span key={topic}>{topic}</span>
          ))}
        </div>
      </div>
      <a href={daily.questionLink} target="_blank" rel="noreferrer" className="primary-link">
        Solve today
        <ArrowUpRight size={16} />
      </a>
    </article>
  );
}

function ContestList({ contests }: { contests: UnifiedContest[] }) {
  if (!contests.length) {
    return <EmptyState>No upcoming contests returned by the APIs.</EmptyState>;
  }

  return (
    <div className="contest-list">
      {contests.map((contest) => (
        <a key={contest.id} href={contest.url ?? undefined} target="_blank" rel="noreferrer" className="contest-card">
          <div className="contest-platform">{contest.platform}</div>
          <div>
            <h3>{contest.name}</h3>
            <p>{formatDateTime(contest.startTimeSeconds)} · {formatDuration(contest.durationSeconds)}</p>
          </div>
          <span className="countdown">{formatCountdown(contest.startTimeSeconds)}</span>
        </a>
      ))}
    </div>
  );
}

function RecentActivity({ codeforces, leetcode }: { codeforces: CodeforcesDashboard | null; leetcode: LeetcodeDashboard | null }) {
  const cfSolved = (codeforces?.recentSubmissions ?? [])
    .filter((submission) => submission.verdict === "OK")
    .slice(0, 5);
  const lcAccepted = (leetcode?.submissions ?? [])
    .filter((submission) => submission.statusDisplay === "Accepted")
    .slice(0, 5);

  if (!cfSolved.length && !lcAccepted.length) {
    return <EmptyState>No accepted submissions were returned yet.</EmptyState>;
  }

  return (
    <div className="activity-list">
      {cfSolved.map((submission) => (
        <ActivityRow
          key={`cf-${submission.id}`}
          title={submission.problem.name ?? "Codeforces problem"}
          meta={`Codeforces · ${submission.programmingLanguage ?? "Language unavailable"}`}
          timestamp={submission.creationTimeSeconds}
          href={codeforcesProblemUrl(submission)}
        />
      ))}
      {lcAccepted.map((submission) => (
        <ActivityRow
          key={`lc-${submission.title}-${submission.timestamp}`}
          title={submission.title}
          meta={`LeetCode · ${submission.lang}`}
          timestamp={submission.timestamp}
          href={submission.url}
        />
      ))}
    </div>
  );
}

function ActivityRow({ title, meta, timestamp, href }: { title: string; meta: string; timestamp: number; href: string | null }) {
  const content = (
    <>
      <div className="activity-check"><CheckCircle2 size={16} /></div>
      <div>
        <h3>{title}</h3>
        <p>{meta} · {formatDateTime(timestamp)}</p>
      </div>
      <ExternalLink size={15} className="activity-link-icon" />
    </>
  );

  if (href) {
    return <a href={href} target="_blank" rel="noreferrer" className="activity-row">{content}</a>;
  }

  return <div className="activity-row">{content}</div>;
}

const codeforcesProblemUrl = (submission: CodeforcesSubmission) => {
  if (!submission.problem.contestId || !submission.problem.index) {
    return null;
  }

  return `https://codeforces.com/contest/${submission.problem.contestId}/problem/${submission.problem.index}`;
};

export default function Home() {
  const [data, setData] = useState<DashboardState>(emptyState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      codeforcesDashboard(),
      leetcodeDashboard(LEETCODE_USERNAME),
    ]).then((results) => {
      if (!active) {
        return;
      }

      const [codeforcesResult, leetcodeResult] = results;
      setData({
        codeforces: codeforcesResult.status === "fulfilled" ? codeforcesResult.value : null,
        leetcode: leetcodeResult.status === "fulfilled" ? leetcodeResult.value : null,
      });

      const rejected = results.find((result) => result.status === "rejected");
      setError(rejected?.status === "rejected" ? rejected.reason?.message ?? "Some dashboard data could not be loaded." : null);
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, [refreshToken]);

  const contests = useMemo<UnifiedContest[]>(() => {
    const codeforcesContests: UnifiedContest[] = (data.codeforces?.upcomingContests ?? []).map((contest) => ({
      id: `cf-${contest.id}`,
      name: contest.name,
      platform: "Codeforces",
      startTimeSeconds: contest.startTimeSeconds,
      durationSeconds: contest.durationSeconds,
      url: contest.url,
    }));

    const leetcodeContests: UnifiedContest[] = (data.leetcode?.upcomingContests ?? []).map((contest) => ({
      id: `lc-${contest.titleSlug ?? contest.title}`,
      name: contest.title,
      platform: "LeetCode",
      startTimeSeconds: contest.startTime,
      durationSeconds: contest.duration,
      url: contest.url,
    }));

    return [...codeforcesContests, ...leetcodeContests]
      .filter((contest) => contest.startTimeSeconds)
      .sort((a, b) => (a.startTimeSeconds ?? 0) - (b.startTimeSeconds ?? 0))
      .slice(0, 6);
  }, [data]);

  const cfUser = data.codeforces?.user;
  const lcProfile = data.leetcode?.profile;
  const lcStats = lcProfile?.problemStats;
  const lcContest = lcProfile?.contest;
  const cfRating = cfUser?.rating ?? null;
  const lcRating = lcContest?.contestRating ? Math.round(lcContest.contestRating) : null;
  const biggestJump = useMemo(() => {
    const history = data.codeforces?.ratingHistory ?? [];
    return history.reduce<number | null>((best, item) => {
      const jump = item.newRating - item.oldRating;
      return best === null || jump > best ? jump : best;
    }, null);
  }, [data.codeforces?.ratingHistory]);

  const refresh = () => {
    setIsLoading(true);
    setError(null);
    setRefreshToken((value) => value + 1);
  };

  return (
    <main className="page-shell">
      <nav className="topbar">
        <div className="brand">
          <div className="brand-icon"><Code2 size={19} /></div>
          <div>
            <strong>CP Companion</strong>
            <span>{CODEFORCES_USERNAME}</span>
          </div>
        </div>
        <button className="ghost-button" onClick={refresh} disabled={isLoading}>
          {isLoading ? <Loader2 size={16} className="spin" /> : <RefreshCcw size={16} />}
          Refresh
        </button>
      </nav>

      <section className="hero-section">
        <div>
          <p className="eyebrow">Personal practice dashboard</p>
          <h1>Stay steady. Track the next solve.</h1>
          <p className="hero-copy">A calm view of ratings, contests, daily practice, and recent accepted work across Codeforces and LeetCode.</p>
        </div>
        <div className="hero-note">
          <Sparkles size={18} />
          <span>{contests[0]?.name ? `Next up: ${contests[0].name}` : "No upcoming contest loaded yet"}</span>
        </div>
      </section>

      {error && <ErrorNotice message={error} />}

      <section className="stats-grid">
        {isLoading ? (
          <>
            <Skeleton rows={2} />
            <Skeleton rows={2} />
            <Skeleton rows={2} />
            <Skeleton rows={2} />
          </>
        ) : (
          <>
            <StatCard label="Codeforces rating" value={formatInteger(cfRating)} helper={cfUser?.rank ?? null} icon={Trophy} />
            <StatCard label="LeetCode rating" value={formatInteger(lcRating)} helper={lcContest?.contestGlobalRanking ? `Global rank ${formatInteger(lcContest.contestGlobalRanking)}` : null} icon={Activity} />
            <StatCard label="LeetCode solved" value={formatInteger(lcStats?.solvedProblem)} helper={`${displayValue(formatInteger(lcStats?.easySolved))} easy · ${displayValue(formatInteger(lcStats?.mediumSolved))} medium · ${displayValue(formatInteger(lcStats?.hardSolved))} hard`} icon={CheckCircle2} />
            <StatCard label="Best CF jump" value={biggestJump !== null ? `+${biggestJump}` : null} helper={cfUser?.maxRating ? `Max ${formatInteger(cfUser.maxRating)}` : null} icon={ArrowUpRight} />
          </>
        )}
      </section>

      <section className="main-grid">
        <article className="panel chart-panel">
          <PanelHeader title="Codeforces rating growth" eyebrow="Progress" />
          {isLoading ? <Skeleton rows={6} /> : <RatingChart history={data.codeforces?.ratingHistory ?? []} />}
        </article>

        <article className="panel daily-panel">
          <PanelHeader title="Today’s LeetCode" eyebrow="Daily consistency" />
          <DailyProblem data={data.leetcode} />
        </article>
      </section>

      <section className="lower-grid">
        <article className="panel">
          <PanelHeader title="Upcoming contests" eyebrow="Plan ahead" />
          {isLoading ? <Skeleton rows={5} /> : <ContestList contests={contests} />}
        </article>

        <article className="panel">
          <PanelHeader title="Recent accepted work" eyebrow="Momentum" />
          {isLoading ? <Skeleton rows={5} /> : <RecentActivity codeforces={data.codeforces} leetcode={data.leetcode} />}
        </article>
      </section>

      <section className="footer-strip">
        <div>
          <Clock3 size={17} />
          <span>Contest times are shown in your local timezone.</span>
        </div>
        <div>
          <CalendarDays size={17} />
          <span>Codeforces handle: {CODEFORCES_USERNAME}</span>
        </div>
      </section>
    </main>
  );
}
