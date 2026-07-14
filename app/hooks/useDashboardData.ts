"use client";

import { useCallback, useEffect, useState } from "react";

import { codeforcesDashboard } from "@/app/services/codeforces";
import { leetcodeDashboard } from "@/app/services/leetcode";
import { emptyDashboardState } from "@/app/components/dashboard/constants";
import type { DashboardState } from "@/app/components/dashboard/types";

/** How long a client-side snapshot stays fresh before we refetch. */
const CACHE_TTL_MS = 5 * 60 * 1000;

type CachedDashboard = {
  savedAt: number;
  data: DashboardState;
};

const cacheKey = (leetcodeUsername: string, codeforcesUsername: string) =>
  `cp-dashboard:${leetcodeUsername}:${codeforcesUsername}`;

const readCache = (key: string): CachedDashboard | null => {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedDashboard;
    if (!parsed?.data || Date.now() - parsed.savedAt > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeCache = (key: string, data: DashboardState) => {
  try {
    sessionStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    // Storage full or unavailable — caching is best-effort.
  }
};

export function useDashboardData(leetcodeUsername: string, codeforcesUsername: string) {
  const [data, setData] = useState<DashboardState>(emptyDashboardState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let active = true;
    const key = cacheKey(leetcodeUsername, codeforcesUsername);

    // Manual refresh (refreshToken > 0) always bypasses the client cache.
    if (refreshToken === 0) {
      const cached = readCache(key);
      if (cached) {
        setData(cached.data);
        setIsLoading(false);
        return;
      }
    }

    Promise.allSettled([
      codeforcesDashboard(codeforcesUsername),
      leetcodeDashboard(leetcodeUsername),
    ]).then((results) => {
      if (!active) {
        return;
      }

      const [codeforcesResult, leetcodeResult] = results;
      const next: DashboardState = {
        codeforces: codeforcesResult.status === "fulfilled" ? codeforcesResult.value : null,
        leetcode: leetcodeResult.status === "fulfilled" ? leetcodeResult.value : null,
      };
      setData(next);

      if (next.codeforces || next.leetcode) {
        writeCache(key, next);
      }

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
