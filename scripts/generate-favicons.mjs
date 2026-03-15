#!/usr/bin/env node
/**
 * Genera favicon e icone PWA da public/menoo-logo.svg (stesso logo+testo mostrato in homepage).
 * Richiede: npm install (sharp)
 * Uso: node scripts/generate-favicons.mjs
 */

import sharp from "sharp";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");
const svgPath = join(publicDir, "menoo-logo.svg");
const faviconIconPath = join(publicDir, "favicon-icon.svg");

const SIZES = [
  { name: "favicon-16x16.png", size: 16, faviconOnly: true },
  { name: "favicon-32x32.png", size: 32, faviconOnly: true },
  { name: "ms-icon-144x144.png", size: 144, faviconOnly: false },
  { name: "apple-icon-180x180.png", size: 180, faviconOnly: false },
  { name: "pwa-192x192.png", size: 192, faviconOnly: false },
  { name: "pwa-512x512.png", size: 512, faviconOnly: false },
];

const svg = readFileSync(svgPath);
/** Favicon: solo logo (senza scritta), verde su bianco */
const faviconSvg = readFileSync(faviconIconPath);

const WHITE_BG = "#ffffff";
/** Padding interno (0.1 = 10% per lato) così l'icona non viene tagliata dai bordi arrotondati */
const ICON_PADDING = 0.1;
/** Su iOS (Add to Home) Apple applica un ritaglio più aggressivo: più padding per apple-icon */
const ICON_PADDING_APPLE = 0.14;
/** Scala il logo leggermente dentro l'area interna per non tagliare il contorno (stroke) */
const LOGO_SAFE_SCALE = 0.92;

async function generate() {
  for (const { name, size, faviconOnly } of SIZES) {
    const outPath = join(publicDir, name);
    const sourceSvg = faviconOnly ? faviconSvg : svg;
    const padding = name === "apple-icon-180x180.png" ? ICON_PADDING_APPLE : ICON_PADDING;
    const innerSize = Math.round(size * (1 - 2 * padding));
    const offset = Math.round(size * padding);
    const logoSize = Math.round(innerSize * LOGO_SAFE_SCALE);
    const logoOffset = Math.round((innerSize - logoSize) / 2);
    const logoBuf = await sharp(sourceSvg)
      .resize(logoSize, logoSize, { fit: "contain", background: WHITE_BG })
      .flatten({ background: WHITE_BG })
      .png()
      .toBuffer();
    await sharp({
      create: { width: size, height: size, background: WHITE_BG, channels: 3 },
    })
      .composite([{ input: logoBuf, left: offset + logoOffset, top: offset + logoOffset }])
      .png()
      .toFile(outPath);
    console.log("Generated:", name);
  }
  // favicon.ico: come favicon 32x32 (solo logo, verde su bianco)
  const icoPath = join(publicDir, "favicon.ico");
  const size = 32;
  const innerSize = Math.round(size * (1 - 2 * ICON_PADDING));
  const offset = Math.round(size * ICON_PADDING);
  const logoSize = Math.round(innerSize * LOGO_SAFE_SCALE);
  const logoOffset = Math.round((innerSize - logoSize) / 2);
  const logoBufIco = await sharp(faviconSvg)
    .resize(logoSize, logoSize, { fit: "contain", background: WHITE_BG })
    .flatten({ background: WHITE_BG })
    .png()
    .toBuffer();
  await sharp({
    create: { width: size, height: size, background: WHITE_BG, channels: 3 },
  })
    .composite([{ input: logoBufIco, left: offset + logoOffset, top: offset + logoOffset }])
    .png()
    .toFile(icoPath);
  console.log("Generated: favicon.ico (32x32 PNG)");
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
