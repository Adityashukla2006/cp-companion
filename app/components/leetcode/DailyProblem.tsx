import { ArrowUpRight, Flame } from "lucide-react";

import type { LeetcodeDashboard } from "@/app/types";
import { Difficulty, PanelHead, Skeleton } from "../ui";

export function DailyProblemPanel({ data, isLoading }: { data: LeetcodeDashboard | null; isLoading: boolean }) {
  return (
    <article className="card panel daily-card" data-reveal>
      <PanelHead
        title="Today's problem"
        eyebrow="Daily practice"
        action={<span className="panel-action"><Flame size={15} /> Daily</span>}
      />
      {isLoading ? <Skeleton rows={4} /> : <DailyBody data={data} />}
    </article>
  );
}

function DailyBody({ data }: { data: LeetcodeDashboard | null }) {
  const daily = data?.dailyQuestion;

  if (!daily) {
    return <Skeleton rows={4} />;
  }

  return (
    <>
      <div className="body">
        <div className="card-top">
          <Difficulty value={daily.difficulty} />
          <span className="muted">#{daily.questionId}</span>
        </div>
        <h3>{daily.questionTitle}</h3>
        <div className="topics">
          {daily.topics.slice(0, 5).map((topic) => (
            <span key={topic} className="chip">{topic}</span>
          ))}
        </div>
      </div>
      <a href={daily.questionLink} target="_blank" rel="noreferrer" className="btn btn-primary">
        Solve today's challenge <ArrowUpRight size={16} />
      </a>
    </>
  );
}
