"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { saveCompany } from "@/lib/admin/actions";
import type { CompanyFormValues, CompanyInput } from "@/lib/admin/schemas";
import { companyFormSchema } from "@/lib/admin/schemas";
import type { CompanyRow } from "@/lib/admin/queries";
import { parseListInput, toListInput } from "@/lib/serialize";

/**
 * A single-record form, so it is a page rather than a dialog — there is no list
 * to return to and nothing to create.
 *
 * The address is split into parts because the JSON-LD `PostalAddress` needs
 * `streetAddress` and `addressLocality` in separate fields. The displayed
 * address line in the footer is translated copy and lives in the dictionaries,
 * which is why it is not edited here.
 */
export function SettingsForm({ company }: { company: CompanyRow }) {
  const router = useRouter();
  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: { ...company, phones: toListInput(company.phones) },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    const payload: CompanyInput = {
      ...values,
      phones: parseListInput(values.phones),
    };

    const result = await saveCompany(payload);

    if (result.ok) {
      toast.success("Tənzimləmələr yadda saxlanıldı.");
      router.refresh();
    } else {
      setFormError(result.error);
    }
  });

  return (
    <form onSubmit={onSubmit}>
      <PageHeader
        title="Tənzimləmələr"
        description="Bu məlumatlar saytın altlığında, mobil menyuda, paylaşım kartlarında və struktur məlumatda istifadə olunur. Vahid qeyddir və bütün dillər üçün eynidir."
      >
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? <Loader2 className="animate-spin" /> : null}
          {isSubmitting ? "Yadda saxlanılır…" : "Yadda saxla"}
        </Button>
      </PageHeader>

      <div className="flex max-w-3xl flex-col gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Şirkət</CardTitle>
            <CardDescription>
              Rəsmi ad saytın altlığında və struktur məlumatda naşir kimi
              göstərilir.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Rəsmi ad" htmlFor="name" error={errors.name?.message}>
              <Input id="name" aria-invalid={Boolean(errors.name)} {...register("name")} />
            </Field>
            <Field
              label="Qısa ad"
              htmlFor="short"
              error={errors.short?.message}
              hint="Tam rəsmi adın uzun gəldiyi yerlərdə işlədilir."
            >
              <Input
                id="short"
                aria-invalid={Boolean(errors.short)}
                {...register("short")}
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Əlaqə</CardTitle>
            <CardDescription>
              Altlıqdakı və mobil menyudakı zəng düymələri siyahıdakı birinci
              nömrəni yığır — əsas nömrəni birinci saxlayın.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Field
              label="Telefon nömrələri"
              htmlFor="phones"
              hint="Hər sətirdə bir dənə."
              error={errors.phones?.message}
            >
              <Textarea
                id="phones"
                rows={3}
                aria-invalid={Boolean(errors.phones)}
                {...register("phones")}
              />
            </Field>
            <Field label="E-poçt" htmlFor="email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ünvan</CardTitle>
            <CardDescription>
              Hissələrə bölünüb ki, struktur məlumatda küçə və şəhər ayrıca
              göstərilsin — birləşik bir sətir şirkətin xəritədə düzgün
              tanınmamasına səbəb olur.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Küçə"
              htmlFor="addressStreet"
              error={errors.addressStreet?.message}
            >
              <Input
                id="addressStreet"
                aria-invalid={Boolean(errors.addressStreet)}
                {...register("addressStreet")}
              />
            </Field>
            <Field
              label="Rayon"
              htmlFor="addressDistrict"
              error={errors.addressDistrict?.message}
            >
              <Input
                id="addressDistrict"
                aria-invalid={Boolean(errors.addressDistrict)}
                {...register("addressDistrict")}
              />
            </Field>
            <Field
              label="Şəhər"
              htmlFor="addressLocality"
              error={errors.addressLocality?.message}
            >
              <Input
                id="addressLocality"
                aria-invalid={Boolean(errors.addressLocality)}
                {...register("addressLocality")}
              />
            </Field>
            <Field
              label="Region"
              htmlFor="addressRegion"
              error={errors.addressRegion?.message}
            >
              <Input
                id="addressRegion"
                aria-invalid={Boolean(errors.addressRegion)}
                {...register("addressRegion")}
              />
            </Field>
            <Field
              label="Ölkə kodu"
              htmlFor="addressCountry"
              error={errors.addressCountry?.message}
              hint="İki hərf, məsələn AZ."
            >
              <Input
                id="addressCountry"
                maxLength={2}
                aria-invalid={Boolean(errors.addressCountry)}
                {...register("addressCountry")}
              />
            </Field>
          </CardContent>
        </Card>

        {formError ? (
          <p
            role="alert"
            className="rounded-lg border border-alarm/25 bg-alarm/[0.06] px-3 py-2 text-[13px] text-alarm/90"
          >
            {formError}
          </p>
        ) : null}
      </div>
    </form>
  );
}
