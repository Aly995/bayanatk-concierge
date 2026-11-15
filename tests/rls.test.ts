import { readFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";

/**
 * Runs the real migration in an in-process PostgreSQL (PGlite) and proves that
 * one hotel's staff can never see or change another hotel's data.
 */

const HOTEL_A = "00000000-0000-4000-8000-000000000001"; // demo hotel from seed.sql
const HOTEL_B = "00000000-0000-4000-8000-000000000002";
const STAFF_A = "11111111-1111-4111-8111-111111111111";
const OUTSIDER = "22222222-2222-4222-8222-222222222222";
const REQ_A = "bbbbbbbb-0000-4000-8000-000000000001";
const REQ_B = "bbbbbbbb-0000-4000-8000-000000000002";

const sql = (file: string) => readFileSync(path.join(__dirname, "..", "supabase", file), "utf8");
let db: PGlite;

const count = async (table: string) =>
  Number((await db.query<{ c: number }>(`select count(*)::int as c from public.${table}`)).rows[0]!.c);

const asUser = (uid: string) =>
  db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '${uid}', false);`);

beforeAll(async () => {
  db = new PGlite();
  // Minimal stand-ins for what Supabase provides (auth schema, auth.uid(), roles).
  await db.exec(`
    create role authenticated nologin; create role anon nologin;
    create schema auth; create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable
      as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;
    grant usage on schema public to authenticated;
    alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
  `);
  await db.exec(sql("migrations/0001_init.sql"));
  await db.exec(sql("seed.sql"));
  await db.exec(`
    insert into public.hotels (id, slug, name) values ('${HOTEL_B}', 'other-hotel', 'Other Hotel');
    insert into auth.users values ('${STAFF_A}'), ('${OUTSIDER}');
    insert into public.hotel_members values ('${HOTEL_A}', '${STAFF_A}', 'staff');
    insert into public.conversations (id, hotel_id, channel, external_id) values
      ('aaaaaaaa-0000-4000-8000-000000000001', '${HOTEL_A}', 'web', 's1'),
      ('aaaaaaaa-0000-4000-8000-000000000002', '${HOTEL_B}', 'web', 's2');
    insert into public.service_requests (id, hotel_id, conversation_id, type, details) values
      ('${REQ_A}', '${HOTEL_A}', 'aaaaaaaa-0000-4000-8000-000000000001', 'laundry', 'a'),
      ('${REQ_B}', '${HOTEL_B}', 'aaaaaaaa-0000-4000-8000-000000000002', 'other', 'b');
  `);
}, 60_000);

describe("row level security", () => {
  it("staff see only their own hotel", async () => {
    await asUser(STAFF_A);
    expect(await count("hotels")).toBe(1);
    expect(await count("conversations")).toBe(1);
    expect(await count("service_requests")).toBe(1);
    expect(await count("knowledge_items")).toBe(9);
    await db.exec("reset role");
  });

  it("staff can update their own requests but not another hotel's", async () => {
    await asUser(STAFF_A);
    await db.exec(`update public.service_requests set status = 'done' where id = '${REQ_B}'`);
    await db.exec(`update public.service_requests set status = 'in_progress' where id = '${REQ_A}'`);
    await db.exec("reset role");
    const status = async (id: string) =>
      (await db.query<{ status: string }>(`select status from public.service_requests where id = '${id}'`)).rows[0]!.status;
    expect(await status(REQ_B)).toBe("new");
    expect(await status(REQ_A)).toBe("in_progress");
  });

  it("staff cannot move a request to another hotel", async () => {
    await asUser(STAFF_A);
    await expect(
      db.exec(`update public.service_requests set hotel_id = '${HOTEL_B}' where id = '${REQ_A}'`),
    ).rejects.toThrow(/permission denied/);
    await db.exec("reset role");
  });

  it("staff cannot write into another hotel's conversation", async () => {
    await asUser(STAFF_A);
    await expect(
      db.exec(`insert into public.messages (hotel_id, conversation_id, role, content)
               values ('${HOTEL_B}', 'aaaaaaaa-0000-4000-8000-000000000002', 'staff', 'hi')`),
    ).rejects.toThrow(/row-level security/);
    await db.exec("reset role");
  });

  it("a signed-in user with no hotel sees nothing", async () => {
    await asUser(OUTSIDER);
    expect(await count("conversations")).toBe(0);
    expect(await count("service_requests")).toBe(0);
    expect(await count("hotels")).toBe(0);
    await db.exec("reset role");
  });
});
