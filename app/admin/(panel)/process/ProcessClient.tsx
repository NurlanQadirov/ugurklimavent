"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/admin/DataTable";
import { EntityDialog } from "@/components/admin/EntityDialog";
import { PageHeader } from "@/components/admin/PageHeader";
import { RowActions } from "@/components/admin/RowActions";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { LOCALES } from "@/i18n/config";
import { deletePhase, savePhase } from "@/lib/admin/actions";
import type { PhaseFormValues, PhaseInput } from "@/lib/admin/schemas";
import { phaseFormSchema } from "@/lib/admin/schemas";
import type { PhaseRow } from "@/lib/admin/queries";
import { parseListInput, toListInput } from "@/lib/serialize";

const EMPTY = { title: "", blurb: "", outputs: [] as string[] };

function toForm(row: PhaseRow | null, nextOrder: number): PhaseFormValues {
  return {
    key: row?.key ?? "",
    order: row?.order ?? nextOrder,
    translations: Object.fromEntries(
      LOCALES.map((locale) => {
        const copy = row?.translations[locale] ?? EMPTY;
        return [
          locale,
          {
            title: copy.title,
            blurb: copy.blurb,
            outputs: toListInput(copy.outputs),
          },
        ];
      }),
    ) as PhaseFormValues["translations"],
  };
}

export function ProcessClient({ rows }: { rows: PhaseRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<PhaseRow | null>(null);
  const [open, setOpen] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const nextOrder = rows.length ? Math.max(...rows.map((r) => r.order)) + 1 : 0;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PhaseFormValues>({
    resolver: zodResolver(phaseFormSchema),
    defaultValues: toForm(null, 0),
  });

  function openFor(row: PhaseRow | null) {
    setFormError(null);
    setEditing(row);
    reset(toForm(row, nextOrder));
    setOpen(true);
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    const payload: PhaseInput = {
      ...values,
      translations: Object.fromEntries(
        LOCALES.map((locale) => [
          locale,
          {
            ...values.translations[locale],
            outputs: parseListInput(values.translations[locale].outputs),
          },
        ]),
      ) as PhaseInput["translations"],
    };

    const result = await savePhase(editing?.id ?? null, payload);

    if (result.ok) {
      setOpen(false);
      toast.success(editing ? "Mərhələ yeniləndi." : "Mərhələ əlavə edildi.");
      router.refresh();
    } else {
      setFormError(result.error);
    }
  });

  const columns = React.useMemo<ColumnDef<PhaseRow, unknown>[]>(
    () => [
      {
        id: "index",
        header: "№",
        size: 60,
        /*
          Read-only, and derived from the row's position — the same number the
          site derives, so the panel and the page cannot disagree. It was an
          editable field until the two drifted apart and the grid rendered
          01, 03, 02 in the DOM.
        */
        cell: ({ row }) => (
          <span className="font-mono text-[11px] text-white/35">
            {String(row.index + 1).padStart(2, "0")}
          </span>
        ),
      },
      {
        id: "title",
        header: "Mərhələ",
        accessorFn: (row) =>
          [row.key, ...LOCALES.map((l) => row.translations[l].title)].join(" "),
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <span className="font-medium text-white">
              {row.original.translations.az.title || row.original.key}
            </span>
            <span className="font-mono text-[10px] text-white/25">
              {row.original.key}
            </span>
          </div>
        ),
      },
      {
        id: "outputs",
        header: "Təhvil sənədləri",
        accessorFn: (row) => row.translations.az.outputs.join(" "),
        cell: ({ row }) => (
          <span className="text-[13px] text-white/45">
            {row.original.translations.az.outputs.length}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Əməliyyatlar</span>,
        size: 160,
        cell: ({ row }) => (
          <RowActions
            id={row.original.id}
            label={row.original.translations.az.title || row.original.key}
            model="phase"
            onEdit={() => openFor(row.original)}
            onDelete={deletePhase}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nextOrder],
  );

  return (
    <>
      <PageHeader
        title="Mərhələlər"
        description="İşin icra mərhələləri, ardıcıllıqla. Təhvil sənədləri hər mərhələnin sonunda sifarişçiyə real olaraq verilənlərdir."
      >
        <Button onClick={() => openFor(null)}>
          <Plus />
          Mərhələ əlavə et
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Mərhələlərdə axtar…"
        emptyMessage="Hələ mərhələ yoxdur."
      />

      <EntityDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Mərhələni redaktə et" : "Yeni mərhələ"}
        onSubmit={onSubmit}
        submitting={isSubmitting}
        error={formError}
        structure={
          <div className="grid gap-4">
            <Field
              label="Açar"
              htmlFor="phase-key"
              error={errors.key?.message}
              hint="Daxili identifikator. Kiçik hərflərlə, boşluqsuz."
            >
              <Input
                id="phase-key"
                aria-invalid={Boolean(errors.key)}
                {...register("key")}
              />
            </Field>
          </div>
        }
      >
        {(locale) => (
          <>
            <Field
              label="Başlıq"
              htmlFor={`phase-title-${locale}`}
              error={errors.translations?.[locale]?.title?.message}
            >
              <Input
                id={`phase-title-${locale}`}
                aria-invalid={Boolean(errors.translations?.[locale]?.title)}
                {...register(`translations.${locale}.title`)}
              />
            </Field>
            <Field
              label="Təsvir"
              htmlFor={`phase-blurb-${locale}`}
              error={errors.translations?.[locale]?.blurb?.message}
            >
              <Textarea
                id={`phase-blurb-${locale}`}
                rows={4}
                aria-invalid={Boolean(errors.translations?.[locale]?.blurb)}
                {...register(`translations.${locale}.blurb`)}
              />
            </Field>
            <Field
              label="Təhvil sənədləri"
              htmlFor={`phase-outputs-${locale}`}
              hint="Hər sətirdə bir dənə."
              error={errors.translations?.[locale]?.outputs?.message}
            >
              <Textarea
                id={`phase-outputs-${locale}`}
                rows={3}
                {...register(`translations.${locale}.outputs`)}
              />
            </Field>
          </>
        )}
      </EntityDialog>
    </>
  );
}
