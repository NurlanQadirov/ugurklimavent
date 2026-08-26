import type { Metadata } from "next";

import { listFaqs } from "@/lib/admin/queries";
import { FaqsClient } from "./FaqsClient";

export const metadata: Metadata = { title: "Suallar" };

export default async function Page() {
  const rows = await listFaqs();
  return <FaqsClient rows={rows} />;
}
