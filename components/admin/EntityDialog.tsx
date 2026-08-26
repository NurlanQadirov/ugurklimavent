"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/i18n/config";

/**
 * The create/edit sheet.
 *
 * Structure fields sit above the tabs and copy sits inside them, which mirrors
 * how the data is actually stored: one row of structure, three rows of
 * translation. It also makes the thing being edited obvious — an editor who
 * opens the Russian tab is editing Russian words, not a Russian service.
 */
export function EntityDialog({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  submitting,
  error,
  structure,
  children,
  submitLabel = "Yadda saxla",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  submitting: boolean;
  error?: string | null;
  /** Fields that are the same in every language. */
  structure?: React.ReactNode;
  /** Rendered once per locale, inside that locale's tab. */
  children: (locale: Locale) => React.ReactNode;
  submitLabel?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={onSubmit} className="flex min-h-0 flex-col">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>

          <DialogBody className="flex flex-col gap-6">
            {structure ? (
              <div className="flex flex-col gap-4">{structure}</div>
            ) : null}

            <div>
              <Tabs defaultValue={LOCALES[0]}>
                <TabsList>
                  {LOCALES.map((locale) => (
                    <TabsTrigger key={locale} value={locale}>
                      {LOCALE_LABELS[locale]}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {LOCALES.map((locale) => (
                  /*
                    `forceMount` keeps all three panels in the DOM. React Hook
                    Form unregisters the inputs of an unmounted panel, so
                    without it a save made from the English tab would submit
                    empty Azerbaijani and Russian copy. Hidden panels are
                    hidden with CSS instead.
                  */
                  <TabsContent
                    key={locale}
                    value={locale}
                    forceMount
                    className="flex flex-col gap-4 data-[state=inactive]:hidden"
                  >
                    {children(locale)}
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {error ? (
              <p
                role="alert"
                className="rounded-lg border border-alarm/25 bg-alarm/[0.06] px-3 py-2 text-[13px] text-alarm/90"
              >
                {error}
              </p>
            ) : null}
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Ləğv et
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin" /> : null}
              {submitting ? "Yadda saxlanılır…" : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
