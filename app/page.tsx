import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardHome } from "./components/dashboard/DashboardHome";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  const { leetcodeUsername, codeforcesUsername, name, image } = session.user;

  if (!leetcodeUsername || !codeforcesUsername) {
    redirect("/onboarding");
  }

  return (
    <DashboardHome
      name={name ?? leetcodeUsername}
      image={image}
      leetcodeUsername={leetcodeUsername}
      codeforcesUsername={codeforcesUsername}
    />
  );
}
