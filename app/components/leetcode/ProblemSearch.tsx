"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CheckCircle2, Loader2, Save, Search } from "lucide-react";

import { leetcodeSearchQuestionFromID } from "@/app/services/leetcode";
import type { LeetcodeQuestionSearchResult } from "@/app/types";
import { fetchJson } from "@/app/utils/helpers";
import { Difficulty, Notice, PanelHead } from "../ui";
import { formatPercent } from "../dashboard/utils";

type SavedLeetcodeQuestion = {
  id: number;
  title: string;
  difficulty: string;
  notes: string;
  url: string;
};

const htmlToText = (value: string | null | undefined) => {
  if (!value) {
    return "";
  }

  const withLineBreaks = value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li>/gi, "- ");

  if (typeof window === "undefined") {
    return withLineBreaks.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(withLineBreaks, "text/html");
  return document.body.textContent?.replace(/\n\s+\n/g, "\n\n").trim() ?? "";
};

export function ProblemSearch() {
  const [problemId, setProblemId] = useState("");
  const [result, setResult] = useState<LeetcodeQuestionSearchResult | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<LeetcodeQuestionSearchResult | null>(null);
  const [notes, setNotes] = useState("");
  const [savedQuestions, setSavedQuestions] = useState<SavedLeetcodeQuestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchJson<SavedLeetcodeQuestion[]>("/api/questions/leetcode")
      .then(setSavedQuestions)
      .catch(() => setSavedQuestions([]));
  }, []);

  const description = useMemo(() => htmlToText(selectedProblem?.content), [selectedProblem]);

  const selectProblem = (question: LeetcodeQuestionSearchResult) => {
    const existing = savedQuestions.find((saved) => saved.id === Number(question.questionId));
    setSelectedProblem(question);
    setNotes(existing?.notes ?? "");
    setSaveStatus(null);
  };

  const search = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = problemId.trim();

    if (!query) {
      setSearchError("Enter a LeetCode problem ID.");
      setResult(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const question = await leetcodeSearchQuestionFromID(query);
      setResult(question);
      setSelectedProblem(null);
      setNotes("");
    } catch {
      setResult(null);
      setSelectedProblem(null);
      setSearchError("Problem not found. Check the problem ID and try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const saveNotes = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedProblem) {
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    try {
      const saved = await fetchJson<SavedLeetcodeQuestion>("/api/questions/leetcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedProblem.questionId,
          title: selectedProblem.title,
          description,
          difficulty: selectedProblem.difficulty,
          hints: selectedProblem.hints ?? [],
          notes,
          url: selectedProblem.problemUrl,
        }),
      });

      setSavedQuestions((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
      window.dispatchEvent(new CustomEvent("leetcode-notes-saved"));
      setSaveStatus("Notes saved.");
    } catch {
      setSaveStatus("Could not save notes. Check the database connection and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <article className="card panel" data-reveal>
      <PanelHead
        title="Problem search"
        eyebrow="LeetCode"
        action={<span className="panel-action">{savedQuestions.length} saved</span>}
      />
      <form className="search-form" onSubmit={search}>
        <div className="search-field">
          <Search size={18} />
          <input
            value={problemId}
            onChange={(event) => setProblemId(event.target.value)}
            placeholder="Search by problem ID — e.g. 1, 121, 322"
            inputMode="numeric"
          />
        </div>
        <button className="btn btn-primary" disabled={isSearching} type="submit">
          {isSearching ? <Loader2 size={16} className="spin" /> : <Search size={16} />}
          Search
        </button>
      </form>

      {searchError && <div style={{ marginTop: 12 }}><Notice kind="error" inline>{searchError}</Notice></div>}

      {result && (
        <div className="result-card">
          <div>
            <div className="card-top">
              <Difficulty value={result.difficulty} />
              <span className="muted">#{result.questionId}</span>
              {result.acRate !== null && result.acRate !== undefined && (
                <span className="acc-pill">{formatPercent(result.acRate)} AC</span>
              )}
            </div>
            <h3>{result.title}</h3>
            <div className="topics">
              {result.topicTags.slice(0, 6).map((topic) => (
                <span key={topic} className="chip">{topic}</span>
              ))}
            </div>
          </div>
          <div className="result-actions">
            <button className="btn btn-soft" type="button" onClick={() => selectProblem(result)}>
              <Save size={16} /> Add notes
            </button>
            <a href={result.problemUrl} target="_blank" rel="noreferrer" className="link">
              Open problem <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      )}

      {selectedProblem && (
        <form className="note-editor" onSubmit={saveNotes}>
          <div className="field-grid">
            <label className="field">
              <span>Title</span>
              <input value={selectedProblem.title} readOnly />
            </label>
            <label className="field">
              <span>Difficulty</span>
              <input value={selectedProblem.difficulty} readOnly />
            </label>
            <label className="field wide">
              <span>URL</span>
              <input value={selectedProblem.problemUrl} readOnly />
            </label>
            <label className="field wide">
              <span>Hints</span>
              <input value={(selectedProblem.hints ?? []).join(" | ") || "No hints returned"} readOnly />
            </label>
          </div>
          <label className="field">
            <span>Description</span>
            <textarea value={description || "No description returned."} readOnly rows={4} />
          </label>
          <label className="field">
            <span>Your notes</span>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={5} placeholder="Approach, mistakes, edge cases, or retry notes." />
          </label>
          {saveStatus && <Notice kind={saveStatus.includes("saved") ? "success" : "error"} inline>{saveStatus}</Notice>}
          <div className="editor-foot">
            <button className="btn btn-primary" disabled={isSaving} type="submit">
              {isSaving ? <Loader2 size={16} className="spin" /> : <CheckCircle2 size={16} />}
              Save to database
            </button>
          </div>
        </form>
      )}
    </article>
  );
}
