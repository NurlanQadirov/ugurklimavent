"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { BrandLogo } from "@/components/site/BrandLogo";

const schema = z.object({
  email: z.email("Düzgün e-poçt ünvanı daxil edin"),
  password: z.string().min(1, "Şifrəni daxil edin"),
});

type Values = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: Values) {
    setFormError(null);

    const result = await signIn("credentials", {
      ...values,
      redirect: false,
    });

    if (!result || result.error) {
      /**
       * One message for both "no such user" and "wrong password". Telling the
       * two apart would turn this form into an account-enumeration oracle, and
       * it is no more useful to the one person who is meant to be here.
       */
      setFormError("E-poçt və ya şifrə yanlışdır.");
      return;
    }

    router.replace("/admin");
    // The guarded layout reads the session on the server, so the new cookie
    // only takes effect once the router cache is dropped.
    router.refresh();
  }

  return (
    <Card className="relative z-10 w-full max-w-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 p-7">
        <div className="flex flex-col items-start gap-4">
          <BrandLogo />
          <div>
            <h1 className="text-lg font-medium tracking-tight text-white">
              Məzmun idarəetməsi
            </h1>
            <p className="mt-1 text-[13px] text-white/40">
              Sayt məzmununu idarə etmək üçün daxil olun.
            </p>
          </div>
        </div>

        <Field label="E-poçt" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="username"
            autoFocus
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </Field>

        <Field label="Şifrə" htmlFor="password" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
        </Field>

        {formError ? (
          <p
            role="alert"
            className="rounded-lg border border-alarm/25 bg-alarm/[0.06] px-3 py-2 text-[13px] text-alarm/90"
          >
            {formError}
          </p>
        ) : null}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? <Loader2 className="animate-spin" /> : null}
          {isSubmitting ? "Daxil olunur…" : "Daxil ol"}
        </Button>
      </form>
    </Card>
  );
}
