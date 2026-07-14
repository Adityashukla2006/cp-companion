"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Gauge, Loader2, Plus, Trophy } from "lucide-react";
import Link from "next/link";

import { fetchJson } from "@/app/utils/helpers";
import { normalizeCodeforcesDescription } from "@/app/utils/codeforcesDescription";
import { CodeforcesSubmissionList } from "../activity/Feed";
import { RatingChart } from "../charts/RatingChart";
import { EmptyState, Notice, PanelHead, Skeleton, StatTile } from "../ui";
import type { DashboardState } from "../dashboard/types";
import { formatSigned } from "../dashboard/utils";
import { SavedCodeforcesCard, type SavedCodeforcesQuestion } from "./SavedQuestions";

const emptyForm = {
  contestName: "",
  timeLimit: "",
  memoryLimit: "",
  description: "",
  notes: "",
  url: "",
};

export function CodeforcesSection({ data, isLoading }: { data: DashboardState; isLoading: boolean }) {
  const cfUser = data.codeforces?.user;
  const recent = data.codeforces?.recentSubmissions ?? [];
  const accepted = recent.filter((submission) => submission.verdict === "OK").length;
  const failed = recent.filter((submission) => submission.verdict && submission.verdict !== "OK").length;
  const latestDelta = data.codeforces?.ratingHistory?.at(-1);
  const latestChange = latestDelta ? latestDelta.newRating - latestDelta.oldRating : null;

  const [savedQuestions, setSavedQuestions] = useState<SavedCodeforcesQuestion[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchJson<SavedCodeforcesQuestion[]>("/api/questions/codeforces")
      .then(setSavedQuestions)
      .catch(() => setSavedQuestions([]));
  }, []);

  const updateForm = (field: keyof typeof emptyForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveQuestion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const payload = { ...form, description: normalizeCodeforcesDescription(form.description) };
      const saved = await fetchJson<SavedCodeforcesQuestion>("/api/questions/codeforces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setSavedQuestions((current) => [saved, ...current]);
      setForm(emptyForm);
      setSaveStatus("Question saved.");
    } catch {
      setSaveStatus("Could not save question. Contest name, description, notes, and database connection are required.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="section-stack">
      <section className="stat-row" data-reveal>
        {isLoading ? (
          <>
            <div className="card sk sk-block" />
            <div className="card sk sk-block" />
            <div className="card sk sk-block" />
            <div className="card sk sk-block" />
          </>
        ) : (
          <>
            <StatTile label="Current rating" value={cfUser?.rating ?? null} help={cfUser?.rank ?? null} icon={Trophy} tone="cf" />
            <StatTile label="Max rating" value={cfUser?.maxRating ?? null} help={cfUser?.maxRank ?? null} icon={Gauge} tone="accent" />
            <StatTile label="Accepted (recent)" value={accepted} help={`${failed} failed or rejected`} icon={CheckCircle2} tone="green" />
            <StatTile
              label="Last rating change"
              value={formatSigned(latestChange) ?? "—"}
              help={latestDelta?.contestName ?? null}
              icon={latestChange && latestChange < 0 ? ArrowDownRight : ArrowUpRight}
              tone={latestChange && latestChange < 0 ? "red" : "green"}
            />
          </>
        )}
      </section>

      <section className="split">
        <article className="card panel" data-reveal>
          <PanelHead title="Rating growth" eyebrow="Codeforces" />
          {isLoading ? <Skeleton rows={6} /> : <RatingChart history={data.codeforces?.ratingHistory ?? []} />}
        </article>
        <article className="card panel" data-reveal>
          <PanelHead title="Recent submissions" eyebrow="Verdicts" />
          {isLoading ? <Skeleton rows={6} /> : <CodeforcesSubmissionList submissions={recent} />}
        </article>
      </section>

      <article className="card panel" data-reveal>
        <PanelHead title="Log a question" eyebrow="Codeforces notebook" />
        <form className="note-editor" onSubmit={saveQuestion}>
          <div className="field-grid">
            <label className="field">
              <span>Contest / problem name</span>
              <input value={form.contestName} onChange={(event) => updateForm("contestName", event.target.value)} placeholder="Codeforces Round 950 — B" />
            </label>
            <label className="field">
              <span>Problem URL</span>
              <input value={form.url} onChange={(event) => updateForm("url", event.target.value)} placeholder="https://codeforces.com/contest/…" />
            </label>
            <label className="field">
              <span>Time limit</span>
              <input value={form.timeLimit} onChange={(event) => updateForm("timeLimit", event.target.value)} placeholder="2 seconds" />
            </label>
            <label className="field">
              <span>Memory limit</span>
              <input value={form.memoryLimit} onChange={(event) => updateForm("memoryLimit", event.target.value)} placeholder="256 MB" />
            </label>
          </div>
          <label className="field">
            <span>Description</span>
            <textarea value={form.description} onChange={(event) => updateForm("description", event.target.value)} rows={4} placeholder="Paste the problem summary or key statement." />
          </label>
          <label className="field">
            <span>Notes</span>
            <textarea value={form.notes} onChange={(event) => updateForm("notes", event.target.value)} rows={5} placeholder="Approach, failed idea, invariant, or retry plan." />
          </label>
          {saveStatus && <Notice kind={saveStatus.includes("saved") ? "success" : "error"} inline>{saveStatus}</Notice>}
          <div className="editor-foot">
            <button className="btn btn-primary" disabled={isSaving} type="submit">
              {isSaving ? <Loader2 size={16} className="spin" /> : <Plus size={16} />}
              Save to database
            </button>
          </div>
        </form>
      </article>

      <article className="card panel" data-reveal>
        <PanelHead
          title="Saved questions"
          eyebrow={`${savedQuestions.length} logged`}
          action={savedQuestions.length > 3 ? (
            <Link href="/codeforces/problems" className="link">See all <ArrowUpRight size={15} /></Link>
          ) : undefined}
        />
        {savedQuestions.length ? (
          <div className="saved-grid" style={{ gridTemplateColumns: "1fr" }}>
            {savedQuestions.slice(0, 3).map((question, i) => (
              <SavedCodeforcesCard
                key={question.id}
                question={question}
                index={i}
                compact
                onDeleted={(id) => setSavedQuestions((current) => current.filter((item) => item.id !== id))}
                onUpdated={(updated) => setSavedQuestions((current) => current.map((item) => (item.id === updated.id ? updated : item)))}
              />
            ))}
          </div>
        ) : (
          <EmptyState>No Codeforces questions saved yet.</EmptyState>
        )}
      </article>
    </div>
  );
}
