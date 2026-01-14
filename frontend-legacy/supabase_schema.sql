-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users Table (Extensions of auth.users)
-- This table will be automatically populated via a Trigger when a new user signs up
create table public.users (
  id uuid references auth.users not null primary key,
  email text,
  nickname text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security) for Users
alter table public.users enable row level security;
create policy "Users can view their own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.users for update using (auth.uid() = id);

-- 2. Todos Table
create table public.todos (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  is_completed boolean default false,
  user_id uuid references public.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Todos
alter table public.todos enable row level security;
create policy "Users can view their own todos" on public.todos for select using (auth.uid() = user_id);
create policy "Users can insert their own todos" on public.todos for insert with check (auth.uid() = user_id);
create policy "Users can update their own todos" on public.todos for update using (auth.uid() = user_id);
create policy "Users can delete their own todos" on public.todos for delete using (auth.uid() = user_id);

-- 3. Diaries Table
create table public.diaries (
  id uuid default uuid_generate_v4() primary key,
  date date not null,
  content text not null,
  mood text,
  user_id uuid references public.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Diaries
alter table public.diaries enable row level security;
create policy "Users can view their own diaries" on public.diaries for select using (auth.uid() = user_id);
create policy "Users can insert their own diaries" on public.diaries for insert with check (auth.uid() = user_id);
create policy "Users can update their own diaries" on public.diaries for update using (auth.uid() = user_id);
create policy "Users can delete their own diaries" on public.diaries for delete using (auth.uid() = user_id);

-- 4. Events Table (Calendar)
create table public.events (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone,
  is_all_day boolean default false,
  user_id uuid references public.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Events
alter table public.events enable row level security;
create policy "Users can view their own events" on public.events for select using (auth.uid() = user_id);
create policy "Users can insert their own events" on public.events for insert with check (auth.uid() = user_id);
create policy "Users can update their own events" on public.events for update using (auth.uid() = user_id);
create policy "Users can delete their own events" on public.events for delete using (auth.uid() = user_id);

-- 5. Places Table (Map)
create table public.places (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  latitude double precision not null,
  longitude double precision not null,
  category text,
  user_id uuid references public.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Places
alter table public.places enable row level security;
create policy "Users can view their own places" on public.places for select using (auth.uid() = user_id);
create policy "Users can insert their own places" on public.places for insert with check (auth.uid() = user_id);
create policy "Users can update their own places" on public.places for update using (auth.uid() = user_id);
create policy "Users can delete their own places" on public.places for delete using (auth.uid() = user_id);

-- 6. Trigger to create user profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, email, nickname)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
