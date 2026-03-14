/**
 * Rende trasparenti i pixel bianchi e grigi chiari (scacchiera) in menoo-logo.png
 */
import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const inputPath = join(root, "public", "menoo-logo.png");
const outputPath = inputPath;

const { data, info } = await sharp(inputPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const pixelIsCheckerboard = (r, g, b) => {
  const gray = (r + g + b) / 3;
  const isWhite = r >= 250 && g >= 250 && b >= 250;
  const isLightGray = gray >= 200 && gray <= 255 && Math.abs(r - g) < 15 && Math.abs(g - b) < 15;
  return isWhite || isLightGray;
};

for (let i = 0; i < data.length; i += channels) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  if (pixelIsCheckerboard(r, g, b)) {
    data[i + 3] = 0; // alpha = 0
  }
}

await sharp(data, { raw: { width, height, channels } })
  .png()
  .toFile(outputPath);

console.log("OK: public/menoo-logo.png aggiornato con sfondo trasparente.");
