"use client";

import type { ElementType, ReactNode } from "react";
import { AlertCircle } from "lucide-react";

import { formatInteger } from "@/app/utils/helpers";
import { useCountUp } from "@/app/hooks/useCountUp";

export type Tone = "accent" | "lc" | "cf" | "green" | "red" | "cyan";

/* ---------- Panel header ---------- */
export function PanelHead({
  title,
  eyebrow,
  action,
}: {
  title: string;
  eyebrow?: string | null;
  action?: ReactNode;
}) {
  return (
    <div className="panel-head">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}

/* ---------- Stat tile (with count-up) ---------- */
export function StatTile({
  label,
  value,
  help,
  icon: Icon,
  tone = "accent",
  format,
}: {
  label: string;
  value: number | string | null | undefined;
  help?: string | null;
  icon: ElementType;
  tone?: Tone;
  format?: (value: number) => string;
}) {
  const numeric = typeof value === "number" && Number.isFinite(value);
  const counted = useCountUp(numeric ? value : null, { format: format ?? ((v) => formatInteger(v) ?? "—") });
  const display = numeric ? counted : (value ?? "—");

  return (
    <article className={`stat tone-${tone}`}>
      <div className="stat-top">
        <span className="stat-ic">
          <Icon size={19} />
        </span>
        <span className="label">{label}</span>
      </div>
      <strong className="stat-value">{display}</strong>
      {help && <span className="stat-help">{help}</span>}
    </article>
  );
}

/* ---------- Skeletons ---------- */
export function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="sk-stack">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="sk sk-line" />
      ))}
    </div>
  );
}

export function SkeletonBlock() {
  return <div className="sk sk-block" />;
}

/* ---------- Feedback ---------- */
export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}

export function Notice({
  kind = "error",
  inline = false,
  children,
}: {
  kind?: "error" | "success";
  inline?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`notice notice-${kind}${inline ? " notice-inline" : ""}`}>
      {kind === "error" && !inline && <AlertCircle size={18} />}
      <span>{children}</span>
    </div>
  );
}

/* ---------- Small labels ---------- */
export function PlatformBadge({ platform }: { platform: "LeetCode" | "Codeforces" }) {
  return <span className={`badge ${platform === "LeetCode" ? "lc" : "cf"}`}>{platform}</span>;
}

export function Difficulty({ value }: { value: string }) {
  return <span className={`diff ${value.toLowerCase()}`}>{value}</span>;
}
