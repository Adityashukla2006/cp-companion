"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { LeetcodeContestHistoryEntry } from "@/app/types";
import { EmptyState } from "../ui";

const LC = "#f79a16";
const AXIS = "#8a93a6";
const GRID = "rgba(128,128,140,0.16)";

export function LeetcodeRatingChart({ history }: { history: LeetcodeContestHistoryEntry[] }) {
  const chartData = history
    .filter((entry) => entry.rating !== null)
    .map((entry, index) => ({
      index: index + 1,
      rating: Math.round(entry.rating as number),
      contest: entry.title,
      ranking: entry.ranking,
      solved: entry.problemsSolved,
      total: entry.totalProblems,
    }));

  if (!chartData.length) {
    return <EmptyState>No LeetCode contest history yet — attend a contest to unlock this chart.</EmptyState>;
  }

  const peak = Math.max(...chartData.map((d) => d.rating));
  const current = chartData.at(-1)?.rating ?? 0;
  const lastSolved = chartData.at(-1);

  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 12, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="lcFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={LC} stopOpacity={0.3} />
              <stop offset="100%" stopColor={LC} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID} strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="index" tickLine={false} axisLine={false} tick={{ fill: AXIS, fontSize: 11 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: AXIS, fontSize: 11 }} width={44} domain={["dataMin - 60", "dataMax + 60"]} />
          <Tooltip
            cursor={{ stroke: LC, strokeWidth: 1, strokeDasharray: "4 4" }}
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              boxShadow: "var(--shadow-lg)",
              color: "var(--text)",
              fontSize: 12,
            }}
            formatter={(value, _name, props) => {
              const { solved, total, ranking } = props.payload;
              const detail = [
                solved !== null && total !== null ? `${solved}/${total} solved` : null,
                ranking !== null ? `rank ${Number(ranking).toLocaleString()}` : null,
              ].filter(Boolean).join(" · ");
              return [detail ? `${value} (${detail})` : value, "Rating"];
            }}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.contest ?? "Contest"}
          />
          <Area
            type="monotone"
            dataKey="rating"
            stroke={LC}
            strokeWidth={3}
            fill="url(#lcFill)"
            dot={false}
            activeDot={{ r: 5, fill: LC, stroke: "var(--surface)", strokeWidth: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="chart-legend">
        <span>Current <b>{current}</b></span>
        <span>Peak <b>{peak}</b></span>
        <span>Contests <b>{chartData.length}</b></span>
        {lastSolved?.solved !== null && lastSolved?.total !== null && (
          <span>Last contest <b>{lastSolved?.solved}/{lastSolved?.total}</b></span>
        )}
      </div>
    </div>
  );
}
