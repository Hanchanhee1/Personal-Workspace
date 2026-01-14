-- 알림 로그 테이블
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL, -- '7_days_before', '3_days_before', '1_day_before', 'today'
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notification logs" ON notification_logs;
CREATE POLICY "Users can view own notification logs"
    ON notification_logs FOR SELECT
    USING (auth.uid() = user_id);

-- 알림 대상 조회용 뷰 (비공개 스키마 사용)
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM anon, authenticated;
GRANT USAGE ON SCHEMA private TO service_role;

DROP VIEW IF EXISTS public.pending_notifications;
CREATE OR REPLACE VIEW private.pending_notifications AS
SELECT 
    ce.id as event_id,
    ce.user_id,
    ce.title,
    ce.event_date,
    au.email,
    CASE 
        WHEN ce.event_date::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul')::date THEN 'today'
        WHEN ce.event_date::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul')::date + INTERVAL '1 day' THEN '1_day_before'
        WHEN ce.event_date::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul')::date + INTERVAL '3 days' THEN '3_days_before'
        WHEN ce.event_date::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul')::date + INTERVAL '7 days' THEN '7_days_before'
    END as notification_type
FROM calendar_events ce
JOIN auth.users au ON ce.user_id = au.id
WHERE 
    (
        ce.event_date::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul')::date OR
        ce.event_date::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul')::date + INTERVAL '1 day' OR
        ce.event_date::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul')::date + INTERVAL '3 days' OR
        ce.event_date::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul')::date + INTERVAL '7 days'
    )
    AND NOT EXISTS (
        SELECT 1 FROM notification_logs nl 
        WHERE nl.event_id = ce.id 
        AND nl.notification_type = (
            CASE 
                WHEN ce.event_date::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul')::date THEN 'today'
                WHEN ce.event_date::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul')::date + INTERVAL '1 day' THEN '1_day_before'
                WHEN ce.event_date::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul')::date + INTERVAL '3 days' THEN '3_days_before'
                WHEN ce.event_date::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul')::date + INTERVAL '7 days' THEN '7_days_before'
            END
        )
    );

GRANT SELECT ON private.pending_notifications TO service_role;
