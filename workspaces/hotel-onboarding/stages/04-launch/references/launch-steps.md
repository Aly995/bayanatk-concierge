# Launch Steps

Run SQL in the Supabase SQL editor of the project in `references/project-facts.md`.

## 1. Hotel row

Replace the slug and names. The id is generated.

```sql
insert into public.hotels (slug, name, name_ar, city)
values ('<slug>', '<Hotel name in English>', '<اسم الفندق>', 'Madinah')
returning id, slug;
```

## 2. Facts

Run `stages/02-facts/output/<slug>-knowledge.sql`. Check the count:

```sql
select count(*) from public.knowledge_items k join public.hotels h on h.id = k.hotel_id where h.slug = '<slug>';
```

## 3. Website

Run `stages/03-website-content/output/<slug>-site.sql`. Open
`https://demo.bayanatk.com/site/<slug>/en` and `/ar`. Both must load.

## 4. Test every path

| Test | Where | Expect |
|------|-------|--------|
| Ask a fact in Arabic | `/h/<slug>` | Answer matches the facts |
| Ask a fact in English | `/h/<slug>` | Answer matches the facts |
| Ask for towels with a room number | `/h/<slug>` | A request appears in the inbox |
| Ask something not in the facts | `/h/<slug>` | The AI says it will ask the staff |
| Send a booking request | `/site/<slug>/en/book` | It appears under Booking requests |
| Staff reply | `/dashboard/<slug>?key=...` | The guest sees the reply |

Afterwards, mark the test booking as cancelled in the inbox.

## 5. Hand-over

- Staff inbox link: `https://demo.bayanatk.com/dashboard/<slug>?key=<STAFF_ACCESS_KEY>`.
  Give it to the hotel's pilot contact directly, never in a group chat.
- Room QR codes point to `https://demo.bayanatk.com/h/<slug>`.
- Show the staff: chats, requests, booking requests, Message on WhatsApp, Pilot report.
- Agree the day-30 review date.
