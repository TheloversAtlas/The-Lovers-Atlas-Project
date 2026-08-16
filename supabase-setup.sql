-- THE LOVER'S ATLAS — CITIZEN REGISTRY V2
-- Run this once in Supabase > SQL Editor > New query.

create table if not exists public.citizens (
  id bigint generated always as identity primary key,
  citizen_number text unique,
  name text not null,
  email text not null unique,
  destination text not null default 'Paradise',
  source text not null default 'direct',
  campaign text not null default 'paradise_launch',
  email_consent boolean not null default false,
  founding_citizen boolean not null default false,
  passport_status text not null default 'digital',
  stamps integer not null default 1 check (stamps >= 0),
  created_at timestamptz not null default now()
);

create or replace function public.assign_atlas_citizen_identity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.citizen_number := 'COTA-' || lpad(new.id::text, 6, '0');
  new.founding_citizen := (new.id <= 1000);
  return new;
end;
$$;

drop trigger if exists atlas_assign_citizen_identity on public.citizens;
create trigger atlas_assign_citizen_identity
before insert on public.citizens
for each row
execute function public.assign_atlas_citizen_identity();

alter table public.citizens enable row level security;

-- Intentionally NO anonymous/public insert or select policy.
-- The browser never receives the service-role key.
-- Replit's server performs registry writes securely.

create index if not exists citizens_created_at_idx on public.citizens(created_at desc);
create index if not exists citizens_source_idx on public.citizens(source);
create index if not exists citizens_campaign_idx on public.citizens(campaign);
