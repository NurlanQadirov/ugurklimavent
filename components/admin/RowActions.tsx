"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
import type { ActionResult, Orderable } from "@/lib/admin/actions";
import { reorder } from "@/lib/admin/actions";

/**
 * Edit / move / delete for one row.
 *
 * Delete goes through a confirmation dialog rather than a `window.confirm`:
 * removing a service takes its copy in all three languages with it, and that is
 * worth naming the item in the prompt for.
 */
export function RowActions({
  id,
  label,
  model,
  onEdit,
  onDelete,
}: {
  id: string;
  label: string;
  model: Orderable;
  onEdit: () => void;
  onDelete: (id: string) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  function move(direction: "up" | "down") {
    startTransition(async () => {
      const result = await reorder(model, id, direction);
      if (result.ok) {
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function confirmDelete() {
    startTransition(async () => {
      const result = await onDelete(id);
      if (result.ok) {
        setConfirming(false);
        toast.success(`“${label}” silindi.`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        aria-label={`${label} — yuxarı`}
        disabled={pending}
        onClick={() => move("up")}
      >
        <ChevronUp />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`${label} — aşağı`}
        disabled={pending}
        onClick={() => move("down")}
      >
        <ChevronDown />
      </Button>
      <Button variant="ghost" size="icon" aria-label={`${label} — redaktə et`} onClick={onEdit}>
        <Pencil />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`${label} — sil`}
        className="hover:bg-alarm/10 hover:text-alarm"
        onClick={() => setConfirming(true)}
      >
        <Trash2 />
      </Button>

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>“{label}” silinsin?</DialogTitle>
            <DialogDescription>
              Element və onun hər üç dildəki mətni silinəcək. Bu əməliyyat geri
              qaytarıla bilməz.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="py-0" />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirming(false)}
              disabled={pending}
            >
              Ləğv et
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : null}
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
