import type { Metadata } from "next";

import { listServices, listStats } from "@/lib/admin/queries";
import { StatsClient } from "./StatsClient";

export const metadata: Metadata = { title: "Rəqəmlər" };

export default async function Page() {
  /*
    The service count is what the "disciplines in-house" figure resolves to on
    the site, so the panel is given it too — a stat the editor cannot edit
    should still show the number the page will print, not the stale column.
  */
  const [rows, services] = await Promise.all([listStats(), listServices()]);
  return <StatsClient rows={rows} serviceCount={services.length} />;
}
