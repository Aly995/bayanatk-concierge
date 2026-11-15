/**
 * Writes supabase/seed_site.sql from src/data/demo-site.ts, so the database demo
 * and the in-memory demo are identical. Run: npm run seed:site
 * (tests/website.test.ts fails if the file is out of date.)
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { buildSiteSeedSql } from "./site-seed-sql";

const out = path.join(__dirname, "..", "supabase", "seed_site.sql");
writeFileSync(out, buildSiteSeedSql());
console.log(`Wrote ${out}`);
