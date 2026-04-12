/**
 * Parametri query per immagini su `images.pexels.com`.
 * - `FULL`: cover / hero / sfondi desktop (larga traccia, sRGB).
 * - `CARD`: card editorial / benefit (ancora nitida su Retina, file piu leggeri).
 */
export const PEXELS_CDN_QUERY_FULL =
  "auto=compress&cs=srgb&w=3840" as const;

export const PEXELS_CDN_QUERY_CARD =
  "auto=compress&cs=srgb&w=1920" as const;
