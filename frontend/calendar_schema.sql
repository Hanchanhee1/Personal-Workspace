-- 캘린더 이벤트 테이블 스키마
-- Supabase SQL Editor에서 실행하세요

-- 테이블 생성
create table if not exists calendar_events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  title text not null,
  -- 시간까지 저장하려면 date가 아닌 timestamptz가 필요합니다
  event_date timestamptz not null,
  color text default '#818cf8',
  created_at timestamp with time zone default now()
);

-- Row Level Security (RLS) 설정
alter table calendar_events enable row level security;

-- 사용자가 자신의 이벤트만 볼 수 있도록 정책 생성
DROP POLICY IF EXISTS "Users can view their own calendar events" ON calendar_events;
create policy "Users can view their own calendar events"
  on calendar_events for select
  using ( auth.uid() = user_id );

-- 사용자가 자신의 이벤트를 삽입할 수 있도록 정책 생성
DROP POLICY IF EXISTS "Users can insert their own calendar events" ON calendar_events;
create policy "Users can insert their own calendar events"
  on calendar_events for insert
  with check ( auth.uid() = user_id );

-- 사용자가 자신의 이벤트를 업데이트할 수 있도록 정책 생성
DROP POLICY IF EXISTS "Users can update their own calendar events" ON calendar_events;
create policy "Users can update their own calendar events"
  on calendar_events for update
  using ( auth.uid() = user_id );

-- 사용자가 자신의 이벤트를 삭제할 수 있도록 정책 생성
DROP POLICY IF EXISTS "Users can delete their own calendar events" ON calendar_events;
create policy "Users can delete their own calendar events"
  on calendar_events for delete
  using ( auth.uid() = user_id );
