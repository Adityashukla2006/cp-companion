"use server";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/app/utils/prisma";

export type OnboardingState = { error: string | null };

export async function saveUsernames(
  _prevState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const leetcodeUsername = String(formData.get("leetcodeUsername") ?? "").trim();
  const codeforcesUsername = String(formData.get("codeforcesUsername") ?? "").trim();

  if (!leetcodeUsername || !codeforcesUsername) {
    return { error: "Both usernames are required." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { leetcodeUsername, codeforcesUsername },
  });

  redirect("/");
}
