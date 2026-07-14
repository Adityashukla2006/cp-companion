"use client";

import { FormEvent, useState } from "react";
import { ArrowUpRight, CheckCircle2, Loader2, Pencil, Trash2, X } from "lucide-react";
import Link from "next/link";

import { fetchJson } from "@/app/utils/helpers";
import { EmptyState } from "../ui";
import { CodeforcesDescription } from "./CodeforcesDescription";

export type SavedCodeforcesQuestion = {
  id: number;
  contestName: string;
  timeLimit: string;
  memoryLimit: string;
  description: string;
  notes: string;
  url: string;
};

export function SavedCodeforcesCard({
  question,
  index = 0,
  compact = false,
  onUpdated,
  onDeleted,
}: {
  question: SavedCodeforcesQuestion;
  index?: number;
  compact?: boolean;
  onUpdated?: (question: SavedCodeforcesQuestion) => void;
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
      const updated = await fetchJson<SavedCodeforcesQuestion>("/api/questions/codeforces", {
        method: "PUT",
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
    if (!window.confirm("Delete this saved question?")) {
      return;
    }

    setIsDeleting(true);

    try {
      await fetchJson(`/api/questions/codeforces?id=${question.id}`, { method: "DELETE" });
      onDeleted?.(question.id);
    } catch {
      setError("Could not delete question.");
      setIsDeleting(false);
    }
  };

  return (
    <article className="saved-card" data-reveal style={style}>
      <div className="saved-head">
        <div>
          <span className="muted">#{question.id}</span>
          <h3>{question.contestName}</h3>
        </div>
        <div className="card-actions">
          {question.url && (
            <a href={question.url} target="_blank" rel="noreferrer" className="link">
              Open <ArrowUpRight size={15} />
            </a>
          )}
          {editable && (
            <button type="button" className="icon-btn sm" onClick={() => { setNotes(question.notes); setIsEditing((v) => !v); }} aria-label="Edit notes" title="Edit notes">
              {isEditing ? <X size={14} /> : <Pencil size={14} />}
            </button>
          )}
          {deletable && (
            <button type="button" className="icon-btn sm danger" onClick={deleteQuestion} disabled={isDeleting} aria-label="Delete question" title="Delete question">
              {isDeleting ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
            </button>
          )}
        </div>
      </div>
      {(question.timeLimit || question.memoryLimit) && (
        <div className="saved-meta">
          {question.timeLimit && <span>{question.timeLimit}</span>}
          {question.memoryLimit && <span>{question.memoryLimit}</span>}
        </div>
      )}
      <CodeforcesDescription value={question.description} compact={compact} />
      {isEditing ? (
        <form className="note-editor" onSubmit={saveNotes}>
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} placeholder="Approach, failed idea, invariant, or retry plan." />
          {error && <p className="cf-notes" style={{ color: "var(--danger)" }}>{error}</p>}
          <div className="editor-foot">
            <button className="btn btn-primary" disabled={isSaving} type="submit">
              {isSaving ? <Loader2 size={16} className="spin" /> : <CheckCircle2 size={16} />}
              Save
            </button>
          </div>
        </form>
      ) : (
        question.notes && <p className="cf-notes" style={{ fontSize: 12.5, color: "var(--text-soft)" }}>{question.notes}</p>
      )}
      {compact && !isEditing && (
        <Link href="/codeforces/problems" className="link quiet">
          Full description <ArrowUpRight size={14} />
        </Link>
      )}
    </article>
  );
}
