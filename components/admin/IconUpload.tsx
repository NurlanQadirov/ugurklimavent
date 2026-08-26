"use client";

import * as React from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import { uploadServiceIcon } from "@/lib/admin/upload";

/**
 * Icon picker for a service.
 *
 * The file is uploaded as soon as it is chosen rather than on form submit, so
 * the editor sees the actual icon before saving — an icon is judged by looking
 * at it, and a preview that only appears after saving is no preview at all.
 *
 * The consequence is that abandoning the dialog leaves an unreferenced file on
 * disk. That is the cheaper side of the trade: a few stray icons cost bytes,
 * whereas deferring the upload would mean saving a service and only then
 * finding out the icon was the wrong one.
 */
export function IconUpload({
  value,
  onChange,
  fallbackNote,
}: {
  value: string | null;
  onChange: (path: string | null) => void;
  /** Shown when nothing is uploaded, to explain what the card will render. */
  fallbackNote: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const data = new FormData();
      data.set("file", file);
      const result = await uploadServiceIcon(data);

      if (result.ok) {
        onChange(result.path);
        toast.success("İkon yükləndi.");
      } else {
        toast.error(result.error);
      }
    } finally {
      setUploading(false);
      // Cleared so re-picking the same file after a failure still fires
      // `change` — the browser suppresses it when the value is unchanged.
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="icon-upload">İkon</Label>

      <div className="flex items-center gap-3 rounded-lg border border-white/[0.07] bg-white/[0.02] p-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03]">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="Yüklənmiş ikon"
              className="h-6 w-6 object-contain opacity-80"
            />
          ) : (
            <ImagePlus className="h-4 w-4 text-white/25" aria-hidden />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-white/70">
            {value ? "Yüklənmiş ikon" : fallbackNote}
          </p>
          <p className="mt-0.5 text-xs text-white/35">
            SVG, PNG, JPG və ya WEBP · maksimum 512 KB
          </p>
        </div>

        <div className="flex shrink-0 gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? <Loader2 className="animate-spin" /> : null}
            {uploading ? "Yüklənir…" : value ? "Dəyiş" : "Yüklə"}
          </Button>

          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="İkonu sil"
              className="hover:bg-alarm/10 hover:text-alarm"
              onClick={() => onChange(null)}
            >
              <Trash2 />
            </Button>
          ) : null}
        </div>
      </div>

      {/*
        Kept out of the layout rather than styled: a native file input cannot be
        restyled to match the panel, and the button above drives it.
      */}
      <input
        ref={inputRef}
        id="icon-upload"
        type="file"
        accept="image/svg+xml,image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={handleFile}
      />
    </div>
  );
}
