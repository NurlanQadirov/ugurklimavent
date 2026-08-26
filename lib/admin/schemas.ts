import { z } from "zod";

import { LOCALES } from "@/i18n/config";

/**
 * One schema per entity, shared by the client form and the Server Action.
 *
 * The Server Action re-parses with the same schema rather than trusting the
 * client. A Server Action is reachable by a direct POST, so client-side
 * validation is a convenience for the editor and nothing more.
 */

const trimmed = (max: number) => z.string().trim().max(max);
const required = (label: string, max: number) =>
  trimmed(max).min(1, `${label} sahəsi doldurulmalıdır`);

/** A slug that is safe to use in an `id`, a CSS selector and a URL fragment. */
const slug = z
  .string()
  .trim()
  .min(1, "Açar doldurulmalıdır")
  .max(48)
  .regex(
    /^[a-z][a-z0-9-]*$/,
    "Kiçik hərf, rəqəm və defis; hərflə başlamalıdır",
  );

/**
 * Tags and outputs arrive from a textarea as one item per line. The form splits
 * them before submitting; this only has to reject the empty strings a stray
 * blank line would otherwise leave behind.
 */
const stringList = z.array(trimmed(80).min(1)).max(12);

/**
 * Copy for every locale, always. A row is only rendered for a locale it has a
 * translation in, so allowing a partial save would silently drop the item from
 * one language — the failure mode this panel exists to prevent.
 */
function everyLocale<T extends z.ZodTypeAny>(copy: T) {
  return z.object(
    Object.fromEntries(LOCALES.map((locale) => [locale, copy])) as Record<
      (typeof LOCALES)[number],
      T
    >,
  );
}

export const localeKeys = LOCALES;

/* -------------------------------------------------------------------------- */
/* Services                                                                    */
/* -------------------------------------------------------------------------- */

export const serviceCopySchema = z.object({
  title: required("Başlıq", 80),
  blurb: required("Təsvir", 600),
  tags: stringList,
});

export const serviceSchema = z.object({
  key: slug,
  /**
   * A path under `/uploads/`, produced by `uploadServiceIcon`. Constrained to
   * that prefix so a hand-crafted POST cannot point the card's `<img>` at an
   * arbitrary URL and turn the grid into a beacon for a third-party host.
   *
   * There is no `span`: the card footprint comes from the service's position
   * against the fixed bento slots in `lib/bento.ts`.
   */
  iconPath: z
    .string()
    .regex(/^\/uploads\/services\/[A-Za-z0-9_-]+\.[a-z]{3,4}$/, "Yanlış ikon ünvanı")
    .nullable(),
  critical: z.boolean(),
  order: z.number().int().min(0).max(999),
  translations: everyLocale(serviceCopySchema),
});

/* -------------------------------------------------------------------------- */
/* FAQs                                                                        */
/* -------------------------------------------------------------------------- */

export const faqCopySchema = z.object({
  question: required("Sual", 200),
  answer: required("Cavab", 2000),
});

export const faqSchema = z.object({
  key: slug,
  order: z.number().int().min(0).max(999),
  translations: everyLocale(faqCopySchema),
});

/* -------------------------------------------------------------------------- */
/* Sectors                                                                     */
/* -------------------------------------------------------------------------- */

export const sectorCopySchema = z.object({
  name: required("Ad", 80),
  detail: required("Təfərrüat", 300),
});

export const sectorSchema = z.object({
  key: slug,
  order: z.number().int().min(0).max(999),
  translations: everyLocale(sectorCopySchema),
});

/* -------------------------------------------------------------------------- */
/* Process                                                                     */
/* -------------------------------------------------------------------------- */

export const phaseCopySchema = z.object({
  title: required("Başlıq", 120),
  blurb: required("Təsvir", 600),
  outputs: stringList,
});

export const phaseSchema = z.object({
  key: slug,
  order: z.number().int().min(0).max(999),
  translations: everyLocale(phaseCopySchema),
});

/* -------------------------------------------------------------------------- */
/* Stats                                                                       */
/* -------------------------------------------------------------------------- */

export const statCopySchema = z.object({
  label: required("Etiket", 60),
  note: required("Qeyd", 200),
});

export const statSchema = z.object({
  key: slug,
  value: z.number().int().min(0).max(1_000_000),
  prefix: trimmed(8).optional().or(z.literal("")),
  suffix: trimmed(8).optional().or(z.literal("")),
  order: z.number().int().min(0).max(999),
  translations: everyLocale(statCopySchema),
});

/* -------------------------------------------------------------------------- */
/* Company                                                                     */
/* -------------------------------------------------------------------------- */

export const companySchema = z.object({
  name: required("Şirkət adı", 120),
  short: required("Qısa ad", 80),
  email: z.email("Düzgün e-poçt ünvanı daxil edin").max(160),
  /**
   * At least one number: the footer and the mobile menu both dial
   * `phones[0]` directly, so an empty list would render a dead `tel:` link.
   */
  phones: z
    .array(trimmed(40).min(1))
    .min(1, "Ən azı bir telefon nömrəsi əlavə edin")
    .max(6),
  addressStreet: required("Küçə", 120),
  addressDistrict: required("Rayon", 80),
  addressLocality: required("Şəhər", 80),
  addressRegion: required("Region", 80),
  /** ISO 3166-1 alpha-2 — schema.org consumers expect the code, not the name. */
  addressCountry: z
    .string()
    .trim()
    .regex(/^[A-Z]{2}$/, "İki hərfli ölkə kodu, məsələn AZ"),
});

/* -------------------------------------------------------------------------- */
/* Form variants                                                               */
/* -------------------------------------------------------------------------- */

/**
 * The two collections with list fields are edited as one-item-per-line text, so
 * their form binds a `string` where the stored schema holds a `string[]`.
 *
 * Derived with `.extend()` rather than written out again: every other rule —
 * the slug pattern, the length caps, the required-in-every-locale rule — stays
 * defined once and cannot drift between what the form accepts and what the
 * Server Action will actually store.
 */
const listInput = z.string();

export const serviceFormSchema = serviceSchema.extend({
  translations: everyLocale(serviceCopySchema.extend({ tags: listInput })),
});

export const phaseFormSchema = phaseSchema.extend({
  translations: everyLocale(phaseCopySchema.extend({ outputs: listInput })),
});

export const companyFormSchema = companySchema.extend({ phones: listInput });

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
export type PhaseFormValues = z.infer<typeof phaseFormSchema>;
export type CompanyFormValues = z.infer<typeof companyFormSchema>;

export type ServiceInput = z.infer<typeof serviceSchema>;
export type FaqInput = z.infer<typeof faqSchema>;
export type SectorInput = z.infer<typeof sectorSchema>;
export type PhaseInput = z.infer<typeof phaseSchema>;
export type StatInput = z.infer<typeof statSchema>;
export type CompanyInput = z.infer<typeof companySchema>;
