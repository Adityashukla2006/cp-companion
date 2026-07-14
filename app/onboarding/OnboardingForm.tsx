"use client";

import { useActionState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

import { saveUsernames, type OnboardingState } from "./actions";

const initialState: OnboardingState = { error: null };

export function OnboardingForm({
  defaultLeetcode,
  defaultCodeforces,
}: {
  defaultLeetcode?: string | null;
  defaultCodeforces?: string | null;
}) {
  const [state, formAction, pending] = useActionState(saveUsernames, initialState);

  return (
    <form action={formAction} className="onb-form">
      <label className="field">
        <span>LeetCode username</span>
        <input name="leetcodeUsername" defaultValue={defaultLeetcode ?? ""} placeholder="e.g. adityas_140" autoComplete="off" required />
      </label>
      <label className="field">
        <span>Codeforces handle</span>
        <input name="codeforcesUsername" defaultValue={defaultCodeforces ?? ""} placeholder="e.g. adityas140" autoComplete="off" required />
      </label>

      {state.error && <p className="form-error">{state.error}</p>}

      <button type="submit" className="btn btn-primary" disabled={pending} style={{ width: "100%" }}>
        {pending ? <Loader2 size={16} className="spin" /> : <ArrowRight size={16} />}
        {pending ? "Saving…" : "Enter command center"}
      </button>
    </form>
  );
}
