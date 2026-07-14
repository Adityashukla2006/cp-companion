import type { ElementType } from "react";

import type { CodeforcesDashboard, LeetcodeDashboard } from "@/app/types";

export type DashboardState = {
  codeforces: CodeforcesDashboard | null;
  leetcode: LeetcodeDashboard | null;
};

export type TabKey = "dashboard" | "leetcode" | "codeforces" | "analysis" | "profile";

export type Tone = "blue" | "green" | "red";

export type DashboardTab = {
  key: TabKey;
  label: string;
  icon: ElementType;
};
