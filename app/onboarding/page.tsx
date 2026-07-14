import { redirect } from "next/navigation";
import { UserCog } from "lucide-react";

import { auth } from "@/auth";
import { OnboardingForm } from "./OnboardingForm";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <main className="auth">
      <span className="auth-orb a" />
      <span className="auth-orb b" />
      <div className="auth-card">
        <div className="auth-logo"><UserCog size={26} /></div>
        <h1>One last step</h1>
        <p>Enter your competitive programming usernames so we can pull in your stats.</p>
        <OnboardingForm
          defaultLeetcode={session.user.leetcodeUsername}
          defaultCodeforces={session.user.codeforcesUsername}
        />
      </div>
    </main>
  );
}
