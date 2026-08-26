"use client";

import { useFormStatus } from "react-dom";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

function Submit() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="ghost"
      size="sm"
      disabled={pending}
      className="gap-2"
    >
      <LogOut />
      <span className="hidden sm:inline">{pending ? "Çıxılır…" : "Çıxış"}</span>
    </Button>
  );
}

/**
 * A real form posting to a Server Action rather than an `onClick` handler, so
 * signing out works before hydration and cannot be left half-done by a
 * mid-flight navigation.
 */
export function SignOutButton({ action }: { action: () => Promise<void> }) {
  return (
    <form action={action}>
      <Submit />
    </form>
  );
}
