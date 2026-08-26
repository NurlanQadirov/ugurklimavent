import type { Metadata } from "next";

import { listServices } from "@/lib/admin/queries";
import { ServicesClient } from "./ServicesClient";

export const metadata: Metadata = { title: "Xidmətlər" };

export default async function ServicesPage() {
  const rows = await listServices();
  return <ServicesClient rows={rows} />;
}
