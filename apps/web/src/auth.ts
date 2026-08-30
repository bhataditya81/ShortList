import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getOrCreateUser } from "@shortlist/data-store";
import { emailAllowedForPoc, requireAuthSecret } from "@/lib/poc-security";

function authSecret(): string {
  // Next build may import this module without runtime secrets; defer fail-closed to request time.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return process.env.AUTH_SECRET?.trim() || "build-time-placeholder-not-for-runtime";
  }
  return requireAuthSecret();
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: authSecret(),
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      authorize: async (credentials) => {
        requireAuthSecret();
        const email = credentials?.email;
        if (typeof email !== "string" || !email.includes("@")) return null;
        if (!emailAllowedForPoc(email)) return null;
        const user = await getOrCreateUser(email);
        return { id: user.id, email: user.email };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      if (user?.email) token.email = user.email;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        if (token.email) session.user.email = token.email;
      }
      return session;
    },
  },
});
