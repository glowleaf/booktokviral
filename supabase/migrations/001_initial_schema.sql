-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_cron";

-- Create users table
create table public.users (
    id uuid primary key references auth.users on delete cascade,
    tiktok_handle text,
    created_at timestamptz default now()
);

-- Enable RLS on users table
alter table public.users enable row level security;

-- Users can only see their own data
create policy "users_select_own" on public.users
    for select using (auth.uid() = id);

create policy "users_insert_own" on public.users
    for insert with check (auth.uid() = id);

create policy "users_update_own" on public.users
    for update using (auth.uid() = id);

-- Create books table
create table public.books (
    id uuid primary key default gen_random_uuid(),
    asin text unique not null,
    title text,
    author text,
    cover_url text,
    tiktok_url text,
    created_by uuid references public.users(id),
    featured_until timestamptz,
    created_at timestamptz default now()
);

-- Enable RLS on books table
alter table public.books enable row level security;

-- Anyone can read books
create policy "books_select_all" on public.books
    for select using (true);

-- Only authenticated users can insert books
create policy "books_insert_authenticated" on public.books
    for insert with check (auth.uid() = created_by);

-- Only book creators can update their books
create policy "books_update_own" on public.books
    for update using (auth.uid() = created_by);

-- Create votes table
create table public.votes (
    book_id uuid references public.books(id) on delete cascade,
    user_id uuid references public.users(id) on delete cascade,
    created_at timestamptz default now(),
    primary key(book_id, user_id)
);

-- Enable RLS on votes table
alter table public.votes enable row level security;

-- Anyone can read votes (for counting)
create policy "votes_select_all" on public.votes
    for select using (true);

-- Only authenticated users can vote
create policy "votes_insert_authenticated" on public.votes
    for insert with check (auth.uid() = user_id);

-- Users can delete their own votes
create policy "votes_delete_own" on public.votes
    for delete using (auth.uid() = user_id);

-- Create function to enqueue Amazon fetch
create or replace function public.enqueue_fetch()
returns trigger language plpgsql as $$
begin
  -- This would call the edge function in a real implementation
  -- For now, we'll just log the book creation
  raise notice 'Book created with ASIN: %', NEW.asin;
  return new;
end; $$;

-- Create trigger to enqueue fetch after book insert
create trigger trg_after_book_insert
    after insert on public.books
    for each row execute procedure public.enqueue_fetch();

-- Schedule weekly vote reset (requires pg_cron extension)
-- This will run every Monday at midnight UTC
select cron.schedule(
    'weekly-vote-reset',
    '0 0 * * 1',
    $$delete from public.votes;$$
); 