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
import { deleteFaq, saveFaq } from "@/lib/admin/actions";
import type { FaqInput } from "@/lib/admin/schemas";
import { faqSchema } from "@/lib/admin/schemas";
import type { FaqRow } from "@/lib/admin/queries";

const EMPTY = { question: "", answer: "" };

function toForm(row: FaqRow | null, nextOrder: number): FaqInput {
  return {
    key: row?.key ?? "",
    order: row?.order ?? nextOrder,
    translations: Object.fromEntries(
      LOCALES.map((locale) => [locale, row?.translations[locale] ?? EMPTY]),
    ) as FaqInput["translations"],
  };
}

export function FaqsClient({ rows }: { rows: FaqRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<FaqRow | null>(null);
  const [open, setOpen] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const nextOrder = rows.length ? Math.max(...rows.map((r) => r.order)) + 1 : 0;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FaqInput>({
    resolver: zodResolver(faqSchema),
    defaultValues: toForm(null, 0),
  });

  function openFor(row: FaqRow | null) {
    setFormError(null);
    setEditing(row);
    reset(toForm(row, nextOrder));
    setOpen(true);
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const result = await saveFaq(editing?.id ?? null, values);

    if (result.ok) {
      setOpen(false);
      toast.success(editing ? "Sual yeniləndi." : "Sual əlavə edildi.");
      router.refresh();
    } else {
      setFormError(result.error);
    }
  });

  const columns = React.useMemo<ColumnDef<FaqRow, unknown>[]>(
    () => [
      {
        id: "position",
        header: "№",
        size: 60,
        /*
          Derived from position, matching the site: the numbering renders the
          order, so it can never show a gap after a delete.
        */
        cell: ({ row }) => (
          <span className="font-mono text-[11px] text-white/35">
            {String(row.index + 1).padStart(2, "0")}
          </span>
        ),
      },
      {
        id: "question",
        header: "Sual",
        accessorFn: (row) =>
          [
            row.key,
            ...LOCALES.flatMap((l) => [
              row.translations[l].question,
              row.translations[l].answer,
            ]),
          ].join(" "),
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <span className="font-medium text-white">
              {row.original.translations.az.question || row.original.key}
            </span>
            <span className="line-clamp-1 max-w-xl text-xs text-white/35">
              {row.original.translations.az.answer}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Əməliyyatlar</span>,
        size: 160,
        cell: ({ row }) => (
          <RowActions
            id={row.original.id}
            label={row.original.translations.az.question || row.original.key}
            model="faq"
            onEdit={() => openFor(row.original)}
            onDelete={deleteFaq}
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
        title="Suallar"
        description="Sıra burada vacibdir. Suallar real ilk zəngin gedişatı ilə düzülür və birinci sual struktur məlumatın başında gedir — yəni axtarış sistemi və ya süni intellekt ən çox onu sitat gətirir."
      >
        <Button onClick={() => openFor(null)}>
          <Plus />
          Sual əlavə et
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Suallarda axtar…"
        emptyMessage="Hələ sual yoxdur."
      />

      <EntityDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Sualı redaktə et" : "Yeni sual"}
        onSubmit={onSubmit}
        submitting={isSubmitting}
        error={formError}
        structure={
          <Field
            label="Açar"
            htmlFor="faq-key"
            error={errors.key?.message}
            hint="Daxili identifikator. Kiçik hərflərlə, boşluqsuz."
          >
            <Input
              id="faq-key"
              aria-invalid={Boolean(errors.key)}
              {...register("key")}
            />
          </Field>
        }
      >
        {(locale) => (
          <>
            <Field
              label="Sual"
              htmlFor={`question-${locale}`}
              error={errors.translations?.[locale]?.question?.message}
            >
              <Input
                id={`question-${locale}`}
                aria-invalid={Boolean(errors.translations?.[locale]?.question)}
                {...register(`translations.${locale}.question`)}
              />
            </Field>
            <Field
              label="Cavab"
              htmlFor={`answer-${locale}`}
              error={errors.translations?.[locale]?.answer?.message}
            >
              <Textarea
                id={`answer-${locale}`}
                rows={6}
                aria-invalid={Boolean(errors.translations?.[locale]?.answer)}
                {...register(`translations.${locale}.answer`)}
              />
            </Field>
          </>
        )}
      </EntityDialog>
    </>
  );
}
