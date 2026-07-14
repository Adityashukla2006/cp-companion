import { Activity, ArrowUpRight, CheckCircle2, Code2, Medal, Trophy, User } from "lucide-react";

import { EmptyState, PanelHead, Skeleton, StatTile } from "../ui";
import type { DashboardState } from "../dashboard/types";

export function ProfileSection({ data, isLoading }: { data: DashboardState; isLoading: boolean }) {
  const cfUser = data.codeforces?.user;
  const leetcodeUsername = data.leetcode?.username ?? "";
  const codeforcesUsername = data.codeforces?.username ?? cfUser?.handle ?? "";
  const lcProfile = data.leetcode?.profile;
  const lcStats = lcProfile?.problemStats;
  const lcContest = lcProfile?.contest;
  const cfRecent = data.codeforces?.recentSubmissions ?? [];
  const cfAccepted = cfRecent.filter((submission) => submission.verdict === "OK").length;

  if (isLoading) {
    return <div className="card panel"><Skeleton rows={8} /></div>;
  }

  const solved = lcStats?.solvedProblem ?? 0;
  const breakdown = [
    { label: "Easy", count: lcStats?.easySolved ?? 0, tone: "var(--success)" },
    { label: "Medium", count: lcStats?.mediumSolved ?? 0, tone: "var(--lc)" },
    { label: "Hard", count: lcStats?.hardSolved ?? 0, tone: "var(--danger)" },
  ];

  const cfRows = [
    { label: "Current rank", value: cfUser?.rank ?? "Unrated" },
    { label: "Current rating", value: cfUser?.rating?.toLocaleString() ?? "—" },
    { label: "Max rank", value: cfUser?.maxRank ?? "—" },
    { label: "Max rating", value: cfUser?.maxRating?.toLocaleString() ?? "—" },
    { label: "Recent accepted", value: `${cfAccepted} of last ${cfRecent.length}` },
  ];

  return (
    <div className="section-stack">
      <section className="profile-hero" data-reveal>
        <div className="avatars">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {lcProfile?.avatar ? <img src={lcProfile.avatar} alt="LeetCode avatar" /> : <div className="fallback"><User size={26} /></div>}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {cfUser?.titlePhoto ? <img src={cfUser.titlePhoto} alt="Codeforces avatar" /> : <div className="fallback"><Code2 size={26} /></div>}
        </div>
        <div className="profile-id">
          <p className="eyebrow" style={{ color: "var(--accent-ink)", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", fontSize: 11 }}>Profile</p>
          <h2>{lcProfile?.name || codeforcesUsername}</h2>
          {lcProfile?.about && <p className="profile-about">{lcProfile.about}</p>}
          <div className="handle-row">
            <span className="badge lc">LeetCode · {leetcodeUsername}</span>
            <span className="badge cf">Codeforces · {codeforcesUsername}</span>
            {cfUser?.rank && <span className="pill">{cfUser.rank}</span>}
          </div>
        </div>
        <div className="profile-links">
          <a href={`https://leetcode.com/u/${leetcodeUsername}/`} target="_blank" rel="noreferrer" className="btn btn-ghost">
            LeetCode <ArrowUpRight size={15} />
          </a>
          <a href={`https://codeforces.com/profile/${codeforcesUsername}`} target="_blank" rel="noreferrer" className="btn btn-ghost">
            Codeforces <ArrowUpRight size={15} />
          </a>
        </div>
      </section>

      <section className="stat-row" data-reveal>
        <StatTile
          label="LeetCode rating"
          value={lcContest?.contestRating ? Math.round(lcContest.contestRating) : null}
          help={lcContest?.contestGlobalRanking ? `Global rank ${lcContest.contestGlobalRanking.toLocaleString()}` : null}
          icon={Trophy}
          tone="lc"
        />
        <StatTile
          label="Codeforces rating"
          value={cfUser?.rating ?? null}
          help={cfUser?.maxRating ? `Max ${cfUser.maxRating}` : null}
          icon={Medal}
          tone="cf"
        />
        <StatTile
          label="Problems solved"
          value={lcStats?.solvedProblem ?? null}
          help="LeetCode lifetime"
          icon={CheckCircle2}
          tone="green"
        />
        <StatTile
          label="Contests attended"
          value={lcContest?.contestAttend ?? null}
          help="LeetCode contests"
          icon={Activity}
          tone="cyan"
        />
      </section>

      <section className="split even">
        <article className="card panel" data-reveal>
          <PanelHead title="Difficulty breakdown" eyebrow="LeetCode solves" />
          {solved ? (
            <div className="bar-list">
              {breakdown.map(({ label, count, tone }) => (
                <div key={label} className="bar-row">
                  <span className="bar-label">{label}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${Math.max(2, Math.round((count / solved) * 100))}%`, background: tone }} />
                  </div>
                  <span className="bar-count">{count}</span>
                </div>
              ))}
              <p className="bar-total">{solved} problems solved in total</p>
            </div>
          ) : (
            <EmptyState>No LeetCode solve data yet.</EmptyState>
          )}
        </article>

        <article className="card panel" data-reveal>
          <PanelHead title="Codeforces standing" eyebrow={codeforcesUsername || "Codeforces"} />
          {cfUser ? (
            <dl className="kv-list">
              {cfRows.map(({ label, value }) => (
                <div key={label} className="kv-row">
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <EmptyState>No Codeforces profile data yet.</EmptyState>
          )}
        </article>
      </section>

      {(lcProfile?.skillTags?.length ?? 0) > 0 && (
        <article className="card panel" data-reveal>
          <PanelHead title="Skills" eyebrow="From LeetCode profile" />
          <div className="topics">
            {lcProfile!.skillTags.map((tag) => (
              <span key={tag} className="chip">{tag}</span>
            ))}
          </div>
        </article>
      )}
    </div>
  );
}
