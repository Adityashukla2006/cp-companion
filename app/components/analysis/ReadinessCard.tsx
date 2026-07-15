import { Timer } from "lucide-react";

import type { UnifiedContest } from "@/app/types";
import { formatCountdownFrom } from "../dashboard/utils";
import type { Readiness } from "./stats";

/** Hero card: 0–100 contest readiness score with the factor breakdown. */
export function ReadinessCard({
  readiness,
  contests,
  nowSeconds,
}: {
  readiness: Readiness;
  contests: UnifiedContest[];
  nowSeconds: number | null;
}) {
  const next = contests[0];
  const angle = Math.round((readiness.score / 100) * 360);

  return (
    <section className="card readiness" data-reveal>
      <div className="readiness-score">
        <div className="score-ring" style={{ ["--fill" as string]: `${angle}deg` } as React.CSSProperties}>
          <span className="score-val">{readiness.score}</span>
        </div>
        <div className="score-meta">
          <h2>{readiness.verdict}</h2>
          {next && (
            <p>
              <Timer size={14} /> {next.name} in <b>{formatCountdownFrom(next.startTimeSeconds, nowSeconds)}</b>
            </p>
          )}
        </div>
      </div>
      <div className="bar-list readiness-factors">
        {readiness.factors.map(({ label, score, max, note }) => (
          <div key={label} className="bar-row wide-label">
            <span className="bar-label">{label}</span>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{
                  width: `${Math.max(3, Math.round((score / max) * 100))}%`,
                  background: score / max >= 0.7 ? "var(--success)" : score / max >= 0.4 ? "var(--lc)" : "var(--danger)",
                }}
              />
            </div>
            <span className="bar-count" title={note}>{score}/{max}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
