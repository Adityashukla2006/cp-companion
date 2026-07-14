import { ArrowUpRight, CalendarDays, Clock3 } from "lucide-react";

import type { UnifiedContest } from "@/app/types";
import { formatDateTime, formatDuration } from "@/app/utils/helpers";
import { EmptyState, PanelHead, PlatformBadge, Skeleton } from "../ui";
import { countdownParts, formatCountdownFrom } from "../dashboard/utils";

export function ContestSpotlight({
  contests,
  isLoading,
  nowSeconds,
}: {
  contests: UnifiedContest[];
  isLoading: boolean;
  nowSeconds: number | null;
}) {
  if (isLoading) {
    return (
      <section className="card panel">
        <PanelHead title="Upcoming contests" eyebrow="Contest calendar" />
        <Skeleton rows={5} />
      </section>
    );
  }

  const next = contests[0];
  const leetcode = contests.filter((contest) => contest.platform === "LeetCode");
  const codeforces = contests.filter((contest) => contest.platform === "Codeforces");

  return (
    <section className="contest-wrap">
      {!contests.length ? (
        <div className="card panel">
          <PanelHead title="Upcoming contests" eyebrow="Contest calendar" />
          <EmptyState>No upcoming contests were returned by the APIs.</EmptyState>
        </div>
      ) : (
        <>
          {next && <ContestHero contest={next} nowSeconds={nowSeconds} />}
          <div className="contest-cols">
            <ContestColumn title="LeetCode" contests={leetcode} nowSeconds={nowSeconds} />
            <ContestColumn title="Codeforces" contests={codeforces} nowSeconds={nowSeconds} />
          </div>
        </>
      )}
    </section>
  );
}

function ContestHero({ contest, nowSeconds }: { contest: UnifiedContest; nowSeconds: number | null }) {
  const { days, hours, minutes, isLive } = countdownParts(contest.startTimeSeconds, nowSeconds);

  const inner = (
    <>
      <div>
        <div className="hero-badges">
          <PlatformBadge platform={contest.platform} />
          <span className={`pill ${isLive ? "live" : "ready"}`}>{isLive ? "Live now" : "Next up"}</span>
        </div>
        <h3>{contest.name}</h3>
        <div className="contest-when">
          <span><CalendarDays size={16} /> {formatDateTime(contest.startTimeSeconds)}</span>
          <span><Clock3 size={16} /> {formatDuration(contest.durationSeconds)}</span>
          {contest.url && <span className="link" style={{ padding: 0 }}>Register <ArrowUpRight size={15} /></span>}
        </div>
      </div>
      <div className="countdown">
        <span className="countdown-label">{isLive ? "Happening now" : "Starts in"}</span>
        <div className="count-seg"><strong>{days}</strong><span>Days</span></div>
        <span className="count-sep">:</span>
        <div className="count-seg"><strong>{hours}</strong><span>Hours</span></div>
        <span className="count-sep">:</span>
        <div className="count-seg"><strong>{minutes}</strong><span>Min</span></div>
      </div>
    </>
  );

  if (!contest.url) {
    return <article className="contest-hero glow" data-reveal>{inner}</article>;
  }

  return (
    <a href={contest.url} target="_blank" rel="noreferrer" className="contest-hero glow" data-reveal>
      {inner}
    </a>
  );
}

function ContestColumn({
  title,
  contests,
  nowSeconds,
}: {
  title: UnifiedContest["platform"];
  contests: UnifiedContest[];
  nowSeconds: number | null;
}) {
  return (
    <div className="card panel" data-reveal>
      <div className="contest-col-head">
        <PlatformBadge platform={title} />
        <span>{contests.length} upcoming</span>
      </div>
      {contests.length ? (
        <div className="contest-list">
          {contests.slice(0, 4).map((contest, i) => (
            <ContestItem key={contest.id} contest={contest} nowSeconds={nowSeconds} index={i} />
          ))}
        </div>
      ) : (
        <EmptyState>Nothing scheduled.</EmptyState>
      )}
    </div>
  );
}

function ContestItem({ contest, nowSeconds, index }: { contest: UnifiedContest; nowSeconds: number | null; index: number }) {
  const inner = (
    <>
      <div className="row">
        <h4>{contest.name}</h4>
        <span className="cd">{formatCountdownFrom(contest.startTimeSeconds, nowSeconds)}</span>
      </div>
      <div className="sub">
        <span><CalendarDays size={14} /> {formatDateTime(contest.startTimeSeconds)}</span>
        <span><Clock3 size={14} /> {formatDuration(contest.durationSeconds)}</span>
      </div>
    </>
  );

  const style = { ["--i" as string]: index } as React.CSSProperties;

  if (!contest.url) {
    return <div className="contest-item" data-reveal style={style}>{inner}</div>;
  }

  return (
    <a href={contest.url} target="_blank" rel="noreferrer" className="contest-item" data-reveal style={style}>
      {inner}
    </a>
  );
}
