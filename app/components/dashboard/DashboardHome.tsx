"use client";

import { useMemo, useState } from "react";

import { useDashboardData, useNowSeconds } from "@/app/hooks/useDashboardData";
import { useReveal } from "@/app/hooks/useReveal";
import type { UnifiedContest } from "@/app/types";
import { AnalysisSection } from "../analysis/AnalysisSection";
import { CodeforcesSection } from "../codeforces/CodeforcesSection";
import { AppShell } from "../layout/AppShell";
import { LeetCodeSection } from "../leetcode/LeetCodeSection";
import { ProfileSection } from "../profile/ProfileSection";
import { Notice } from "../ui";
import { OverviewSection } from "./OverviewSection";
import type { TabKey } from "./types";
import { buildUnifiedContests } from "./utils";

export function DashboardHome({
  name,
  image,
  leetcodeUsername,
  codeforcesUsername,
}: {
  name: string;
  image?: string | null;
  leetcodeUsername: string;
  codeforcesUsername: string;
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const { data, error, isLoading, refresh } = useDashboardData(leetcodeUsername, codeforcesUsername);
  const nowSeconds = useNowSeconds();

  const contests = useMemo<UnifiedContest[]>(() => buildUnifiedContests(data), [data]);

  useReveal([activeTab, isLoading, data]);

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isLoading={isLoading}
      onRefresh={refresh}
      user={{ name, image, leetcodeUsername, codeforcesUsername }}
    >
      {error && <div style={{ marginBottom: 18 }}><Notice kind="error">{error}</Notice></div>}

      {activeTab === "dashboard" && (
        <OverviewSection data={data} contests={contests} isLoading={isLoading} nowSeconds={nowSeconds} />
      )}
      {activeTab === "leetcode" && <LeetCodeSection data={data} isLoading={isLoading} />}
      {activeTab === "codeforces" && <CodeforcesSection data={data} isLoading={isLoading} />}
      {activeTab === "analysis" && (
        <AnalysisSection data={data} contests={contests} isLoading={isLoading} nowSeconds={nowSeconds} />
      )}
      {activeTab === "profile" && <ProfileSection data={data} isLoading={isLoading} />}
    </AppShell>
  );
}
