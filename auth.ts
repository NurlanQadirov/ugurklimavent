import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { db } from "@/lib/db";

/**
 * Authentication for `/admin`.
 *
 * Credentials rather than an OAuth provider: this is a single-tenant back office
 * for one contractor, and adding Google sign-in would mean either trusting any
 * Google account or maintaining an allow-list — more moving parts than a
 * password row for the same result.
 *
 * The session is a JWT, which is what the Credentials provider requires. There
 * is no database session table to keep in step, and the admin routes are
 * dynamic anyway because they read the cookie.
 */

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await db.user.findUnique({ where: { email } });

        /**
         * Compare against a dummy hash when the email is unknown.
         *
         * Returning early instead would make a miss measurably faster than a
         * wrong password, which is enough to enumerate valid addresses. Both
         * paths now pay the same bcrypt cost.
         */
        if (!user) {
          await bcrypt.compare(password, DUMMY_HASH);
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});

/** A real bcrypt hash of a value nothing can match, for the timing-equaliser above. */
const DUMMY_HASH =
  "$2a$12$C6UzMDM.H6dfI/f/IKcEe.aQ0/1cP3xJqZ7g6h1r5H1yQjB5xq0Hy";
