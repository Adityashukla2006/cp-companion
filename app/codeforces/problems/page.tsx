"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/app/components/ui";
import { SavedCodeforcesCard, type SavedCodeforcesQuestion } from "@/app/components/codeforces/SavedQuestions";
import { useReveal } from "@/app/hooks/useReveal";
import { fetchJson } from "@/app/utils/helpers";

export default function CodeforcesProblemsPage() {
  const [questions, setQuestions] = useState<SavedCodeforcesQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadQuestions = useCallback(() => {
    fetchJson<SavedCodeforcesQuestion[]>("/api/questions/codeforces")
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
        <p className="eyebrow">Codeforces</p>
        <h1>Saved questions</h1>
        <span>{questions.length} logged</span>
      </header>

      {isLoading ? (
        <EmptyState>Loading saved questions…</EmptyState>
      ) : questions.length ? (
        <section className="detail-list">
          {questions.map((question, i) => (
            <SavedCodeforcesCard
              key={question.id}
              question={question}
              index={i}
              onUpdated={(updated) => setQuestions((current) => current.map((item) => (item.id === updated.id ? updated : item)))}
              onDeleted={(id) => setQuestions((current) => current.filter((item) => item.id !== id))}
            />
          ))}
        </section>
      ) : (
        <EmptyState>No Codeforces questions saved yet.</EmptyState>
      )}
    </main>
  );
}
