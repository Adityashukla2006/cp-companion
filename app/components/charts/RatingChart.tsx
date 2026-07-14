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

import type { CodeforcesRatingChange } from "@/app/types";
import { formatDate } from "@/app/utils/helpers";
import { EmptyState } from "../ui";
import { formatSigned } from "../dashboard/utils";

const ACCENT = "#6d5efc";
const AXIS = "#8a93a6";
const GRID = "rgba(128,128,140,0.16)";

export function RatingChart({ history }: { history: CodeforcesRatingChange[] }) {
  const chartData = history.map((item, index) => ({
    index: index + 1,
    rating: item.newRating,
    contest: item.contestName,
    date: formatDate(item.ratingUpdateTimeSeconds),
    delta: item.newRating - item.oldRating,
  }));

  if (!chartData.length) {
    return <EmptyState>Codeforces rating history is not available yet.</EmptyState>;
  }

  const peak = Math.max(...chartData.map((d) => d.rating));
  const current = chartData.at(-1)?.rating ?? 0;

  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 12, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="ratingFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ACCENT} stopOpacity={0.32} />
              <stop offset="100%" stopColor={ACCENT} stopOpacity={0.01} />
            </linearGradient>
            <linearGradient id="ratingStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#12b6d8" />
              <stop offset="100%" stopColor={ACCENT} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID} strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="index" tickLine={false} axisLine={false} tick={{ fill: AXIS, fontSize: 11 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: AXIS, fontSize: 11 }} width={44} domain={["dataMin - 80", "dataMax + 80"]} />
          <Tooltip
            cursor={{ stroke: ACCENT, strokeWidth: 1, strokeDasharray: "4 4" }}
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              boxShadow: "var(--shadow-lg)",
              color: "var(--text)",
              fontSize: 12,
            }}
            formatter={(value, _name, props) => [`${value}  (${formatSigned(props.payload.delta) ?? "0"})`, "Rating"]}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.contest ?? "Contest"}
          />
          <Area
            type="monotone"
            dataKey="rating"
            stroke="url(#ratingStroke)"
            strokeWidth={3}
            fill="url(#ratingFill)"
            dot={false}
            activeDot={{ r: 5, fill: ACCENT, stroke: "var(--surface)", strokeWidth: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="chart-legend">
        <span>Current <b>{current}</b></span>
        <span>Peak <b>{peak}</b></span>
        <span>Contests <b>{chartData.length}</b></span>
      </div>
    </div>
  );
}
