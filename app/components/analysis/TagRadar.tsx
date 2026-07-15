"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { EmptyState } from "../ui";
import type { TagStat } from "./stats";

const ACCENT = "#6d5efc";
const DANGER = "#e5484d";
const AXIS = "#8a93a6";
const GRID = "rgba(128,128,140,0.2)";

/** Solved vs unsolved problem counts per Codeforces tag. */
export function TagRadar({ stats }: { stats: TagStat[] }) {
  if (stats.length < 3) {
    return <EmptyState>Not enough tagged submissions yet — solve a few more problems.</EmptyState>;
  }

  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={stats} outerRadius="72%">
          <PolarGrid stroke={GRID} />
          <PolarAngleAxis dataKey="tag" tick={{ fill: AXIS, fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              boxShadow: "var(--shadow-lg)",
              color: "var(--text)",
              fontSize: 12,
            }}
            formatter={(value, name) => [value, name === "solved" ? "Solved" : "Unsolved attempts"]}
          />
          <Radar dataKey="solved" stroke={ACCENT} fill={ACCENT} fillOpacity={0.28} strokeWidth={2} />
          <Radar dataKey="failed" stroke={DANGER} fill={DANGER} fillOpacity={0.12} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
      <div className="chart-legend">
        <span className="legend-dot" style={{ ["--dot" as string]: ACCENT } as React.CSSProperties}>Solved</span>
        <span className="legend-dot" style={{ ["--dot" as string]: DANGER } as React.CSSProperties}>Unsolved attempts</span>
      </div>
    </div>
  );
}
