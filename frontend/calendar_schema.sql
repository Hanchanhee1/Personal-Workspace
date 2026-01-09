-- Calendar Events Table Schema
-- Execute this in your Supabase SQL Editor

-- Create the table
create table if not exists calendar_events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  title text not null,
  event_date date not null,
  color text default '#818cf8',
  created_at timestamp with time zone default now()
);

-- Set up Row Level Security (RLS)
alter table calendar_events enable row level security;

-- Create policy to allow users to see only their own events
create policy "Users can view their own calendar events"
  on calendar_events for select
  using ( auth.uid() = user_id );

-- Create policy to allow users to insert their own events
create policy "Users can insert their own calendar events"
  on calendar_events for insert
  with check ( auth.uid() = user_id );

-- Create policy to allow users to update their own events
create policy "Users can update their own calendar events"
  on calendar_events for update
  using ( auth.uid() = user_id );

-- Create policy to allow users to delete their own events
create policy "Users can delete their own calendar events"
  on calendar_events for delete
  using ( auth.uid() = user_id );
