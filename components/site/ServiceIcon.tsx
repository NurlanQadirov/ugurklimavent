import type { ComponentType, SVGProps } from "react";

import { cn } from "@/lib/utils";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const Ventilation = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="1.6" />
    <g>
      <path d="M12 10.4c0-3 1-4.6 3-4.6 1.5 0 2.3 1 2.3 2.2 0 2-2 3-5.3 3" />
      <path
        d="M12 10.4c0-3 1-4.6 3-4.6 1.5 0 2.3 1 2.3 2.2 0 2-2 3-5.3 3"
        transform="rotate(120 12 12)"
      />
      <path
        d="M12 10.4c0-3 1-4.6 3-4.6 1.5 0 2.3 1 2.3 2.2 0 2-2 3-5.3 3"
        transform="rotate(240 12 12)"
      />
    </g>
  </svg>
);

const Cooling = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 2.5v19M4.2 7.25l15.6 9.5M19.8 7.25l-15.6 9.5" />
    <path d="M9.6 4.6 12 6.4l2.4-1.8M9.6 19.4 12 17.6l2.4 1.8" />
    <path d="M4.9 11.1 4.4 8.2l2.9-.4M19.1 12.9l.5 2.9-2.9.4" />
  </svg>
);

const Fire = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 4.5h16M12 4.5v3" />
    <path d="M8.6 8.2h6.8" />
    <path d="M12 21c2.9 0 5-2 5-4.7 0-3-2.6-4.4-3.4-7.1-1.9 1.2-2.4 3-2 4.5-1-.4-1.4-1.3-1.4-2.3-1.8 1.3-3.2 2.9-3.2 4.9C7 19 9.1 21 12 21Z" />
  </svg>
);

const Heating = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="6" width="17" height="12" rx="2" />
    <path d="M8 6v12M12 6v12M16 6v12" />
    <path d="M3.5 9.5h17M3.5 14.5h17" />
  </svg>
);

const Chiller = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3" y="4.5" width="18" height="15" rx="2" />
    <path d="M6.5 8.5h11M6.5 12h11M6.5 15.5h11" />
    <circle cx="12" cy="12" r="3.4" className="stroke-current" />
  </svg>
);

const Kitchen = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 11.5 7 4.5h10l4 7Z" />
    <path d="M3 11.5h18" />
    <path d="M6.5 14.5v1.2M12 14.5v1.2M17.5 14.5v1.2" />
    <path d="M5 19.5h14" />
  </svg>
);

const Infrastructure = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 8.5 16 5l1.6 5.8L4.6 14.3Z" />
    <path d="m17.6 7.6 3.4-1.2v6l-3.4-1.2" />
    <path d="M7.5 14.8V19M7.5 19h4" />
    <path d="M13.5 15.6 12 18.6h2.2l-1.4 2.6" />
  </svg>
);

const ICONS: Record<string, ComponentType<IconProps>> = {
  ventilation: Ventilation,
  cooling: Cooling,
  fire: Fire,
  heating: Heating,
  chillers: Chiller,
  kitchens: Kitchen,
  infrastructure: Infrastructure,
};

export function ServiceIcon({ id, className }: { id: string; className?: string }) {
  const Icon = ICONS[id];
  if (!Icon) return null;

  return <Icon aria-hidden className={cn("h-6 w-6", className)} />;
}
