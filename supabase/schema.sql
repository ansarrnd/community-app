-- Community Connect — optional Supabase mirror schema with RLS
-- Apply via Supabase SQL editor or: supabase db push

-- Roles align with Firebase custom claims: USER | MOD | ADMIN
create type app_role as enum ('USER', 'MOD', 'ADMIN');
create type event_status as enum ('PENDING', 'APPROVED', 'REJECTED');
create type event_category as enum ('MARRIAGE', 'CULTURAL', 'MEETING');
create type rsvp_status as enum ('ATTENDING', 'DECLINED');

create table if not exists public.users (
  uid text primary key,
  phone_number text not null default '',
  display_name text not null default 'Community Member',
  role app_role not null default 'USER',
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id text primary key,
  title text not null,
  category event_category not null,
  date text not null,
  time text not null,
  venue text not null,
  details text not null default '',
  google_maps_url text,
  invite_card_url text,
  organizer_id text not null references public.users(uid),
  organizer_name text not null,
  status event_status not null default 'PENDING',
  groom_name text,
  bride_name text,
  agenda text,
  rsvp_count integer not null default 0,
  attending_count integer not null default 0,
  declined_count integer not null default 0,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rsvps (
  id text primary key,
  event_id text not null references public.events(id) on delete cascade,
  user_id text not null references public.users(uid),
  status rsvp_status not null,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

alter table public.users enable row level security;
alter table public.events enable row level security;
alter table public.rsvps enable row level security;

-- Helper: role from JWT custom claim `role`
create or replace function public.auth_role()
returns app_role
language sql
stable
as $$
  select coalesce(
    (auth.jwt() ->> 'role')::app_role,
    'USER'::app_role
  );
$$;

create or replace function public.is_mod_or_admin()
returns boolean
language sql
stable
as $$
  select public.auth_role() in ('MOD', 'ADMIN');
$$;

-- users
create policy users_read_authenticated on public.users
  for select to authenticated
  using (true);

create policy users_insert_self on public.users
  for insert to authenticated
  with check (auth.uid()::text = uid);

create policy users_update_self_no_role on public.users
  for update to authenticated
  using (auth.uid()::text = uid)
  with check (
    auth.uid()::text = uid
    and role = (select role from public.users where uid = auth.uid()::text)
  );

-- events
create policy events_read_approved_or_staff on public.events
  for select to authenticated
  using (status = 'APPROVED' or public.is_mod_or_admin() or organizer_id = auth.uid()::text);

create policy events_insert_own on public.events
  for insert to authenticated
  with check (organizer_id = auth.uid()::text);

create policy events_update_staff_or_organizer on public.events
  for update to authenticated
  using (
    public.is_mod_or_admin()
    or organizer_id = auth.uid()::text
  );

create policy events_delete_staff_or_organizer on public.events
  for delete to authenticated
  using (
    public.is_mod_or_admin()
    or organizer_id = auth.uid()::text
  );

-- rsvps
create policy rsvps_read_own on public.rsvps
  for select to authenticated
  using (user_id = auth.uid()::text or public.is_mod_or_admin());

create policy rsvps_write_own on public.rsvps
  for all to authenticated
  using (user_id = auth.uid()::text)
  with check (user_id = auth.uid()::text);
