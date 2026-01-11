-- Notification Logs Table
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL, -- '7_days_before', '3_days_before', '1_day_before', 'today'
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification logs"
    ON notification_logs FOR SELECT
    USING (auth.uid() = user_id);

-- 알림 대상 조회용 뷰
CREATE OR REPLACE VIEW pending_notifications AS
SELECT 
    ce.id as event_id,
    ce.user_id,
    ce.title,
    ce.event_date,
    au.email,
    CASE 
        WHEN ce.event_date = CURRENT_DATE THEN 'today'
        WHEN ce.event_date = CURRENT_DATE + INTERVAL '1 day' THEN '1_day_before'
        WHEN ce.event_date = CURRENT_DATE + INTERVAL '3 days' THEN '3_days_before'
        WHEN ce.event_date = CURRENT_DATE + INTERVAL '7 days' THEN '7_days_before'
    END as notification_type
FROM calendar_events ce
JOIN auth.users au ON ce.user_id = au.id
WHERE 
    (
        ce.event_date = CURRENT_DATE OR
        ce.event_date = CURRENT_DATE + INTERVAL '1 day' OR
        ce.event_date = CURRENT_DATE + INTERVAL '3 days' OR
        ce.event_date = CURRENT_DATE + INTERVAL '7 days'
    )
    AND NOT EXISTS (
        SELECT 1 FROM notification_logs nl 
        WHERE nl.event_id = ce.id 
        AND nl.notification_type = (
            CASE 
                WHEN ce.event_date = CURRENT_DATE THEN 'today'
                WHEN ce.event_date = CURRENT_DATE + INTERVAL '1 day' THEN '1_day_before'
                WHEN ce.event_date = CURRENT_DATE + INTERVAL '3 days' THEN '3_days_before'
                WHEN ce.event_date = CURRENT_DATE + INTERVAL '7 days' THEN '7_days_before'
            END
        )
    );
