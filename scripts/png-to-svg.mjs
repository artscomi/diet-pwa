/**
 * Vettorializza menoo-logo.png in SVG con potrace
 */
import potrace from "potrace";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const inputPath = join(__dirname, "..", "public", "menoo-logo.png");
const outputPath = join(__dirname, "..", "public", "menoo-logo.svg");

const params = {
  threshold: 200,
  color: "#10b981",
  background: "transparent",
};

potrace.trace(inputPath, params, (err, svg) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  // potrace può non supportare background transparent; sostituiamo nel markup
  const svgClean = svg.replace(/fill="#[^"]+"/g, 'fill="#10b981"').replace(/stroke="[^"]*"/g, 'stroke="#10b981"');
  let out = svgClean;
  if (!svg.includes('fill="none"') && !svg.includes("transparent")) {
    out = svgClean.replace(/<rect[^>]*width="100%"[^>]*\/?>/, (m) => m.replace(/fill="[^"]*"/, 'fill="none"'));
  }
  writeFileSync(outputPath, out, "utf8");
  console.log("OK: public/menoo-logo.svg creato.");
});
