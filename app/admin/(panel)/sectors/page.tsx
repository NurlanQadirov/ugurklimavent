import type { Metadata } from "next";

import { listSectors } from "@/lib/admin/queries";
import { SectorsClient } from "./SectorsClient";

export const metadata: Metadata = { title: "Sahələr" };

export default async function Page() {
  const rows = await listSectors();
  return <SectorsClient rows={rows} />;
}
