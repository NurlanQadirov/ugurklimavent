"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { auth } from "@/auth";
import { LOCALES } from "@/i18n/config";
import { db } from "@/lib/db";
import { stringifyList } from "@/lib/serialize";
import {
  companySchema,
  faqSchema,
  phaseSchema,
  sectorSchema,
  serviceSchema,
  statSchema,
} from "./schemas";

/**
 * Every mutation the admin panel can perform.
 *
 * Three rules hold for all of them:
 *
 * 1. `requireUser()` first. Server Actions are reachable by a direct POST, not
 *    only through the UI, so the session check cannot live in the layout alone.
 * 2. Re-parse the input with the same Zod schema the form used. The client's
 *    validation is a convenience for the editor; this is the one that counts.
 * 3. `revalidateContent()` last, so the statically prerendered public pages are
 *    regenerated. Without it a save would update the database and change
 *    nothing a visitor can see until the next deploy.
 */

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

/**
 * Regenerates every public route.
 *
 * `"layout"` rather than a list of paths: the footer and the navbar read the
 * company record and sit in the shared layout, so a settings change affects all
 * fifteen locale pages, not just the one whose section was edited.
 */
function revalidateContent() {
  revalidatePath("/[lang]", "layout");
  revalidatePath("/sitemap.xml");
}

function fail(error: unknown): ActionResult {
  if (error instanceof z.ZodError) {
    return {
      ok: false,
      error: "Qeyd olunmuş sahələri düzəldin.",
      fieldErrors: z.flattenError(error).fieldErrors as Record<string, string[]>,
    };
  }

  // P2002 is the unique constraint on `key`. Surfacing it as a field message is
  // far more useful than "something went wrong" when the cause is a duplicate
  // slug the editor can simply change.
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return {
      ok: false,
      error: "Bu açar başqa bir elementdə istifadə olunur. Başqasını seçin.",
      fieldErrors: { key: ["Artıq istifadə olunur"] },
    };
  }

  if (error instanceof Error && error.message === "Unauthorized") {
    return { ok: false, error: "Sessiya bitib. Yenidən daxil olun." };
  }

  console.error(error);
  return { ok: false, error: "Xəta baş verdi. Yenidən cəhd edin." };
}

/* -------------------------------------------------------------------------- */
/* Services                                                                    */
/* -------------------------------------------------------------------------- */

