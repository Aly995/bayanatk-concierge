# Fact Rules

The AI answers guests only from these facts (rule 4 in `CLAUDE.md`). A missing fact
means the AI says it will ask the staff. A wrong fact means a wrong answer to a guest.

## Writing a fact

- One topic per fact, one to three sentences, under 400 characters (limit is 2000).
- Exact values: "Check-in from 15:00", not "afternoon". Prices in SAR.
- Conditions in the same fact: "Free when you book directly for 3 nights or more."
- Name gates by number and name: "Gate 25 (King Fahd Gate)".
- No marketing words ("luxurious", "best"). No promises the hotel did not make.
- English. The AI replies in the guest's language from these English facts.
- Every fact the hotel website states must also be a fact here, so the website and
  the AI never disagree.

## Topics

Use these topic names (lowercase, hyphens). Add others when the hotel needs them.

| Topic | Covers |
|-------|--------|
| check-in | Check-in and check-out times, early check-in |
| late-checkout | Late check-out times, price, book-direct perk |
| location | Walk minutes, gate, address |
| breakfast | Breakfast and suhoor times and place |
| airport | Transfers: price, capacity, notice, book-direct perk |
| laundry | Hand-in and return times, price list |
| wifi | Free or paid, network name, where the password is |
| zamzam | Where Zamzam water is |
| ziyarah | Tours: places, time, price, how to book |
| parking | Parking and its cost |
| payment | How and when guests pay |
| cancellation | Cancellation policy, including Ramadan and Hajj |
| children | Children policy |
| accessibility | Step-free rooms, lifts, aids |
| groups | Umrah groups and agents: how to ask for a rate |
| contact | Reservations phone, WhatsApp, email |

## SQL template

Replace `<slug>`. Quotes inside text are doubled (`Prophet''s`).

```sql
insert into public.knowledge_items (hotel_id, topic, content)
select h.id, f.topic, f.content
from public.hotels h
cross join (values
  ('check-in', 'Check-in from 15:00. Check-out by 12:00.'),
  ('location', '5 minutes'' walk to the Prophet''s Mosque through Gate 25 (King Fahd Gate).')
) as f(topic, content)
where h.slug = '<slug>';
```

Example of a complete set: the demo hotel in `supabase/seed.sql`.
