import type { Metadata } from "next";

import { getCompanySettings } from "@/lib/admin/queries";
import { SettingsForm } from "./SettingsForm";

export const metadata: Metadata = { title: "Tənzimləmələr" };

export default async function SettingsPage() {
  const company = await getCompanySettings();

  // Only possible on a database that was migrated but never seeded. Saying so is
  // more useful than rendering a form whose save would create a second source of
  // truth for the company record.
  if (!company) {
    return (
      <p className="text-[13px] text-white/45">
        Şirkət qeydi tapılmadı. Yaratmaq üçün{" "}
        <code className="font-mono">npm run db:seed</code> əmrini işlədin.
      </p>
    );
  }

  return <SettingsForm company={company} />;
}
