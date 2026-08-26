import type { Metadata } from "next";

import { listPhases } from "@/lib/admin/queries";
import { ProcessClient } from "./ProcessClient";

export const metadata: Metadata = { title: "Mərhələlər" };

export default async function Page() {
  const rows = await listPhases();
  return <ProcessClient rows={rows} />;
}
