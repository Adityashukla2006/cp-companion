import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@/app/utils/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [GitHub, Google],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    // Surface the stored CP usernames on the session so client/server code can read them.
    session({ session, user }) {
      session.user.leetcodeUsername = user.leetcodeUsername ?? null;
      session.user.codeforcesUsername = user.codeforcesUsername ?? null;
      return session;
    },
  },
});
