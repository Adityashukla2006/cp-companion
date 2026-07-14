import { Swords, TrendingUp } from "lucide-react";

import type { UnifiedContest } from "@/app/types";
import { ContestSpotlight } from "../contests/Contests";
import { StatTile } from "../ui";
import type { DashboardState } from "./types";

export function OverviewSection({
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
  const cfUser = data.codeforces?.user;
  const lcContest = data.leetcode?.profile?.contest;

  return (
    <div className="section-stack">
      <ContestSpotlight contests={contests} isLoading={isLoading} nowSeconds={nowSeconds} />

      <section className="stat-row two" data-reveal>
        {isLoading ? (
          <>
            <div className="card sk sk-block" />
            <div className="card sk sk-block" />
          </>
        ) : (
          <>
            <StatTile label="Codeforces rating" value={cfUser?.rating ?? null} help={cfUser?.rank ?? "Unrated"} icon={Swords} tone="cf" />
            <StatTile
              label="LeetCode rating"
              value={lcContest?.contestRating ? Math.round(lcContest.contestRating) : null}
              help={lcContest?.contestAttend ? `${lcContest.contestAttend} contests attended` : "No contests yet"}
              icon={TrendingUp}
              tone="lc"
            />
          </>
        )}
      </section>
    </div>
  );
}
