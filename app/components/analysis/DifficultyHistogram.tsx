"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "../ui";
import type { DifficultyBucket } from "./stats";

const ACCENT = "#6d5efc";
const CYAN = "#12b6d8";
const AXIS = "#8a93a6";
const GRID = "rgba(128,128,140,0.16)";

/** Unique accepted problems per 200-point rating band, with the user's rating marked. */
export function DifficultyHistogram({
  buckets,
  userRating,
}: {
  buckets: DifficultyBucket[];
  userRating: number | null;
}) {
  if (!buckets.length) {
    return <EmptyState>No rated accepted problems in recent submissions yet.</EmptyState>;
  }

  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={buckets} margin={{ top: 12, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="from" tickLine={false} axisLine={false} tick={{ fill: AXIS, fontSize: 11 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: AXIS, fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: "rgba(128,128,140,0.08)" }}
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              boxShadow: "var(--shadow-lg)",
              color: "var(--text)",
              fontSize: 12,
            }}
            labelFormatter={(label) => `Rated ${label}–${Number(label) + 199}`}
            formatter={(value) => [value, "Solved"]}
          />
          {userRating !== null && (
            <ReferenceLine
              x={Math.floor(userRating / 200) * 200}
              stroke={CYAN}
              strokeDasharray="5 4"
              strokeWidth={2}
              label={{ value: `You · ${userRating}`, fill: CYAN, fontSize: 11, position: "top" }}
            />
          )}
          <Bar dataKey="solved" radius={[6, 6, 0, 0]} maxBarSize={44}>
            {buckets.map((bucket) => (
              <Cell
                key={bucket.from}
                fill={userRating !== null && bucket.from >= userRating ? CYAN : ACCENT}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="chart-legend">
        <span className="legend-dot" style={{ ["--dot" as string]: ACCENT } as React.CSSProperties}>At or below your level</span>
        <span className="legend-dot" style={{ ["--dot" as string]: CYAN } as React.CSSProperties}>Growth zone</span>
      </div>
    </div>
  );
}