export async function saveService(
  id: string | null,
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireUser();
    const data = serviceSchema.parse(input);

    const structure = {
      key: data.key,
      iconPath: data.iconPath,
      critical: data.critical,
      order: data.order,
    };

    await db.$transaction(async (tx) => {
      /*
        `index` is not in `structure`, so an update leaves the stored column
        exactly as it was and a create writes it empty. The site derives the
        card number from render position (`lib/site-content.ts`) and nothing
        reads this column any more — it is only still here because dropping it
        is a migration. Writing a plausible-looking number into it would put a
        second, unread claim about the ordering back in the database, which is
        the bug this change removes.
      */
      const row = id
        ? await tx.service.update({ where: { id }, data: structure })
        : await tx.service.create({ data: { ...structure, index: "" } });

      for (const locale of LOCALES) {
        const copy = data.translations[locale];
        const values = {
          title: copy.title,
          blurb: copy.blurb,
          tags: stringifyList(copy.tags),
        };
        await tx.serviceTranslation.upsert({
          where: { serviceId_locale: { serviceId: row.id, locale } },
          update: values,
          create: { serviceId: row.id, locale, ...values },
        });
      }
    });

    revalidateContent();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteService(id: string): Promise<ActionResult> {
  try {
    await requireUser();
    await db.service.delete({ where: { id } });
    revalidateContent();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/* -------------------------------------------------------------------------- */
/* FAQs                                                                        */
/* -------------------------------------------------------------------------- */

export async function saveFaq(
  id: string | null,
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireUser();
    const data = faqSchema.parse(input);
    const structure = { key: data.key, order: data.order };

    await db.$transaction(async (tx) => {
      const row = id
        ? await tx.faq.update({ where: { id }, data: structure })
        : await tx.faq.create({ data: structure });

      for (const locale of LOCALES) {
        const values = data.translations[locale];
        await tx.faqTranslation.upsert({
          where: { faqId_locale: { faqId: row.id, locale } },
          update: values,
          create: { faqId: row.id, locale, ...values },
        });
      }
    });

    revalidateContent();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteFaq(id: string): Promise<ActionResult> {
  try {
    await requireUser();
    await db.faq.delete({ where: { id } });
    revalidateContent();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/* -------------------------------------------------------------------------- */
/* Sectors                                                                     */
/* -------------------------------------------------------------------------- */

export async function saveSector(
  id: string | null,
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireUser();
    const data = sectorSchema.parse(input);
    const structure = { key: data.key, order: data.order };

    await db.$transaction(async (tx) => {
      const row = id
        ? await tx.sector.update({ where: { id }, data: structure })
        : await tx.sector.create({ data: structure });

      for (const locale of LOCALES) {
        const values = data.translations[locale];
        await tx.sectorTranslation.upsert({
          where: { sectorId_locale: { sectorId: row.id, locale } },
          update: values,
          create: { sectorId: row.id, locale, ...values },
        });
      }
    });

    revalidateContent();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteSector(id: string): Promise<ActionResult> {
  try {
    await requireUser();
    await db.sector.delete({ where: { id } });
    revalidateContent();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/* -------------------------------------------------------------------------- */
/* Process                                                                     */
/* -------------------------------------------------------------------------- */

export async function savePhase(
  id: string | null,
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireUser();
    const data = phaseSchema.parse(input);
    // See `saveService` for why `index` is neither taken from the form nor
    // written back on update.
    const structure = { key: data.key, order: data.order };

    await db.$transaction(async (tx) => {
      const row = id
        ? await tx.phase.update({ where: { id }, data: structure })
        : await tx.phase.create({ data: { ...structure, index: "" } });

      for (const locale of LOCALES) {
        const copy = data.translations[locale];
        const values = {
          title: copy.title,
          blurb: copy.blurb,
          outputs: stringifyList(copy.outputs),
        };
        await tx.phaseTranslation.upsert({
          where: { phaseId_locale: { phaseId: row.id, locale } },
          update: values,
          create: { phaseId: row.id, locale, ...values },
        });
      }
    });

    revalidateContent();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deletePhase(id: string): Promise<ActionResult> {
  try {
    await requireUser();
    await db.phase.delete({ where: { id } });
    revalidateContent();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/* -------------------------------------------------------------------------- */
/* Stats                                                                       */
/* -------------------------------------------------------------------------- */

export async function saveStat(
  id: string | null,
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireUser();
    const data = statSchema.parse(input);
    const structure = {
      key: data.key,
      value: data.value,
      // Stored as NULL rather than "", so the renderer's `prefix ? … : null`
      // check keeps working and the JSON has no empty strings in it.
      prefix: data.prefix || null,
      suffix: data.suffix || null,
      order: data.order,
    };

    await db.$transaction(async (tx) => {
      const row = id
        ? await tx.stat.update({ where: { id }, data: structure })
        : await tx.stat.create({ data: structure });

      for (const locale of LOCALES) {
        const values = data.translations[locale];
        await tx.statTranslation.upsert({
          where: { statId_locale: { statId: row.id, locale } },
          update: values,
          create: { statId: row.id, locale, ...values },
        });
      }
    });

    revalidateContent();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteStat(id: string): Promise<ActionResult> {
  try {
    await requireUser();
    await db.stat.delete({ where: { id } });
    revalidateContent();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/* -------------------------------------------------------------------------- */
/* Company                                                                     */
/* -------------------------------------------------------------------------- */

export async function saveCompany(input: unknown): Promise<ActionResult> {
  try {
    await requireUser();
    const data = companySchema.parse(input);

    const values = {
      name: data.name,
      short: data.short,
      email: data.email,
      phones: stringifyList(data.phones),
      addressStreet: data.addressStreet,
      addressDistrict: data.addressDistrict,
      addressLocality: data.addressLocality,
      addressRegion: data.addressRegion,
      addressCountry: data.addressCountry,
    };

    await db.companySettings.upsert({
      where: { id: "company" },
      update: values,
      create: { id: "company", ...values },
    });

    revalidateContent();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/* -------------------------------------------------------------------------- */
/* Reordering                                                                  */
/* -------------------------------------------------------------------------- */

const MODELS = {
  service: "service",
  faq: "faq",
  sector: "sector",
  phase: "phase",
  stat: "stat",
} as const;

export type Orderable = keyof typeof MODELS;

/**
 * Moves one row up or down among its siblings by swapping `order` with its
 * neighbour.
 *
 * A swap rather than a rewrite of the whole list: it is two updates regardless
 * of how long the list is, and it cannot corrupt the ordering of rows the
 * editor was not looking at.
 */
export async function reorder(
  model: Orderable,
  id: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  try {
    await requireUser();

    // Safe: `model` indexes a fixed literal map, so this can only ever resolve
    // to one of the five delegates named above.
    const delegate = db[MODELS[model]] as {
      findUnique: (args: unknown) => Promise<{ id: string; order: number } | null>;
      findFirst: (args: unknown) => Promise<{ id: string; order: number } | null>;
      update: (args: unknown) => Promise<unknown>;
    };

    const current = await delegate.findUnique({ where: { id } });
    if (!current) return { ok: false, error: "Bu element artıq mövcud deyil." };

    const neighbour = await delegate.findFirst({
      where:
        direction === "up"
          ? { order: { lt: current.order } }
          : { order: { gt: current.order } },
      orderBy: { order: direction === "up" ? "desc" : "asc" },
    });

    // Already at the end of the list — a no-op, not an error.
    if (!neighbour) return { ok: true };

    await db.$transaction([
      delegate.update({ where: { id: current.id }, data: { order: neighbour.order } }),
      delegate.update({ where: { id: neighbour.id }, data: { order: current.order } }),
    ] as never);

    revalidateContent();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}
