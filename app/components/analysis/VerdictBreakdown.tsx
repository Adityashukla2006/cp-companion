import { Lightbulb } from "lucide-react";

import { EmptyState } from "../ui";
import { verdictInsight, type VerdictSlice } from "./stats";

const VERDICT_COLORS: Record<string, string> = {
  OK: "var(--success)",
  WRONG_ANSWER: "var(--danger)",
  TIME_LIMIT_EXCEEDED: "var(--lc)",
  MEMORY_LIMIT_EXCEEDED: "var(--warn)",
  RUNTIME_ERROR: "var(--cf)",
  COMPILATION_ERROR: "var(--text-muted)",
};

export function VerdictBreakdown({ slices }: { slices: VerdictSlice[] }) {
  const total = slices.reduce((sum, slice) => sum + slice.count, 0);

  if (!total) {
    return <EmptyState>No recent Codeforces submissions to analyse yet.</EmptyState>;
  }

  const insight = verdictInsight(slices);

  return (
    <div className="bar-list">
      {slices.slice(0, 6).map(({ verdict, label, count }) => (
        <div key={verdict} className="bar-row wide-label">
          <span className="bar-label">{label}</span>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{
                width: `${Math.max(2, Math.round((count / total) * 100))}%`,
                background: VERDICT_COLORS[verdict] ?? "var(--accent)",
              }}
            />
          </div>
          <span className="bar-count">{count}</span>
        </div>
      ))}
      <p className="bar-total">{total} submissions analysed</p>
      {insight && (
        <p className="insight-line"><Lightbulb size={14} /> {insight}</p>
      )}
    </div>
  );
}
