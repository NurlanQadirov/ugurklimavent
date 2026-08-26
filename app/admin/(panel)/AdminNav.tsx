"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  Grid2x2,
  LayoutDashboard,
  Menu,
  MessageCircleQuestion,
  Route,
  Settings,
  TrendingUp,
  X,
} from "lucide-react";

import { BrandLogo } from "@/components/site/BrandLogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/ui";

const LINKS = [
  { href: "/admin", label: "İdarə paneli", icon: LayoutDashboard },
  { href: "/admin/services", label: "Xidmətlər", icon: Grid2x2 },
  { href: "/admin/process", label: "Mərhələlər", icon: Route },
  { href: "/admin/sectors", label: "Sahələr", icon: Grid2x2 },
  { href: "/admin/faqs", label: "Suallar", icon: MessageCircleQuestion },
  { href: "/admin/stats", label: "Rəqəmlər", icon: TrendingUp },
  { href: "/admin/settings", label: "Tənzimləmələr", icon: Settings },
] as const;

function useIsActive() {
  const pathname = usePathname();

  return (href: string) =>
    // `/admin` is a prefix of every other link, so it only matches exactly —
    // otherwise Dashboard would stay highlighted on every page.
    href === "/admin" ? pathname === href : pathname.startsWith(href);
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const isActive = useIsActive();

  return (
    <nav aria-label="Bölmələr" className="flex flex-col gap-0.5 p-3">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-colors duration-150",
              active
                ? "bg-white/[0.07] text-white"
                : "text-white/45 hover:bg-white/[0.04] hover:text-white/80",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function NavHeader() {
  return (
    <div className="flex h-14 shrink-0 items-center gap-3 border-b border-white/[0.07] px-5">
      <BrandLogo />
      <span className="text-[13px] font-medium tracking-tight text-white">
        Məzmun
      </span>
    </div>
  );
}

function NavFooter() {
  return (
    <div className="mt-auto border-t border-white/[0.07] p-3">
      <Link
        href="/az"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-white/45 transition-colors hover:bg-white/[0.04] hover:text-white/80"
      >
        <ExternalLink className="h-4 w-4 shrink-0" />
        Sayta bax
      </Link>
    </div>
  );
}

/** Desktop sidebar. */
export function AdminNav() {
  return (
    <>
      <NavHeader />
      <NavLinks />
      <NavFooter />
    </>
  );
}

/** The same navigation as a sheet, for the header on small screens. */
export function AdminNavMobile() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Menyunu aç"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Menu />
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            aria-label="Menyunu bağla"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-black/70 backdrop-blur-sm"
          />
          <div className="relative flex h-full w-64 flex-col border-r border-white/10 bg-carbon">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.07] px-5">
              <div className="flex items-center gap-3">
                <BrandLogo />
                <span className="text-[13px] font-medium text-white">Məzmun</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Menyunu bağla"
                onClick={() => setOpen(false)}
              >
                <X />
              </Button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
            <NavFooter />
          </div>
        </div>
      ) : null}
    </div>
  );
}
