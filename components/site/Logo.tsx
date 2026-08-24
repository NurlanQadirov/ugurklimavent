import { cn } from "@/lib/utils";

/** Abstract airflow mark: three laminar streams passing a vane. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      aria-hidden
      className={cn("h-7 w-7", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    >
      <rect
        x="1.4"
        y="1.4"
        width="25.2"
        height="25.2"
        rx="7"
        className="stroke-white/15"
      />
      <path d="M6.5 10.5h9.2a3 3 0 1 0-3-3" />
      <path d="M6.5 14h12.4a3 3 0 1 1-3 3" className="stroke-volt" />
      <path d="M6.5 17.5h7.8" />
    </svg>
  );
}
