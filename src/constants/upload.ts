/** Tipi MIME ammessi per il caricamento della dieta (immagini, PDF, testo) */
export const ALLOWED_UPLOAD_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "text/plain",
] as const;

/** Dimensione massima file in byte (10 MB) */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/** Valore per l'attributo HTML accept (input file) */
export const ACCEPT_UPLOAD =
  ".pdf,.txt,.jpg,.jpeg,.png,.webp,application/pdf,text/plain,image/jpeg,image/png,image/webp";

export function isAllowedMime(mime: string): boolean {
  if (!mime) return false;
  if (mime.startsWith("image/")) {
    return ["image/jpeg", "image/png", "image/webp"].includes(mime);
  }
  return mime === "application/pdf" || mime === "text/plain";
}
