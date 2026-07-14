"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/app/components/ui";
import { SavedProblemCard, type SavedLeetcodeQuestion } from "@/app/components/leetcode/SavedProblems";
import { useReveal } from "@/app/hooks/useReveal";
import { fetchJson } from "@/app/utils/helpers";

export default function LeetcodeProblemsPage() {
  const [questions, setQuestions] = useState<SavedLeetcodeQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadQuestions = useCallback(() => {
    fetchJson<SavedLeetcodeQuestion[]>("/api/questions/leetcode")
      .then(setQuestions)
      .catch(() => setQuestions([]))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  useReveal([questions, isLoading]);

  return (
    <main className="detail">
      <Link href="/" className="btn btn-ghost detail-back">
        <ArrowLeft size={16} /> Dashboard
      </Link>
      <header className="detail-hero">
        <p className="eyebrow">LeetCode</p>
        <h1>Saved problems</h1>
        <span>{questions.length} in your library</span>
      </header>

      {isLoading ? (
        <EmptyState>Loading saved problems…</EmptyState>
      ) : questions.length ? (
        <section className="saved-grid">
          {questions.map((question, i) => (
            <SavedProblemCard
              key={question.id}
              question={question}
              index={i}
              onUpdated={(updated) => setQuestions((current) => current.map((item) => (item.id === updated.id ? updated : item)))}
              onDeleted={(id) => setQuestions((current) => current.filter((item) => item.id !== id))}
            />
          ))}
        </section>
      ) : (
        <EmptyState>No LeetCode problems saved yet.</EmptyState>
      )}
    </main>
  );
}
