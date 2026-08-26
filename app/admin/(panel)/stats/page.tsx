import type { Metadata } from "next";

import { listStats } from "@/lib/admin/queries";
import { StatsClient } from "./StatsClient";

export const metadata: Metadata = { title: "Rəqəmlər" };

export default async function Page() {
  const rows = await listStats();
  return <StatsClient rows={rows} />;
}
