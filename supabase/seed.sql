-- Sample hotel for a fresh Supabase project. Fictional data.
insert into public.hotels (id, slug, name, name_ar, city) values
  ('00000000-0000-4000-8000-000000000001', 'demo-madinah', 'Dar Al Noor Hotel (Demo)', 'فندق دار النور (تجريبي)', 'Madinah')
on conflict (id) do nothing;

insert into public.knowledge_items (hotel_id, topic, content) values
  ('00000000-0000-4000-8000-000000000001', 'check-in', 'Check-in from 15:00. Check-out by 12:00. Early check-in depends on availability and is free if a room is ready.'),
  ('00000000-0000-4000-8000-000000000001', 'location', '5 minutes'' walk to the Prophet''s Mosque (Al-Masjid an-Nabawi) through Gate 25 (King Fahd Gate).'),
  ('00000000-0000-4000-8000-000000000001', 'late-checkout', 'Late check-out until 16:00 costs SAR 150 and must be confirmed by the front desk. Guests who booked directly with the hotel get free late check-out until 14:00 when available.'),
  ('00000000-0000-4000-8000-000000000001', 'breakfast', 'Breakfast buffet daily 04:30 to 10:30 on the first floor. Suhoor is served in Ramadan from 02:00.'),
  ('00000000-0000-4000-8000-000000000001', 'airport', 'Airport transfer to Prince Mohammad bin Abdulaziz Airport costs SAR 120 per car (up to 4 guests). It is free for guests who booked directly with the hotel for 3 nights or more. Book at least 3 hours ahead.'),
  ('00000000-0000-4000-8000-000000000001', 'laundry', 'Laundry pickup until 11:00, returned the same day by 20:00. Price list is in the room folder.'),
  ('00000000-0000-4000-8000-000000000001', 'wifi', 'Free Wi-Fi. Network: DarAlNoor-Guest. The password is on the key card holder.'),
  ('00000000-0000-4000-8000-000000000001', 'zamzam', 'Zamzam water is available free on every floor next to the lifts.'),
  ('00000000-0000-4000-8000-000000000001', 'ziyarah', 'Daily Ziyarah tour (Quba Mosque, Uhud, Qiblatain) at 07:00, SAR 50 per person, booked at the front desk.');
