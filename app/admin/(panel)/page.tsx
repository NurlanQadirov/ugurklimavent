import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { Badge, Card, CardContent } from "@/components/ui/card";
import { LOCALE_LABELS, type Locale } from "@/i18n/config";
import { getCounts, getIncompleteTranslations } from "@/lib/admin/queries";

const TILES = [
  { href: "/admin/services", label: "Xidmətlər", key: "services" },
  { href: "/admin/process", label: "Mərhələlər", key: "phases" },
  { href: "/admin/sectors", label: "Sahələr", key: "sectors" },
  { href: "/admin/faqs", label: "Suallar", key: "faqs" },
  { href: "/admin/stats", label: "Rəqəmlər", key: "stats" },
] as const;

export default async function DashboardPage() {
  const [counts, gaps] = await Promise.all([
    getCounts(),
    getIncompleteTranslations(),
  ]);

  return (
    <>
      <PageHeader
        title="İdarə paneli"
        description="Saytda göstərilən bütün məzmun, üç dildə. Yadda saxlandığı anda sayta çıxır."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className="group rounded-2xl border border-white/[0.07] bg-white/[0.015] p-5 transition-colors duration-150 hover:border-white/15 hover:bg-white/[0.04]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
                  {tile.label}
                </p>
                <p className="mt-2 text-3xl font-medium tracking-tight text-white">
                  {counts[tile.key]}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-white/20 transition-colors group-hover:text-white/60" />
            </div>
          </Link>
        ))}
      </div>

      {/*
        Only rendered when there is something wrong. A permanent "all good"
        panel trains an editor to ignore this corner of the screen, which is
        exactly where the warning has to be noticed.
      */}
      {gaps.length ? (
        <Card className="mt-8 border-alarm/20">
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-alarm/80" />
              <div>
                <h2 className="text-sm font-medium text-white">
                  Çatışmayan tərcümələr
                </h2>
                <p className="mt-1 text-[13px] leading-relaxed text-white/40">
                  Bu elementlərin bir və ya bir neçə dildə mətni yoxdur. Mətni
                  olmayan element həmin dilin səhifələrində boş göstərilmir —
                  ümumiyyətlə gizlədilir.
                </p>
              </div>
            </div>

            <ul className="flex flex-col gap-2">
              {gaps.map((gap) => (
                <li
                  key={`${gap.collection}-${gap.key}`}
                  className="flex flex-wrap items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
                    {gap.collection}
                  </span>
                  <span className="text-[13px] text-white/70">{gap.key}</span>
                  <span className="ml-auto flex gap-1.5">
                    {gap.missing.map((locale) => (
                      <Badge key={locale} variant="alarm">
                        {LOCALE_LABELS[locale as Locale]}
                      </Badge>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
