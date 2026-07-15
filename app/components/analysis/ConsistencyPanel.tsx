import { EmptyState } from "../ui";
import type { ConsistencyStats } from "./stats";

export function ConsistencyPanel({ stats }: { stats: ConsistencyStats | null }) {
  if (!stats) {
    return <EmptyState>No LeetCode activity to analyse yet.</EmptyState>;
  }

  const rows = [
    { label: "Current streak", value: `${stats.currentStreak} day${stats.currentStreak === 1 ? "" : "s"}` },
    { label: "Longest streak", value: `${stats.longestStreak} day${stats.longestStreak === 1 ? "" : "s"}` },
    { label: `Active days (last ${stats.windowDays})`, value: String(stats.activeDays) },
    { label: "Avg solves per active day", value: String(stats.avgPerActiveDay) },
    { label: "Most productive day", value: stats.bestWeekday ?? "—" },
  ];

  return (
    <dl className="kv-list">
      {rows.map(({ label, value }) => (
        <div key={label} className="kv-row">
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
