/**
 * Checks a hotel's website content file and writes the SQL to load it.
 *   npm run site:check -- workspaces/hotel-onboarding/stages/03-website-content/output/<slug>-site.json
 * Checks: the content schema, unique room/offer/facility ids, and text contrast of the colours.
 * On success, writes <slug>-site.sql next to the JSON file. Exits with 1 on any problem.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { brandContrastProblems } from "../src/lib/site/contrast";
import { hotelSiteSchema } from "../src/lib/site/schema";
import { buildSiteUpsertSql } from "./site-seed-sql";

const file = process.argv.slice(2).find((a) => a.endsWith(".json"));
if (!file) {
  console.error("Usage: npm run site:check -- <path>/<slug>-site.json");
  process.exit(1);
}
const slug = path.basename(file).replace(/-site\.json$/, "");
const problems: string[] = [];

const parsed = hotelSiteSchema.safeParse(JSON.parse(readFileSync(file, "utf8")));
if (!parsed.success) {
  for (const issue of parsed.error.issues) problems.push(`${issue.path.join(".") || "(root)"}: ${issue.message}`);
} else {
  const site = parsed.data;
  const dupes = (label: string, ids: string[]) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) problems.push(`${label} id used twice: ${id}`);
      seen.add(id);
    }
  };
  dupes("Room", site.rooms.map((r) => r.id));
  dupes("Offer", site.offers.map((o) => o.id));
  dupes("Facility", site.facilities.map((f) => f.id));
  problems.push(...brandContrastProblems(site.brand).map((p) => `Colour contrast: ${p}`));
}

if (problems.length > 0) {
  console.error(`${problems.length} problem(s) in ${file}:`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
const out = path.join(path.dirname(file), `${slug}-site.sql`);
writeFileSync(out, buildSiteUpsertSql(slug, parsed.data));
console.log(`OK: ${file}\nWrote ${out}`);
