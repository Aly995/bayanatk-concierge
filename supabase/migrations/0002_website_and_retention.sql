-- Bayanatk Concierge: hotel website content, booking requests, data retention.

-- ---------- website content: one validated JSON document per hotel ----------
-- The app validates `content` with the zod schema in src/lib/site/schema.ts
-- on every read, so a bad edit can never break a page.
create table public.hotel_sites (
  hotel_id uuid primary key references public.hotels(id) on delete cascade,
  content jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------- booking requests from the website ----------
create table public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  reference text not null unique check (reference ~ '^BK-[A-Z0-9]{6}$'),
  room_id text not null,
  check_in date not null,
  check_out date not null,
  adults smallint not null check (adults between 1 and 12),
  children smallint not null default 0 check (children between 0 and 12),
  is_group boolean not null default false,
  group_size smallint check (group_size is null or group_size between 2 and 500),
  guest_name text not null check (length(guest_name) between 2 and 120),
  phone text not null check (length(phone) between 6 and 30),
  email text check (email is null or length(email) <= 200),
  country text check (country is null or length(country) <= 60),
  language text not null default 'en' check (language in ('en', 'ar')),
  special_requests text check (special_requests is null or length(special_requests) <= 1000),
  status text not null default 'new' check (status in ('new', 'confirmed', 'declined', 'cancelled')),
  created_at timestamptz not null default now(),
  check (check_out > check_in),
  check (check_out <= check_in + 60)
);
create index ix_bookings_hotel_created on public.booking_requests (hotel_id, created_at desc);

-- ---------- RLS ----------
alter table public.hotel_sites enable row level security;
alter table public.booking_requests enable row level security;

create policy sites_read on public.hotel_sites for select to authenticated
  using ((select public.is_hotel_member(hotel_id)));
create policy sites_write on public.hotel_sites for update to authenticated
  using ((select public.is_hotel_member(hotel_id)))
  with check ((select public.is_hotel_member(hotel_id)));

create policy bookings_read on public.booking_requests for select to authenticated
  using ((select public.is_hotel_member(hotel_id)));
create policy bookings_update on public.booking_requests for update to authenticated
  using ((select public.is_hotel_member(hotel_id)))
  with check ((select public.is_hotel_member(hotel_id)));

-- Staff may change a site's content and a booking's status, nothing else.
revoke update on public.hotel_sites from authenticated;
grant update (content, updated_at) on public.hotel_sites to authenticated;
revoke update on public.booking_requests from authenticated;
grant update (status) on public.booking_requests to authenticated;

-- ---------- data retention (privacy notice promises it) ----------
-- Deletes guest chats (with their messages and service requests) not updated
-- for `retention_days`, and booking requests older than `booking_retention_days`.
-- Schedule it daily with Supabase Cron, for example:
--   select cron.schedule('purge-guest-data', '15 3 * * *', $$select public.purge_old_guest_data(90, 365)$$);
create or replace function public.purge_old_guest_data(retention_days int, booking_retention_days int)
returns table (conversations_deleted bigint, bookings_deleted bigint)
language plpgsql
security definer
set search_path = ''
as $$
declare
  c bigint;
  b bigint;
begin
  if retention_days < 7 or booking_retention_days < 30 then
    raise exception 'retention too short';
  end if;
  delete from public.conversations where updated_at < now() - make_interval(days => retention_days);
  get diagnostics c = row_count;
  delete from public.booking_requests where created_at < now() - make_interval(days => booking_retention_days);
  get diagnostics b = row_count;
  delete from public.processed_external_messages where processed_at < now() - interval '7 days';
  return query select c, b;
end;
$$;

-- Only the server (service role) and scheduled jobs may run it, never staff or guests.
revoke execute on function public.purge_old_guest_data(int, int) from public;
revoke execute on function public.purge_old_guest_data(int, int) from anon, authenticated;
