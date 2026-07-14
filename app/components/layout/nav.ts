import { BarChart3, BookOpen, Code2, LayoutDashboard, User } from "lucide-react";
import type { ElementType } from "react";

import type { TabKey } from "../dashboard/types";

export type NavItem = {
  key: TabKey;
  label: string;
  eyebrow: string;
  title: string;
  icon: ElementType;
};

export const navItems: NavItem[] = [
  { key: "dashboard", label: "Overview", eyebrow: "Command Center", title: "Overview", icon: LayoutDashboard },
  { key: "leetcode", label: "LeetCode", eyebrow: "Practice & notes", title: "LeetCode", icon: BookOpen },
  { key: "codeforces", label: "Codeforces", eyebrow: "Rating & notes", title: "Codeforces", icon: Code2 },
  { key: "analysis", label: "Analysis", eyebrow: "Insights", title: "Analysis", icon: BarChart3 },
  { key: "profile", label: "Profile", eyebrow: "Identity", title: "Profile", icon: User },
];
