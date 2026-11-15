-- Bayanatk Concierge: initial schema.
-- Multi-tenant: every tenant table carries hotel_id. RLS is ON for every table.
-- The app server uses the service-role key (guests are anonymous); staff logins
-- (Supabase Auth, see docs/ROADMAP.md) read through the RLS policies below.

-- gen_random_uuid() is built into PostgreSQL 13+, so no extension is needed.

-- ---------- tenants ----------
create table public.hotels (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,60}$'),
  name text not null,
  name_ar text not null default '',
  city text not null default 'Madinah',
  created_at timestamptz not null default now()
);

create table public.hotel_members (
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'staff' check (role in ('owner', 'manager', 'staff')),
  created_at timestamptz not null default now(),
  primary key (hotel_id, user_id)
);
create index ix_hotel_members_user on public.hotel_members (user_id, hotel_id);

-- ---------- hotel knowledge (what the AI may say) ----------
create table public.knowledge_items (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  topic text not null,
  content text not null check (length(content) <= 2000),
  updated_at timestamptz not null default now()
);
create index ix_knowledge_hotel on public.knowledge_items (hotel_id);

-- ---------- conversations ----------
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  channel text not null check (channel in ('web', 'whatsapp')),
  external_id text not null,
  guest_name text,
  room_number text,
  language text not null default 'other',
  status text not null default 'ai' check (status in ('ai', 'needs_staff', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index ix_conversations_hotel_updated on public.conversations (hotel_id, updated_at desc);
create index ix_conversations_lookup on public.conversations (hotel_id, channel, external_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('guest', 'assistant', 'staff')),
  content text not null check (length(content) <= 4000),
  created_at timestamptz not null default now()
);
create index ix_messages_conversation on public.messages (hotel_id, conversation_id, created_at);

-- ---------- service requests ----------
create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  type text not null check (type in ('housekeeping','laundry','maintenance','transport','late_checkout','extra_items','other')),
  room_number text,
  details text not null,
  status text not null default 'new' check (status in ('new','in_progress','done')),
  created_at timestamptz not null default now()
);
create index ix_requests_hotel_created on public.service_requests (hotel_id, created_at desc);

-- ---------- WhatsApp de-duplication (Meta delivers at least once) ----------
create table public.processed_external_messages (
  id text primary key,
  processed_at timestamptz not null default now()
);

-- ---------- RLS ----------
alter table public.hotels enable row level security;
alter table public.hotel_members enable row level security;
alter table public.knowledge_items enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.service_requests enable row level security;
alter table public.processed_external_messages enable row level security; -- service role only

-- Is the signed-in user a member of this hotel? security definer keeps policies short;
-- empty search_path and auth.uid() inside the function prevent misuse.
create or replace function public.is_hotel_member(target_hotel uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.hotel_members m
    where m.hotel_id = target_hotel and m.user_id = (select auth.uid())
  );
$$;

create policy hotels_read on public.hotels for select to authenticated
  using ((select public.is_hotel_member(id)));

create policy members_read_own on public.hotel_members for select to authenticated
  using (user_id = (select auth.uid()));

create policy knowledge_read on public.knowledge_items for select to authenticated
  using ((select public.is_hotel_member(hotel_id)));
create policy knowledge_write on public.knowledge_items for all to authenticated
  using ((select public.is_hotel_member(hotel_id)))
  with check ((select public.is_hotel_member(hotel_id)));

create policy conversations_read on public.conversations for select to authenticated
  using ((select public.is_hotel_member(hotel_id)));
create policy conversations_update on public.conversations for update to authenticated
  using ((select public.is_hotel_member(hotel_id)))
  with check ((select public.is_hotel_member(hotel_id)));

create policy messages_read on public.messages for select to authenticated
  using ((select public.is_hotel_member(hotel_id)));
create policy messages_insert_staff on public.messages for insert to authenticated
  with check ((select public.is_hotel_member(hotel_id)) and role = 'staff');

create policy requests_read on public.service_requests for select to authenticated
  using ((select public.is_hotel_member(hotel_id)));
create policy requests_update on public.service_requests for update to authenticated
  using ((select public.is_hotel_member(hotel_id)))
  with check ((select public.is_hotel_member(hotel_id)));

-- Staff may only change a request's status, never move it to another hotel.
revoke update on public.service_requests from authenticated;
grant update (status) on public.service_requests to authenticated;
revoke update on public.conversations from authenticated;
grant update (status, room_number, guest_name, updated_at) on public.conversations to authenticated;
