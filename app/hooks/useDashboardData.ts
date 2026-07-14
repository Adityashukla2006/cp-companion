"use client";

import { useCallback, useEffect, useState } from "react";

import { codeforcesDashboard } from "@/app/services/codeforces";
import { leetcodeDashboard } from "@/app/services/leetcode";
import { emptyDashboardState } from "@/app/components/dashboard/constants";
import type { DashboardState } from "@/app/components/dashboard/types";

export function useDashboardData(leetcodeUsername: string, codeforcesUsername: string) {
  const [data, setData] = useState<DashboardState>(emptyDashboardState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      codeforcesDashboard(codeforcesUsername),
      leetcodeDashboard(leetcodeUsername),
    ]).then((results) => {
      if (!active) {
        return;
      }

      const [codeforcesResult, leetcodeResult] = results;
      setData({
        codeforces: codeforcesResult.status === "fulfilled" ? codeforcesResult.value : null,
        leetcode: leetcodeResult.status === "fulfilled" ? leetcodeResult.value : null,
      });

      const rejected = results.find((result) => result.status === "rejected");
      setError(rejected?.status === "rejected" ? rejected.reason?.message ?? "Some dashboard data could not be loaded." : null);
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, [refreshToken, leetcodeUsername, codeforcesUsername]);

  const refresh = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setRefreshToken((value) => value + 1);
  }, []);

  return { data, error, isLoading, refresh };
}

export function useNowSeconds() {
  const [nowSeconds, setNowSeconds] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setNowSeconds(Math.floor(Date.now() / 1000));
    const initialTimer = window.setTimeout(update, 0);
    const interval = window.setInterval(update, 60000);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, []);

  return nowSeconds;
}
