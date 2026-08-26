"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { auth } from "@/auth";

/**
 * Service icon uploads.
 *
 * Files land in `public/uploads/services/` and are referenced by path, the same
 * way the SQLite file lives on disk next to the app. Both assume a deployment
 * with a persistent filesystem; a platform with an ephemeral one would lose the
 * uploads on redeploy, and would need object storage instead.
 */

const MAX_BYTES = 512 * 1024;

/**
 * Extension is chosen from the sniffed MIME type rather than the filename the
 * browser sent, so a file called `icon.svg.exe` cannot pick its own extension.
 */
const ALLOWED = {
  "image/svg+xml": "svg",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
} as const;

export type UploadResult =
  | { ok: true; path: string }
  | { ok: false; error: string };

/**
 * Strips the parts of an SVG that can execute.
 *
 * The icon is rendered through `<img>`, which already neutralises script, and
 * `/uploads` is served with a sandbox CSP — but an SVG is the one image format
 * that is also a document, and defence in depth is cheap here. This removes
 * `<script>`, event handlers and `javascript:` URLs rather than trying to prove
 * an arbitrary document safe.
 */
function sanitizeSvg(source: string): string {
  return source
    .replace(/<script[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<foreignObject[\s\S]*?<\/foreignObject\s*>/gi, "")
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(?:href|xlink:href)\s*=\s*(?:"|')?\s*javascript:[^"'>]*(?:"|')?/gi, "");
}

export async function uploadServiceIcon(formData: FormData): Promise<UploadResult> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: "Sessiya bitib. Yenidən daxil olun." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Fayl seçilməyib." };
  }

  if (file.size > MAX_BYTES) {
    return { ok: false, error: "Fayl 512 KB-dan böyük olmamalıdır." };
  }

  const extension = ALLOWED[file.type as keyof typeof ALLOWED];
  if (!extension) {
    return { ok: false, error: "Yalnız SVG, PNG, JPG və WEBP formatları qəbul olunur." };
  }

  try {
    const directory = path.join(process.cwd(), "public", "uploads", "services");
    await mkdir(directory, { recursive: true });

    // A fresh name every time. Reusing the service's own id would let a browser
    // keep serving the previous icon from cache after a replacement.
    const filename = `${randomUUID()}.${extension}`;

    if (extension === "svg") {
      const svg = sanitizeSvg(await file.text());
      await writeFile(path.join(directory, filename), svg, "utf8");
    } else {
      const bytes = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(directory, filename), bytes);
    }

    return { ok: true, path: `/uploads/services/${filename}` };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Fayl yüklənmədi. Yenidən cəhd edin." };
  }
}
