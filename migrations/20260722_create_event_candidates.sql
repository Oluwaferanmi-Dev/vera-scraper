-- Review queue only. This migration does not read from or write to public.events.
create table if not exists public.event_candidates (
  id uuid primary key default gen_random_uuid(),
  source_key text not null,
  source_name text not null,
  source_url text not null,
  source_fingerprint text not null,
  title text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  date_text text,
  venue_name text,
  location_text text,
  description text,
  image_url text,
  organiser_name text,
  categories text[] not null default '{}',
  raw_event jsonb not null default '{}'::jsonb,
  extracted_at timestamptz not null default now(),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  review_status text not null default 'pending_review'
    check (review_status in ('pending_review', 'approved', 'rejected', 'archived')),
  review_notes text,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  unique (source_fingerprint)
);

create index if not exists event_candidates_review_queue_idx
  on public.event_candidates (review_status, starts_at nulls last, extracted_at desc);
create index if not exists event_candidates_source_idx
  on public.event_candidates (source_key, last_seen_at desc);

alter table public.event_candidates enable row level security;

-- The scheduled service uses the server-only service_role key. No browser-facing
-- policy is granted here; add narrowly scoped reviewer policies with the review UI.
grant select, insert, update on public.event_candidates to service_role;

