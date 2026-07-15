import { AlertTriangle, FileSearch } from "lucide-react";

import type { UnifiedContest } from "@/app/types";
import { PanelHead, Skeleton } from "../ui";
import type { DashboardState } from "../dashboard/types";
import { ConsistencyPanel } from "./ConsistencyPanel";
import { DifficultyHistogram } from "./DifficultyHistogram";
import { LeetcodeRatingChart } from "./LeetcodeRatingChart";
import { ReadinessCard } from "./ReadinessCard";
import { Recommendations } from "./Recommendations";
import {
  consistencyStats,
  difficultyBuckets,
  readinessScore,
  solveZoneInsight,
  tagStats,
  verdictBreakdown,
  weakTags,
} from "./stats";
import { TagRadar } from "./TagRadar";
import { VerdictBreakdown } from "./VerdictBreakdown";

export function AnalysisSection({
  data,
  contests,
  isLoading,
  nowSeconds,
}: {
  data: DashboardState;
  contests: UnifiedContest[];
  isLoading: boolean;
  nowSeconds: number | null;
}) {
  const submissions = data.codeforces?.recentSubmissions ?? [];
  const activity = data.leetcode?.activity ?? [];
  const cfRating = data.codeforces?.user?.rating ?? null;
  const lcHistory = data.leetcode?.profile?.contest?.contestHistory ?? [];

  const verdicts = verdictBreakdown(submissions);
  const buckets = difficultyBuckets(submissions);
  const tags = tagStats(submissions);
  const weak = weakTags(tags);
  const consistency = consistencyStats(activity);
  const zoneInsight = solveZoneInsight(buckets, cfRating);
  const readiness = readinessScore(submissions, activity, weak.length);

  if (isLoading) {
    return (
      <div className="section-stack">
        <div className="card panel"><Skeleton rows={4} /></div>
        <div className="card panel"><Skeleton rows={6} /></div>
        <div className="card panel"><Skeleton rows={6} /></div>
      </div>
    );
  }

  return (
    <div className="section-stack">
      <ReadinessCard readiness={readiness} contests={contests} nowSeconds={nowSeconds} />

      <div className="sect-head" data-reveal>
        <span className="badge cf">Codeforces</span>
        <h2>Problem-solving profile</h2>
      </div>

      <section className="split even">
        <article className="card panel" data-reveal>
          <PanelHead
            title="Topic strength"
            eyebrow="Solved vs unsolved by tag"
            action={weak.length ? (
              <span className="panel-action warn"><AlertTriangle size={14} /> Weak: {weak.slice(0, 2).join(", ")}</span>
            ) : undefined}
          />
          <TagRadar stats={tags} />
        </article>
        <article className="card panel" data-reveal>
          <PanelHead title="Difficulty distribution" eyebrow="Accepted problems by rating" />
          <DifficultyHistogram buckets={buckets} userRating={cfRating} />
          {zoneInsight && <p className="insight-line" style={{ marginTop: 14 }}>{zoneInsight}</p>}
        </article>
      </section>

      <section className="split">
        <article className="card panel" data-reveal>
          <PanelHead title="Practice picks" eyebrow="From the CF problemset" />
          <Recommendations userRating={cfRating} weakTags={weak} submissions={submissions} />
        </article>
        <article className="card panel" data-reveal>
          <PanelHead title="Verdict breakdown" eyebrow="Recent submissions" />
          <VerdictBreakdown slices={verdicts} />
        </article>
      </section>

      <article className="analysis-card tone-cf" data-reveal style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span className="stat-ic" style={{ marginBottom: 0, flexShrink: 0 }}><FileSearch size={18} /></span>
        <div>
          <h3>Codeforces parser — coming soon</h3>
          <p>Auto-import problem statements, constraints, and samples straight from a contest URL.</p>
        </div>
      </article>

      <div className="sect-head" data-reveal>
        <span className="badge lc">LeetCode</span>
        <h2>Contest form & rhythm</h2>
      </div>

      <section className="split">
        <article className="card panel" data-reveal>
          <PanelHead title="Contest rating" eyebrow="Rating per attended contest" />
          <LeetcodeRatingChart history={lcHistory} />
        </article>
        <article className="card panel" data-reveal>
          <PanelHead title="Consistency" eyebrow="Practice rhythm" />
          <ConsistencyPanel stats={consistency} />
        </article>
      </section>
    </div>
  );
}
