/**
 * Makes web-ready photos: every JPG/PNG/WebP in public/images/originals/ becomes
 * public/images/<name>-640.webp, -1280.webp and -1920.webp (never upscaled).
 *   npm run images:optimize
 * Then use `/images/<name>` as the photo `src` (see public/images/README.md).
 */
import { mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { IMAGE_WIDTHS } from "../src/lib/site/images";

const root = path.join(__dirname, "..", "public", "images");
const originals = path.join(root, "originals");
mkdirSync(originals, { recursive: true });

const files = readdirSync(originals).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
if (files.length === 0) console.log("No photos in public/images/originals/ yet.");

for (const file of files) {
  const name = path.basename(file, path.extname(file)).toLowerCase().replace(/[^a-z0-9-]+/g, "-");
  for (const width of IMAGE_WIDTHS) {
    const out = path.join(root, `${name}-${width}.webp`);
    // `withoutEnlargement` keeps small originals sharp instead of blowing them up.
    await sharp(path.join(originals, file)).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toFile(out);
  }
  console.log(`${file} -> /images/${name} (${IMAGE_WIDTHS.join(", ")} px)`);
}
