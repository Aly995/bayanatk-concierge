import type { Hotel } from "@/lib/types";

/**
 * A fictional sample hotel used in demo mode and in tests.
 * Replace with a real hotel's facts during a pilot (or load from Supabase).
 */
export const DEMO_HOTEL: Hotel = {
  id: "00000000-0000-4000-8000-000000000001",
  slug: "demo-madinah",
  name: "Dar Al Noor Hotel (Demo)",
  nameAr: "فندق دار النور (تجريبي)",
  city: "Madinah",
  knowledge: [
    { id: "k1", topic: "check-in", content: "Check-in from 15:00. Check-out by 12:00. Early check-in depends on availability and is free if a room is ready." },
    { id: "k2", topic: "location", content: "5 minutes' walk to the Prophet's Mosque (Al-Masjid an-Nabawi) through Gate 25 (King Fahd Gate)." },
    { id: "k3", topic: "late-checkout", content: "Late check-out until 16:00 costs SAR 150 and must be confirmed by the front desk." },
    { id: "k4", topic: "breakfast", content: "Breakfast buffet daily 04:30 to 10:30 on the first floor. Suhoor is served in Ramadan from 02:00." },
    { id: "k5", topic: "airport", content: "Airport transfer to Prince Mohammad bin Abdulaziz Airport costs SAR 120 per car (up to 4 guests). Book at least 3 hours ahead." },
    { id: "k6", topic: "laundry", content: "Laundry pickup until 11:00, returned the same day by 20:00. Price list is in the room folder." },
    { id: "k7", topic: "wifi", content: "Free Wi-Fi. Network: DarAlNoor-Guest. The password is on the key card holder." },
    { id: "k8", topic: "zamzam", content: "Zamzam water is available free on every floor next to the lifts." },
    { id: "k9", topic: "ziyarah", content: "Daily Ziyarah tour (Quba Mosque, Uhud, Qiblatain) at 07:00, SAR 50 per person, booked at the front desk." },
  ],
};
