-- Fix admin dashboard view issues
-- Drop the problematic view and recreate with proper permissions

-- Drop existing view if it exists
drop view if exists public.admin_dashboard;

-- Create a simpler function instead of a view for admin stats
create or replace function public.get_admin_stats()
returns table(
  type text,
  total_count bigint,
  blocked_count bigint,
  recent_count bigint
)
language plpgsql security definer
as $$
begin
  -- Check if current user is admin
  if not public.is_admin(auth.uid()) then
    raise exception 'Access denied: Admin privileges required';
  end if;

  return query
  select 
    'users'::text as type,
    count(*) as total_count,
    count(*) filter (where is_blocked = true) as blocked_count,
    count(*) filter (where created_at > now() - interval '7 days') as recent_count
  from public.users
  union all
  select 
    'books'::text as type,
    count(*) as total_count,
    count(*) filter (where is_hidden = true) as blocked_count,
    count(*) filter (where created_at > now() - interval '7 days') as recent_count
  from public.books
  union all
  select 
    'votes'::text as type,
    count(*) as total_count,
    0::bigint as blocked_count,
    count(*) filter (where created_at > now() - interval '7 days') as recent_count
  from public.votes;
end;
$$; 