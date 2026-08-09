/**
 * Project shots: source PNG -> cropped, resized AVIF + WebP.
 *
 * The originals are 1536x1024 presentation renders weighing 8.7 MB together —
 * more than the rest of the site by an order of magnitude. Shipping them as-is
 * would make the projects section the slowest thing here, which is a poor look
 * for a page whose whole argument is care about implementation.
 *
 * Three things happen per image:
 *
 *   1. The banner caption baked into the top of five of the six renders is
 *      cropped away. It duplicates the title the page already shows, and being
 *      pixels it cannot follow the language switch.
 *   2. Everything is normalised to a single 16:10 frame, so the card has one
 *      fixed aspect ratio and no image is letterboxed or unexpectedly cut.
 *   3. Each is emitted at three widths in AVIF and WebP, letting the browser
 *      pick by `srcset` instead of every phone downloading a 1536px render.
 *
 * Run with `npm run images` after replacing anything in assets/projects.
 */
import { mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = join(ROOT, "assets", "projects");
const OUTPUT = join(ROOT, "public", "projects");

/** Emitted widths. 2048 covers a 1024px card on a 2x display. */
const WIDTHS = [768, 1280, 2048];

/** The frame every card uses. Changing it here changes it everywhere. */
const ASPECT = 16 / 10;

/**
 * How much to trim off the top of each source before framing, in pixels of the
 * original 1024px-tall render. Five carry a Russian caption plus a rule; the
 * Telegram bot shot is a flat screenshot and needs none.
 */
const TOP_TRIM = {
  "ai-sales": 104,
  prmpt: 104,
  "japanese-restaurant": 104,
  "stipula-legal": 100,
  "nimbus-crm": 96,
  "productivity-bot": 24,
  "pag-commodities": 104,
};

/**
 * The average colour of each shot, used as the card's placeholder fill while
 * the image decodes. Computed here rather than guessed, and written into the
 * manifest so the app never has to sample a canvas at runtime.
 */
async function averageColor(image) {
  const { data } = await image
    .clone()
    .resize(1, 1, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const hex = [data[0], data[1], data[2]]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");
  return `#${hex}`;
}

/** Crops the caption away, then takes the largest centred 16:10 frame left. */
function frame(width, height, topTrim) {
  const top = topTrim;
  const availableHeight = height - top;

  // Prefer keeping full height and trimming the sides; only trim from the
  // bottom if the remaining crop is still too tall for the target ratio.
  let cropWidth = Math.round(availableHeight * ASPECT);
  let cropHeight = availableHeight;

  if (cropWidth > width) {
    cropWidth = width;
    cropHeight = Math.round(width / ASPECT);
  }

  return {
    left: Math.round((width - cropWidth) / 2),
    top,
    width: cropWidth,
    height: cropHeight,
  };
}

async function totalSize(dir) {
  const entries = await readdir(dir);
  const sizes = await Promise.all(
    entries.map(async (name) => (await stat(join(dir, name))).size),
  );
  return sizes.reduce((sum, size) => sum + size, 0);
}

async function main() {
  await rm(OUTPUT, { recursive: true, force: true });
  await mkdir(OUTPUT, { recursive: true });

  const sources = (await readdir(SOURCE)).filter((name) => name.endsWith(".png"));
  const sourceBytes = await totalSize(SOURCE);
  const manifest = {};

  for (const file of sources.sort()) {
    const slug = file.replace(/\.png$/, "");
    const input = sharp(join(SOURCE, file));
    const { width, height } = await input.metadata();

    const topTrim = TOP_TRIM[slug] ?? 0;
    const box = frame(width, height, topTrim);
    const cropped = input.extract(box);

    const widths = WIDTHS.filter((w) => w <= box.width);
    if (widths.length === 0) widths.push(box.width);

    for (const w of widths) {
      const resized = cropped.clone().resize({ width: w, withoutEnlargement: true });
      await resized.clone().avif({ quality: 62, effort: 6 }).toFile(join(OUTPUT, `${slug}-${w}.avif`));
      await resized.clone().webp({ quality: 78, effort: 6 }).toFile(join(OUTPUT, `${slug}-${w}.webp`));
    }

    manifest[slug] = {
      widths,
      width: box.width,
      height: box.height,
      placeholder: await averageColor(cropped),
    };

    console.log(
      `${slug.padEnd(22)} ${width}x${height} -> ${box.width}x${box.height}  [${widths.join(", ")}]`,
    );
  }

  await writeFile(
    join(ROOT, "src", "content", "shots.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  const outputBytes = await totalSize(OUTPUT);
  const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  console.log(
    `\nsource ${mb(sourceBytes)} -> output ${mb(outputBytes)} across ${WIDTHS.length} widths x 2 formats`,
  );
  console.log(
    `a single card at 1280px costs ~${(
      (await stat(join(OUTPUT, "ai-sales-1280.avif"))).size / 1024
    ).toFixed(0)} KB in AVIF`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
