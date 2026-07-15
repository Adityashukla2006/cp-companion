"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Loader2, Shuffle } from "lucide-react";

import type { CodeforcesSubmission } from "@/app/types";
import { fetchJson } from "@/app/utils/helpers";
import { EmptyState } from "../ui";

type RecommendedProblem = {
  contestId: number;
  index: string;
  name: string;
  rating: number;
  tags: string[];
  url: string;
};

const SHOWN = 6;

/**
 * Practice picks from the CF problemset: unsolved problems in the user's
 * weak tags (or any tag), rated just above their current level.
 */
export function Recommendations({
  userRating,
  weakTags,
  submissions,
}: {
  userRating: number | null;
  weakTags: string[];
  submissions: CodeforcesSubmission[];
}) {
  const [pool, setPool] = useState<RecommendedProblem[]>([]);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const attempted = useMemo(
    () => new Set(submissions.map((s) => `${s.problem.contestId}-${s.problem.index}`)),
    [submissions],
  );

  const min = userRating ? Math.round((userRating + 100) / 100) * 100 : 800;
  const max = min + 300;

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({ min: String(min), max: String(max) });
    if (weakTags.length) params.set("tags", weakTags.join(","));

    fetchJson<RecommendedProblem[]>(`/api/codeforces/problemset?${params}`)
      .then((problems) => {
        if (!active) return;
        setPool(problems.filter((p) => !attempted.has(`${p.contestId}-${p.index}`)));
        setError(false);
      })
      .catch(() => active && setError(true))
      .finally(() => active && setIsLoading(false));

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [min, max, weakTags.join(",")]);

  const shuffle = useCallback(() => {
    setOffset((current) => (pool.length > SHOWN ? (current + SHOWN) % pool.length : 0));
  }, [pool.length]);

  if (isLoading) {
    return <EmptyState><Loader2 size={16} className="spin" /> Finding problems for you…</EmptyState>;
  }

  if (error || !pool.length) {
    return <EmptyState>Could not load recommendations right now.</EmptyState>;
  }

  const visible = [...pool.slice(offset, offset + SHOWN), ...pool.slice(0, Math.max(0, offset + SHOWN - pool.length))];

  return (
    <div className="rec-wrap">
      <p className="rec-intro">
        Rated <b>{min}–{max}</b>{weakTags.length ? <> in your weak topics: <b>{weakTags.join(", ")}</b></> : " across all topics"} — unsolved by you.
      </p>
      <div className="rec-list">
        {visible.map((problem) => (
          <a key={`${problem.contestId}${problem.index}`} href={problem.url} target="_blank" rel="noreferrer" className="rec-row">
            <span className="rec-rating">{problem.rating}</span>
            <span className="rec-name">{problem.name}</span>
            <span className="rec-tags">{problem.tags.slice(0, 2).join(" · ")}</span>
            <ArrowUpRight size={15} className="rec-go" />
          </a>
        ))}
      </div>
      {pool.length > SHOWN && (
        <button type="button" className="btn btn-ghost" onClick={shuffle} style={{ alignSelf: "flex-start" }}>
          <Shuffle size={15} /> Show different problems
        </button>
      )}
    </div>
  );
}
