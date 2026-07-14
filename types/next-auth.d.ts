import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    leetcodeUsername?: string | null;
    codeforcesUsername?: string | null;
  }

  interface Session {
    user: {
      leetcodeUsername?: string | null;
      codeforcesUsername?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser {
    leetcodeUsername?: string | null;
    codeforcesUsername?: string | null;
  }
}
