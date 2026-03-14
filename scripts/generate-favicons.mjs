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

const SIZES = [
  { name: "favicon-16x16.png", size: 16 },
  { name: "favicon-32x32.png", size: 32 },
  { name: "ms-icon-144x144.png", size: 144 },
  { name: "apple-icon-180x180.png", size: 180 },
  { name: "pwa-192x192.png", size: 192 },
  { name: "pwa-512x512.png", size: 512 },
];

const svg = readFileSync(svgPath);

const WHITE_BG = "#ffffff";

async function generate() {
  for (const { name, size } of SIZES) {
    const outPath = join(publicDir, name);
    await sharp(svg)
      .resize(size, size)
      .flatten({ background: WHITE_BG })
      .png()
      .toFile(outPath);
    console.log("Generated:", name);
  }
  // favicon.ico: molti browser accettano anche PNG rinominato; generiamo da 32x32
  const icoPath = join(publicDir, "favicon.ico");
  await sharp(svg)
    .resize(32, 32)
    .flatten({ background: WHITE_BG })
    .png()
    .toFile(icoPath);
  console.log("Generated: favicon.ico (32x32 PNG)");
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
