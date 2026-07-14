"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { ArrowUpRight, CheckCircle2, Loader2, Pencil, Trash2, X } from "lucide-react";
import Link from "next/link";

import { fetchJson } from "@/app/utils/helpers";
import { Difficulty, EmptyState, PanelHead } from "../ui";

export type SavedLeetcodeQuestion = {
  id: number;
  title: string;
  difficulty: string;
  notes: string;
  url: string;
};

export function SavedProblemCard({
  question,
  index = 0,
  onUpdated,
  onDeleted,
}: {
  question: SavedLeetcodeQuestion;
  index?: number;
  onUpdated?: (question: SavedLeetcodeQuestion) => void;
  onDeleted?: (id: number) => void;
}) {
  const style = { ["--i" as string]: index } as React.CSSProperties;
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(question.notes);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editable = Boolean(onUpdated);
  const deletable = Boolean(onDeleted);

  const saveNotes = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const updated = await fetchJson<SavedLeetcodeQuestion>("/api/questions/leetcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...question, notes }),
      });
      onUpdated?.(updated);
      setIsEditing(false);
    } catch {
      setError("Could not save notes.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteQuestion = async () => {
    if (!window.confirm("Delete this saved problem?")) {
      return;
    }

    setIsDeleting(true);

    try {
      await fetchJson(`/api/questions/leetcode?id=${question.id}`, { method: "DELETE" });
      onDeleted?.(question.id);
    } catch {
      setError("Could not delete problem.");
      setIsDeleting(false);
    }
  };

  return (
    <article className="saved-card" data-reveal style={style}>
      <div className="card-top">
        <Difficulty value={question.difficulty || "Unknown"} />
        <span className="muted">#{question.id}</span>
        {question.notes.trim() && (
          <span className="flag-saved"><CheckCircle2 size={13} /> Notes</span>
        )}
        {(editable || deletable) && (
          <div className="card-actions">
            {editable && (
              <button type="button" className="icon-btn sm" onClick={() => { setNotes(question.notes); setIsEditing((v) => !v); }} aria-label="Edit notes" title="Edit notes">
                {isEditing ? <X size={14} /> : <Pencil size={14} />}
              </button>
            )}
            {deletable && (
              <button type="button" className="icon-btn sm danger" onClick={deleteQuestion} disabled={isDeleting} aria-label="Delete problem" title="Delete problem">
                {isDeleting ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
              </button>
            )}
          </div>
        )}
      </div>
      <h3>{question.title}</h3>
      {isEditing ? (
        <form className="note-editor" onSubmit={saveNotes}>
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} placeholder="Approach, mistakes, edge cases, or retry notes." />
          {error && <p className="cf-notes" style={{ color: "var(--danger)" }}>{error}</p>}
          <div className="editor-foot">
            <button className="btn btn-primary" disabled={isSaving} type="submit">
              {isSaving ? <Loader2 size={16} className="spin" /> : <CheckCircle2 size={16} />}
              Save
            </button>
          </div>
        </form>
      ) : (
        question.notes.trim() && <p>{question.notes}</p>
      )}
      {question.url && (
        <a href={question.url} target="_blank" rel="noreferrer" className="link" style={{ marginTop: "auto" }}>
          Open problem <ArrowUpRight size={15} />
        </a>
      )}
    </article>
  );
}

export function LeetCodeProblems() {
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
    const refresh = () => loadQuestions();
    window.addEventListener("leetcode-notes-saved", refresh);
    return () => window.removeEventListener("leetcode-notes-saved", refresh);
  }, [loadQuestions]);

  return (
    <article className="card panel" data-reveal>
      <PanelHead title="Saved problems" eyebrow={`${questions.length} in your library`} />
      {isLoading ? (
        <EmptyState>Loading saved problems…</EmptyState>
      ) : questions.length ? (
        <>
          <div className="saved-grid">
            {questions.slice(0, 3).map((question, i) => (
              <SavedProblemCard
                key={question.id}
                question={question}
                index={i}
                onUpdated={(updated) => setQuestions((current) => current.map((item) => (item.id === updated.id ? updated : item)))}
                onDeleted={(id) => setQuestions((current) => current.filter((item) => item.id !== id))}
              />
            ))}
          </div>
          {questions.length > 3 && (
            <div className="more-row">
              <span>{questions.length - 3} more saved problems</span>
              <Link href="/leetcode/problems" className="link">
                See all <ArrowUpRight size={15} />
              </Link>
            </div>
          )}
        </>
      ) : (
        <EmptyState>No LeetCode problems saved yet.</EmptyState>
      )}
    </article>
  );
}
