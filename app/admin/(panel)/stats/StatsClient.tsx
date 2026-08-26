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
import { Field, Input } from "@/components/ui/input";
import { LOCALES } from "@/i18n/config";
import { SERVICE_COUNT_STAT } from "@/lib/content";
import { deleteStat, saveStat } from "@/lib/admin/actions";
import type { StatInput } from "@/lib/admin/schemas";
import { statSchema } from "@/lib/admin/schemas";
import type { StatRow } from "@/lib/admin/queries";

const EMPTY = { label: "", note: "" };

function toForm(row: StatRow | null, nextOrder: number): StatInput {
  return {
    key: row?.key ?? "",
    value: row?.value ?? 0,
    prefix: row?.prefix ?? "",
    suffix: row?.suffix ?? "",
    order: row?.order ?? nextOrder,
    translations: Object.fromEntries(
      LOCALES.map((locale) => [locale, row?.translations[locale] ?? EMPTY]),
    ) as StatInput["translations"],
  };
}

/**
 * The figure for `SERVICE_COUNT_STAT` follows the number of service cards, so
 * it is shown rather than edited — the same principle as the derived № column
 * in the services table. An input that writes to a column nothing reads is a
 * field that lies to whoever fills it in.
 */
const isDerived = (key: string) => key === SERVICE_COUNT_STAT;

export function StatsClient({
  rows,
  serviceCount,
}: {
  rows: StatRow[];
  serviceCount: number;
}) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<StatRow | null>(null);
  const [open, setOpen] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const nextOrder = rows.length ? Math.max(...rows.map((r) => r.order)) + 1 : 0;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StatInput>({
    resolver: zodResolver(statSchema),
    defaultValues: toForm(null, 0),
  });

  function openFor(row: StatRow | null) {
    setFormError(null);
    setEditing(row);
    reset(toForm(row, nextOrder));
    setOpen(true);
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const result = await saveStat(editing?.id ?? null, values);

    if (result.ok) {
      setOpen(false);
      toast.success(editing ? "Rəqəm yeniləndi." : "Rəqəm əlavə edildi.");
      router.refresh();
    } else {
      setFormError(result.error);
    }
  });

  const columns = React.useMemo<ColumnDef<StatRow, unknown>[]>(
    () => [
      {
        id: "figure",
        header: "Rəqəm",
        size: 120,
        accessorFn: (row) =>
          `${row.prefix}${isDerived(row.key) ? serviceCount : row.value}${row.suffix}`,
        cell: ({ row }) => (
          <span className="font-mono text-sm text-white">
            {row.original.prefix}
            {isDerived(row.original.key) ? serviceCount : row.original.value}
            {row.original.suffix}
          </span>
        ),
      },
      {
        id: "label",
        header: "Etiket",
        accessorFn: (row) =>
          [
            row.key,
            ...LOCALES.flatMap((l) => [
              row.translations[l].label,
              row.translations[l].note,
            ]),
          ].join(" "),
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <span className="font-medium text-white">
              {row.original.translations.az.label || row.original.key}
            </span>
            <span className="line-clamp-1 max-w-md text-xs text-white/35">
              {row.original.translations.az.note}
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
            label={row.original.translations.az.label || row.original.key}
            model="stat"
            onEdit={() => openFor(row.original)}
            onDelete={deleteStat}
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
        title="Rəqəmlər"
        description="Saytdakı rəqəm bölməsi. Bölmə ekranda görünəndə hər rəqəm sıfırdan öz dəyərinə qədər sayılır."
      >
        <Button onClick={() => openFor(null)}>
          <Plus />
          Rəqəm əlavə et
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Rəqəmlərdə axtar…"
        emptyMessage="Hələ rəqəm yoxdur."
      />

      <EntityDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Rəqəmi redaktə et" : "Yeni rəqəm"}
        onSubmit={onSubmit}
        submitting={isSubmitting}
        error={formError}
        structure={
          <>
            <Field
              label="Açar"
              htmlFor="stat-key"
              error={errors.key?.message}
              hint="Daxili identifikator. Kiçik hərflərlə, boşluqsuz."
            >
              <Input
                id="stat-key"
                aria-invalid={Boolean(errors.key)}
                {...register("key")}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Öndəki simvol" htmlFor="stat-prefix" error={errors.prefix?.message}>
                <Input id="stat-prefix" {...register("prefix")} />
              </Field>
              {editing && isDerived(editing.key) ? (
                /*
                  Shown, not edited. The figure follows the number of service
                  cards, so the only way to change it is to add or remove a
                  service — which is exactly what the hint says. The registered
                  field goes along hidden so the stored column keeps whatever
                  value it already had; nothing reads it either way.
                */
                <Field
                  label="Dəyər"
                  htmlFor="stat-value"
                  hint="Xidmətlərin sayına görə avtomatik. Dəyişmək üçün xidmət əlavə edin və ya silin."
                >
                  <Input id="stat-value" value={serviceCount} readOnly tabIndex={-1} />
                  <input type="hidden" {...register("value", { valueAsNumber: true })} />
                </Field>
              ) : (
                <Field
                  label="Dəyər"
                  htmlFor="stat-value"
                  error={errors.value?.message}
                  hint="Bu rəqəmə qədər sayılır."
                >
                  <Input
                    id="stat-value"
                    type="number"
                    inputMode="numeric"
                    aria-invalid={Boolean(errors.value)}
                    // Without `valueAsNumber` the input hands back a string and
                    // the schema's `z.number()` rejects every save.
                    {...register("value", { valueAsNumber: true })}
                  />
                </Field>
              )}
              <Field label="Sondakı simvol" htmlFor="stat-suffix" error={errors.suffix?.message}>
                <Input id="stat-suffix" placeholder="+" {...register("suffix")} />
              </Field>
            </div>
          </>
        }
      >
        {(locale) => (
          <>
            <Field
              label="Etiket"
              htmlFor={`stat-label-${locale}`}
              error={errors.translations?.[locale]?.label?.message}
            >
              <Input
                id={`stat-label-${locale}`}
                aria-invalid={Boolean(errors.translations?.[locale]?.label)}
                {...register(`translations.${locale}.label`)}
              />
            </Field>
            <Field
              label="Qeyd"
              htmlFor={`stat-note-${locale}`}
              error={errors.translations?.[locale]?.note?.message}
            >
              <Input
                id={`stat-note-${locale}`}
                aria-invalid={Boolean(errors.translations?.[locale]?.note)}
                {...register(`translations.${locale}.note`)}
              />
            </Field>
          </>
        )}
      </EntityDialog>
    </>
  );
}
