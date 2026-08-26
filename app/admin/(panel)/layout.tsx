import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";
import { AdminNav, AdminNavMobile } from "./AdminNav";
import { SignOutButton } from "./SignOutButton";

/**
 * The guard.
 *
 * Placed on the `(panel)` group rather than on `app/admin/layout.tsx` so that
 * `/admin/login`, which is a sibling, stays reachable. Every route that renders
 * inside this layout has a session by the time it runs.
 *
 * This is not the only check. The Server Actions in `lib/admin/actions.ts`
 * each call `requireUser()` as well, because an action is reachable by a direct
 * POST that never renders a layout.
 */
export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/admin/login" });
  }

  return (
    <div className="flex min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-white/[0.07] bg-carbon lg:flex">
        <AdminNav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-white/[0.07] bg-void/80 px-4 backdrop-blur-xl sm:px-6">
          <AdminNavMobile />

          <div className="flex min-w-0 items-center gap-3">
            <span className="truncate text-[13px] text-white/40">
              {session.user.email}
            </span>
            <SignOutButton action={handleSignOut} />
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
