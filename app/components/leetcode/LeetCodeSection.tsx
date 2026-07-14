import { CheckCircle2, Medal, Trophy } from "lucide-react";

import { RecentActivity } from "../activity/Feed";
import { ActivityHeatmap } from "../charts/ActivityHeatmap";
import { PanelHead, Skeleton, StatTile } from "../ui";
import type { DashboardState } from "../dashboard/types";
import { DailyProblemPanel } from "./DailyProblem";
import { ProblemSearch } from "./ProblemSearch";
import { LeetCodeProblems } from "./SavedProblems";

export function LeetCodeSection({ data, isLoading }: { data: DashboardState; isLoading: boolean }) {
  const lcProfile = data.leetcode?.profile;
  const lcStats = lcProfile?.problemStats;
  const lcContest = lcProfile?.contest;
  const lcRating = lcContest?.contestRating ? Math.round(lcContest.contestRating) : null;

  return (
    <div className="section-stack">
      <section className="split">
        <div className="section-stack">
          <DailyProblemPanel data={data.leetcode} isLoading={isLoading} />
          <ProblemSearch />
        </div>

        <aside className="stat-col" data-reveal>
          {isLoading ? (
            <>
              <div className="card sk sk-block" />
              <div className="card sk sk-block" />
              <div className="card sk sk-block" />
            </>
          ) : (
            <>
              <StatTile
                label="Contest rating"
                value={lcRating}
                help={lcContest?.contestGlobalRanking ? `Global rank ${lcContest.contestGlobalRanking.toLocaleString()}` : null}
                icon={Trophy}
                tone="lc"
              />
              <StatTile
                label="Problems solved"
                value={lcStats?.solvedProblem ?? null}
                help={`${lcStats?.easySolved ?? 0} easy · ${lcStats?.mediumSolved ?? 0} med · ${lcStats?.hardSolved ?? 0} hard`}
                icon={CheckCircle2}
                tone="green"
              />
              <StatTile
                label="Contests attended"
                value={lcContest?.contestAttend ?? null}
                help={lcProfile?.ranking ? `Profile rank ${lcProfile.ranking.toLocaleString()}` : null}
                icon={Medal}
                tone="cyan"
              />
            </>
          )}
        </aside>
      </section>

      <LeetCodeProblems />

      <section className="split even">
        <article className="card panel" data-reveal>
          <PanelHead title="Recent accepted" eyebrow="LeetCode submissions" />
          {isLoading ? <Skeleton rows={5} /> : <RecentActivity codeforces={data.codeforces} leetcode={data.leetcode} platform="leetcode" />}
        </article>
        <article className="card panel" data-reveal>
          <PanelHead title="Activity" eyebrow="Solve momentum" />
          {isLoading ? <Skeleton rows={5} /> : <ActivityHeatmap data={data.leetcode} />}
        </article>
      </section>
    </div>
  );
}
