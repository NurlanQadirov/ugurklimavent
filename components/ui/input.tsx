"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "@/lib/ui";

const fieldClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/25 transition-colors duration-150 focus-visible:border-volt/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt/25 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-alarm/60 aria-[invalid=true]:focus-visible:ring-alarm/25";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn(fieldClass, "h-9", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn(fieldClass, "min-h-24 resize-y", className)} {...props} />;
}

export function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn(
        "text-[13px] font-medium text-white/70 peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

/**
 * One labelled field with its validation message.
 *
 * `error` is wired to `aria-describedby` and `aria-invalid` rather than only
 * being painted red, so the reason a submit failed is announced instead of just
 * shown — the form is the whole point of this panel and it has to be usable
 * without seeing it.
 */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const errorId = `${htmlFor}-error`;
  const hintId = `${htmlFor}-hint`;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error ? (
        <p id={hintId} className="text-xs leading-relaxed text-white/35">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-xs text-alarm/90">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { fieldClass };
