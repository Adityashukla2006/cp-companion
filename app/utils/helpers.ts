import { RawTopicTag } from "../types";

export const leetcodeUrl = process.env.NEXT_PUBLIC_LEETCODE_API_BASE_URL;
export const codeforcesUrl = process.env.NEXT_PUBLIC_CODEFORCES_API_BASE_URL;

export function formatInteger(value: number | null | undefined) {
  return typeof value === "number" ? new Intl.NumberFormat("en-IN").format(value) : null;
}

export function formatDateTime(timestamp: number | null | undefined) {
  if (!timestamp) {
    return null;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp * 1000));
}

export function formatDate(timestamp: number | null | undefined) {
  if (!timestamp) {
    return null;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(timestamp * 1000));
}

export function formatIsoDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDuration(seconds: number | null | undefined) {
  if (!seconds) {
    return null;
  }

  const minutes = Math.round(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (!hours) {
    return `${minutes}m`;
  }

  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function formatCountdown(timestamp: number | null | undefined) {
  if (!timestamp) {
    return null;
  }

  const diffSeconds = Math.max(0, Math.floor((timestamp * 1000 - Date.now()) / 1000));
  const days = Math.floor(diffSeconds / 86400);
  const hours = Math.floor((diffSeconds % 86400) / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

export const requireLeetcodeBaseUrl = () => {
  if (!leetcodeUrl) {
    throw new Error("NEXT_PUBLIC_LEETCODE_API_BASE_URL is not configured.");
  }

  return leetcodeUrl.replace(/\/$/, "");
};

export const requireCodeforcesBaseUrl = () => {
  if (!codeforcesUrl) {
    throw new Error("NEXT_PUBLIC_CODEFORCES_API_BASE_URL is not configured.");
  }

  return codeforcesUrl.replace(/\/$/, "");
};

export const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const toNumberOrNull = (value: unknown): number | null => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

export const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
};

export const getTopicNames = (topicTags: unknown): string[] => {
  if (!Array.isArray(topicTags)) {
    return [];
  }

  return topicTags
    .map((tag: RawTopicTag) => tag.name)
    .filter((name): name is string => Boolean(name));
};

export const slugFromTitle = (title: string) =>
  title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
