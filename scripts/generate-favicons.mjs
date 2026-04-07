#!/usr/bin/env node
/**
 * Genera favicon e icone PWA da public/pocketdiet-logo.svg (solo icona, senza testo).
 * Richiede: yarn install (sharp)
 * Uso: node scripts/generate-favicons.mjs
 */

import sharp from "sharp";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");
const svgPath = join(publicDir, "pocketdiet-logo.svg");

const SIZES = [
  { name: "favicon-16x16.png", size: 16 },
  { name: "favicon-32x32.png", size: 32 },
  { name: "ms-icon-144x144.png", size: 144 },
  { name: "apple-icon-180x180.png", size: 180 },
  { name: "pwa-192x192.png", size: 192 },
  { name: "pwa-512x512.png", size: 512 },
];

const svg = readFileSync(svgPath);
const SUPERSAMPLE = 4096;

async function generate() {
  const masterBuf = await sharp(svg, { density: 600 })
    .resize(SUPERSAMPLE, SUPERSAMPLE, { fit: "cover", kernel: "lanczos3" })
    .png()
    .toBuffer();

  for (const { name, size } of SIZES) {
    const outPath = join(publicDir, name);
    await sharp(masterBuf)
      .resize(size, size, { fit: "cover", kernel: "lanczos3" })
      .sharpen({ sigma: size <= 32 ? 1.2 : 0.8 })
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(outPath);
    console.log("Generated:", name);
  }
  const icoPath = join(publicDir, "favicon.ico");
  await sharp(masterBuf)
    .resize(32, 32, { fit: "cover", kernel: "lanczos3" })
    .sharpen({ sigma: 1.2 })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(icoPath);
  console.log("Generated: favicon.ico (32x32 PNG)");
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
