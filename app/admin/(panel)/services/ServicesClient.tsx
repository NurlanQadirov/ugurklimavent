"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/admin/DataTable";
import { EntityDialog } from "@/components/admin/EntityDialog";
import { IconUpload } from "@/components/admin/IconUpload";
import { PageHeader } from "@/components/admin/PageHeader";
import { RowActions } from "@/components/admin/RowActions";
import { Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { LOCALES } from "@/i18n/config";
import { deleteService, saveService } from "@/lib/admin/actions";
import type { ServiceFormValues, ServiceInput } from "@/lib/admin/schemas";
import { serviceFormSchema } from "@/lib/admin/schemas";
import type { ServiceRow } from "@/lib/admin/queries";
import { DESIGNED_SLOTS, slotLabel } from "@/lib/bento";
import { parseListInput, toListInput } from "@/lib/serialize";

const EMPTY_COPY = { title: "", blurb: "", tags: [] as string[] };

/**
 * Tags are edited as one-per-line text but stored as an array, so the form binds
 * `serviceFormSchema` (string tags) and converts on submit.
 */
type FormValues = ServiceFormValues;

function toForm(row: ServiceRow | null, nextOrder: number): FormValues {
  return {
    key: row?.key ?? "",
    iconPath: row?.iconPath ?? null,
    critical: row?.critical ?? false,
    order: row?.order ?? nextOrder,
    translations: Object.fromEntries(
      LOCALES.map((locale) => {
        const copy = row?.translations[locale] ?? EMPTY_COPY;
        return [
          locale,
          { title: copy.title, blurb: copy.blurb, tags: toListInput(copy.tags) },
        ];
      }),
    ) as FormValues["translations"],
  };
}

export function ServicesClient({ rows }: { rows: ServiceRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<ServiceRow | null>(null);
  const [open, setOpen] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const nextOrder = rows.length ? Math.max(...rows.map((r) => r.order)) + 1 : 0;

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: toForm(null, 0),
  });

  function openFor(row: ServiceRow | null) {
    setFormError(null);
    setEditing(row);
    reset(toForm(row, nextOrder));
    setOpen(true);
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    const payload: ServiceInput = {
      ...values,
      translations: Object.fromEntries(
        LOCALES.map((locale) => [
          locale,
          {
            ...values.translations[locale],
            tags: parseListInput(values.translations[locale].tags),
          },
        ]),
      ) as ServiceInput["translations"],
    };

    const result = await saveService(editing?.id ?? null, payload);

    if (result.ok) {
      setOpen(false);
      toast.success(editing ? "Xidmət yeniləndi." : "Xidmət əlavə edildi.");
      router.refresh();
    } else {
      setFormError(result.error);
    }
  });

  const columns = React.useMemo<ColumnDef<ServiceRow, unknown>[]>(
    () => [
      {
        id: "index",
        header: "№",
        size: 56,
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
        id: "icon",
        header: "İkon",
        size: 56,
        cell: ({ row }) =>
          row.original.iconPath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.original.iconPath}
              alt=""
              className="h-5 w-5 object-contain opacity-70"
            />
          ) : (
            <span className="font-mono text-[10px] text-white/20">—</span>
          ),
      },
      {
        id: "title",
        header: "Xidmət",
        // Every locale's title feeds the filter, so searching "Ventilation"
        // finds the same row as searching "Ventilyasiya".
        accessorFn: (row) =>
          [row.key, ...LOCALES.map((l) => row.translations[l].title)].join(" "),
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">
                {row.original.translations.az.title || row.original.key}
              </span>
              {row.original.critical ? (
                <Badge variant="alarm">Lisenziyalı</Badge>
              ) : null}
            </div>
            <span className="font-mono text-[10px] text-white/25">
              {row.original.key}
            </span>
          </div>
        ),
      },
      {
        id: "slot",
        header: "Kartın ölçüsü",
        /*
          Read-only, and derived from the row's position rather than stored.
          Showing it at all is the point: it tells the editor what moving a
          service up or down will do to the grid, without asking them to know
          what a column span is.
        */
        cell: ({ row }) => (
          <span className="text-[13px] text-white/45">{slotLabel(row.index)}</span>
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
            model="service"
            onEdit={() => openFor(row.original)}
            onDelete={deleteService}
          />
        ),
      },
    ],
    // `openFor` closes over `nextOrder`, which changes with the row count.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nextOrder],
  );

  return (
    <>
      <PageHeader
        title="Xidmətlər"
        description={`Sayta çıxan ixtisas kartları. Kartın ölçüsü sıralamadan asılıdır — yuxarı/aşağı düymələri ilə sıranı dəyişsəniz, kart yeni yerinin ölçüsünü alır. İlk ${DESIGNED_SLOTS} yerin ölçüsü dizaynda müəyyən edilib.`}
      >
        <Button onClick={() => openFor(null)}>
          <Plus />
          Xidmət əlavə et
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Xidmətlərdə axtar…"
        emptyMessage="Hələ xidmət yoxdur."
      />

      <EntityDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Xidməti redaktə et" : "Yeni xidmət"}
        description="Aşağıdakı sahələr bütün dillərə aiddir. Mətnlər isə hər dil üçün ayrıca yazılır."
        onSubmit={onSubmit}
        submitting={isSubmitting}
        error={formError}
        structure={
          <>
            <div className="grid gap-4">
              <Field
                label="Açar"
                htmlFor="key"
                error={errors.key?.message}
                hint="Daxili identifikator. Kiçik hərflərlə, boşluqsuz."
              >
                <Input id="key" aria-invalid={Boolean(errors.key)} {...register("key")} />
              </Field>
            </div>

            <Controller
              control={control}
              name="iconPath"
              render={({ field }) => (
                <IconUpload
                  value={field.value}
                  onChange={field.onChange}
                  fallbackNote="İkon yüklənməyib — varsa hazır ikon işlədiləcək"
                />
              )}
            />

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/[0.07] bg-white/[0.02] p-3">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-[#ff3b30]"
                {...register("critical")}
              />
              <span>
                <span className="block text-[13px] font-medium text-white/80">
                  Lisenziyalı istiqamət
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-white/35">
                  Kartda FHN lisenziya nişanı və qırmızı vurğu göstərilir.
                </span>
              </span>
            </label>
          </>
        }
      >
        {(locale) => (
          <>
            <Field
              label="Başlıq"
              htmlFor={`title-${locale}`}
              error={errors.translations?.[locale]?.title?.message}
            >
              <Input
                id={`title-${locale}`}
                aria-invalid={Boolean(errors.translations?.[locale]?.title)}
                {...register(`translations.${locale}.title`)}
              />
            </Field>
            <Field
              label="Təsvir"
              htmlFor={`blurb-${locale}`}
              error={errors.translations?.[locale]?.blurb?.message}
            >
              <Textarea
                id={`blurb-${locale}`}
                rows={4}
                aria-invalid={Boolean(errors.translations?.[locale]?.blurb)}
                {...register(`translations.${locale}.blurb`)}
              />
            </Field>
            <Field
              label="Etiketlər"
              htmlFor={`tags-${locale}`}
              hint="Hər sətirdə bir dənə. Kartın altındakı kiçik nişanlar kimi görünür."
              error={errors.translations?.[locale]?.tags?.message}
            >
              <Textarea
                id={`tags-${locale}`}
                rows={3}
                {...register(`translations.${locale}.tags`)}
              />
            </Field>
          </>
        )}
      </EntityDialog>
    </>
  );
}
