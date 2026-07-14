import type { LeetcodeDashboard } from "@/app/types";
import { EmptyState } from "../ui";

/** GitHub-style contribution heatmap of recent LeetCode solve activity. */
export function ActivityHeatmap({ data }: { data: LeetcodeDashboard | null }) {
  const days = data?.activity ?? [];

  if (!days.length) {
    return <EmptyState>No LeetCode activity was returned yet.</EmptyState>;
  }

  const max = Math.max(...days.map((day) => day.count), 1);
  const level = (count: number) => {
    if (count <= 0) return 0;
    const ratio = count / max;
    if (ratio > 0.75) return 4;
    if (ratio > 0.5) return 3;
    if (ratio > 0.25) return 2;
    return 1;
  };

  // Pad to full weeks (columns of 7) for a clean grid.
  const recent = days.slice(-98);
  const total = recent.reduce((sum, day) => sum + day.count, 0);
  const activeDays = recent.filter((day) => day.count > 0).length;

  return (
    <div className="heat">
      <div className="heat-grid" role="img" aria-label="LeetCode activity heatmap">
        {recent.map((day) => (
          <span
            key={day.date}
            className="heat-cell"
            data-level={level(day.count)}
            title={`${day.date}: ${day.count} solved`}
          />
        ))}
      </div>
      <div className="chart-legend">
        <span>Solves <b>{total}</b></span>
        <span>Active days <b>{activeDays}</b></span>
        <div className="heat-legend">
          Less
          <span className="heat-cell" data-level={0} />
          <span className="heat-cell" data-level={1} />
          <span className="heat-cell" data-level={2} />
          <span className="heat-cell" data-level={3} />
          <span className="heat-cell" data-level={4} />
          More
        </div>
      </div>
    </div>
  );
}
