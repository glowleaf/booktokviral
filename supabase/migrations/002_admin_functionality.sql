-- Add admin functionality for glowleaf@gmail.com

-- Add admin and status columns to users table
alter table public.users add column if not exists is_admin boolean default false;
alter table public.users add column if not exists is_blocked boolean default false;
alter table public.users add column if not exists blocked_reason text;
alter table public.users add column if not exists blocked_at timestamptz;

-- Add status columns to books table
alter table public.books add column if not exists is_approved boolean default true;
alter table public.books add column if not exists is_hidden boolean default false;
alter table public.books add column if not exists moderation_notes text;
alter table public.books add column if not exists moderated_by uuid references public.users(id);
alter table public.books add column if not exists moderated_at timestamptz;

-- Create admin function to check if user is admin
create or replace function public.is_admin(user_id uuid)
returns boolean language sql security definer as $$
  select exists (
    select 1 from auth.users au
    join public.users u on au.id = u.id
    where au.id = user_id 
    and u.is_admin = true
    and au.email = 'glowleaf@gmail.com'
  );
$$;

-- Create function to get user email (for admin checks)
create or replace function public.get_user_email(user_id uuid)
returns text language sql security definer as $$
  select email from auth.users where id = user_id;
$$;

-- Update RLS policies to allow admin access

-- Admin can see all users
create policy "admin_users_select_all" on public.users
    for select using (public.is_admin(auth.uid()));

-- Admin can update any user (for blocking/unblocking)
create policy "admin_users_update_all" on public.users
    for update using (public.is_admin(auth.uid()));

-- Admin can see all books (including hidden ones)
create policy "admin_books_select_all" on public.books
    for select using (public.is_admin(auth.uid()));

-- Admin can update any book (for moderation)
create policy "admin_books_update_all" on public.books
    for update using (public.is_admin(auth.uid()));

-- Admin can delete any book
create policy "admin_books_delete_all" on public.books
    for delete using (public.is_admin(auth.uid()));

-- Update books select policy to hide unapproved/hidden books for non-admins
drop policy if exists "books_select_all" on public.books;
create policy "books_select_approved" on public.books
    for select using (
      (is_approved = true and is_hidden = false) 
      or public.is_admin(auth.uid())
    );

-- Create admin dashboard view
create or replace view public.admin_dashboard as
select 
  'users' as type,
  count(*) as total_count,
  count(*) filter (where is_blocked = true) as blocked_count,
  count(*) filter (where created_at > now() - interval '7 days') as recent_count
from public.users
union all
select 
  'books' as type,
  count(*) as total_count,
  count(*) filter (where is_hidden = true) as blocked_count,
  count(*) filter (where created_at > now() - interval '7 days') as recent_count
from public.books
union all
select 
  'votes' as type,
  count(*) as total_count,
  0 as blocked_count,
  count(*) filter (where created_at > now() - interval '7 days') as recent_count
from public.votes;

-- RLS for admin dashboard
alter view public.admin_dashboard owner to postgres;
create policy "admin_dashboard_select" on public.admin_dashboard
    for select using (public.is_admin(auth.uid()));

-- Function to set admin status (run this manually for glowleaf@gmail.com)
create or replace function public.set_admin_status(user_email text, admin_status boolean)
returns void language plpgsql security definer as $$
begin
  update public.users 
  set is_admin = admin_status
  where id = (
    select id from auth.users where email = user_email
  );
end;
$$;

-- Function to block/unblock users
create or replace function public.moderate_user(
  target_user_id uuid,
  block_status boolean,
  reason text default null
)
returns void language plpgsql security definer as $$
begin
  -- Check if current user is admin
  if not public.is_admin(auth.uid()) then
    raise exception 'Access denied: Admin privileges required';
  end if;
  
  update public.users 
  set 
    is_blocked = block_status,
    blocked_reason = case when block_status then reason else null end,
    blocked_at = case when block_status then now() else null end
  where id = target_user_id;
end;
$$;

-- Function to moderate books
create or replace function public.moderate_book(
  book_id uuid,
  approved boolean default null,
  hidden boolean default null,
  notes text default null
)
returns void language plpgsql security definer as $$
begin
  -- Check if current user is admin
  if not public.is_admin(auth.uid()) then
    raise exception 'Access denied: Admin privileges required';
  end if;
  
  update public.books 
  set 
    is_approved = coalesce(approved, is_approved),
    is_hidden = coalesce(hidden, is_hidden),
    moderation_notes = coalesce(notes, moderation_notes),
    moderated_by = auth.uid(),
    moderated_at = now()
  where id = book_id;
end;
$$; 