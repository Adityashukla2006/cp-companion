import { redirect } from "next/navigation";
import { Code2 } from "lucide-react";

import { auth } from "@/auth";
import { SignInButtons } from "./SignInButtons";

export default async function SignInPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="auth">
      <span className="auth-orb a" />
      <span className="auth-orb b" />
      <div className="auth-card">
        <div className="auth-logo"><Code2 size={26} /></div>
        <h1>CP Companion</h1>
        <p>Your command center for ratings, contests, and practice momentum across LeetCode and Codeforces.</p>
        <SignInButtons />
        <p className="auth-fine">Sign in to sync your stats and saved notes.</p>
      </div>
    </main>
  );
}
