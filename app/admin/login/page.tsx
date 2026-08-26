import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Daxil ol" };

export default async function LoginPage() {
  // Already signed in — skip the form rather than showing a login page that
  // immediately bounces once submitted.
  const session = await auth();
  if (session?.user) redirect("/admin");

  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-16">
      {/* The site's own accent wash, so the panel reads as part of the same product. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(700px_circle_at_50%_0%,rgba(29,123,255,0.10),transparent_65%)]"
      />
      <LoginForm />
    </main>
  );
}
