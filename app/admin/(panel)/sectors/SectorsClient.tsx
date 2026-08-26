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
import { deleteSector, saveSector } from "@/lib/admin/actions";
import type { SectorInput } from "@/lib/admin/schemas";
import { sectorSchema } from "@/lib/admin/schemas";
import type { SectorRow } from "@/lib/admin/queries";

const EMPTY = { name: "", detail: "" };

function toForm(row: SectorRow | null, nextOrder: number): SectorInput {
  return {
    key: row?.key ?? "",
    order: row?.order ?? nextOrder,
    translations: Object.fromEntries(
      LOCALES.map((locale) => [locale, row?.translations[locale] ?? EMPTY]),
    ) as SectorInput["translations"],
  };
}

export function SectorsClient({ rows }: { rows: SectorRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<SectorRow | null>(null);
  const [open, setOpen] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const nextOrder = rows.length ? Math.max(...rows.map((r) => r.order)) + 1 : 0;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SectorInput>({
    resolver: zodResolver(sectorSchema),
    defaultValues: toForm(null, 0),
  });

  function openFor(row: SectorRow | null) {
    setFormError(null);
    setEditing(row);
    reset(toForm(row, nextOrder));
    setOpen(true);
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const result = await saveSector(editing?.id ?? null, values);

    if (result.ok) {
      setOpen(false);
      toast.success(editing ? "Sahə yeniləndi." : "Sahə əlavə edildi.");
      router.refresh();
    } else {
      setFormError(result.error);
    }
  });

  const columns = React.useMemo<ColumnDef<SectorRow, unknown>[]>(
    () => [
      {
        id: "name",
        header: "Sahə",
        accessorFn: (row) =>
          [
            row.key,
            ...LOCALES.flatMap((l) => [
              row.translations[l].name,
              row.translations[l].detail,
            ]),
          ].join(" "),
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <span className="font-medium text-white">
              {row.original.translations.az.name || row.original.key}
            </span>
            <span className="font-mono text-[10px] text-white/25">
              {row.original.key}
            </span>
          </div>
        ),
      },
      {
        id: "detail",
        header: "Təfərrüat",
        accessorFn: (row) => row.translations.az.detail,
        cell: ({ row }) => (
          <span className="line-clamp-1 max-w-md text-[13px] text-white/45">
            {row.original.translations.az.detail}
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
            label={row.original.translations.az.name || row.original.key}
            model="sector"
            onEdit={() => openFor(row.original)}
            onDelete={deleteSector}
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
        title="Sahələr"
        description="Saytın sahələr bölməsində sadalanan fəaliyyət istiqamətləri."
      >
        <Button onClick={() => openFor(null)}>
          <Plus />
          Sahə əlavə et
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Sahələrdə axtar…"
        emptyMessage="Hələ sahə yoxdur."
      />

      <EntityDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Sahəni redaktə et" : "Yeni sahə"}
        onSubmit={onSubmit}
        submitting={isSubmitting}
        error={formError}
        structure={
          <Field
            label="Açar"
            htmlFor="sector-key"
            error={errors.key?.message}
            hint="Daxili identifikator. Kiçik hərflərlə, boşluqsuz."
          >
            <Input
              id="sector-key"
              aria-invalid={Boolean(errors.key)}
              {...register("key")}
            />
          </Field>
        }
      >
        {(locale) => (
          <>
            <Field
              label="Ad"
              htmlFor={`name-${locale}`}
              error={errors.translations?.[locale]?.name?.message}
            >
              <Input
                id={`name-${locale}`}
                aria-invalid={Boolean(errors.translations?.[locale]?.name)}
                {...register(`translations.${locale}.name`)}
              />
            </Field>
            <Field
              label="Təfərrüat"
              htmlFor={`detail-${locale}`}
              error={errors.translations?.[locale]?.detail?.message}
            >
              <Input
                id={`detail-${locale}`}
                aria-invalid={Boolean(errors.translations?.[locale]?.detail)}
                {...register(`translations.${locale}.detail`)}
              />
            </Field>
          </>
        )}
      </EntityDialog>
    </>
  );
}
