-- 스케줄 알림 함수
-- 이 함수는 pg_cron 또는 외부 스케줄러에 의해 호출될 수 있습니다

-- 대기 중인 모든 알림을 처리하고 발송하는 함수
CREATE OR REPLACE FUNCTION process_pending_notifications()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_record RECORD;
  result_count INTEGER := 0;
  error_count INTEGER := 0;
  results JSON[] := '{}';
BEGIN
  -- 각 대기 중인 알림 처리
  FOR notification_record IN
    SELECT * FROM pending_notifications
  LOOP
    BEGIN
      -- 이메일 알림 함수 호출
      PERFORM send_email_notification(
        notification_record.email,
        '📅 캘린더 알림: ' || notification_record.title,
        format_email_html(
          notification_record.title,
          notification_record.event_date,
          notification_record.notification_type
        ),
        format_email_text(
          notification_record.title,
          notification_record.event_date,
          notification_record.notification_type
        )
      );

      -- 알림 로그 기록
      INSERT INTO notification_logs (
        event_id,
        user_id,
        notification_type
      ) VALUES (
        notification_record.event_id,
        notification_record.user_id,
        notification_record.notification_type
      );

      result_count := result_count + 1;
      results := results || json_build_object(
        'event_id', notification_record.event_id,
        'email', notification_record.email,
        'status', 'sent'
      );
    EXCEPTION
      WHEN OTHERS THEN
        error_count := error_count + 1;
        results := results || json_build_object(
          'event_id', notification_record.event_id,
          'email', notification_record.email,
          'status', 'failed',
          'error', SQLERRM
        );
    END;
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'processed', result_count,
    'errors', error_count,
    'results', results
  );
END;
$$;

-- HTML 이메일 포맷팅 헬퍼 함수
CREATE OR REPLACE FUNCTION format_email_html(
  p_title TEXT,
  p_event_date DATE,
  p_notification_type TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  days_message TEXT;
  formatted_date TEXT;
BEGIN
  -- 날짜 포맷팅
  formatted_date := to_char(p_event_date, 'YYYY년 MM월 DD일 (Day)');
  
  -- 날짜 메시지 가져오기
  CASE p_notification_type
    WHEN 'today' THEN days_message := '⏰ 오늘입니다!';
    WHEN '1_day_before' THEN days_message := '⏰ 내일입니다!';
    WHEN '3_days_before' THEN days_message := '⏰ 3일 후입니다';
    WHEN '7_days_before' THEN days_message := '⏰ 7일 후입니다';
    ELSE days_message := '알림';
  END CASE;

  RETURN format('
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .event-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .event-title { font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 10px; }
        .event-date { font-size: 18px; color: #666; margin-bottom: 10px; }
        .notification-badge { display: inline-block; background: #667eea; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px; margin-top: 10px; }
        .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📅 캘린더 알림</h1>
        </div>
        <div class="content">
          <div class="event-box">
            <div class="event-title">%s</div>
            <div class="event-date">📆 %s</div>
            <span class="notification-badge">%s</span>
          </div>
          <p>일정이 다가오고 있습니다. 확인해주세요!</p>
          <div class="footer">
            <p>이 메일은 캘린더 알림 시스템에서 자동으로 발송되었습니다.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  ', p_title, formatted_date, days_message);
END;
$$;

-- 텍스트 이메일 포맷팅 헬퍼 함수
CREATE OR REPLACE FUNCTION format_email_text(
  p_title TEXT,
  p_event_date DATE,
  p_notification_type TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  days_message TEXT;
  formatted_date TEXT;
BEGIN
  formatted_date := to_char(p_event_date, 'YYYY년 MM월 DD일');
  
  CASE p_notification_type
    WHEN 'today' THEN days_message := '⏰ 오늘입니다!';
    WHEN '1_day_before' THEN days_message := '⏰ 내일입니다!';
    WHEN '3_days_before' THEN days_message := '⏰ 3일 후입니다';
    WHEN '7_days_before' THEN days_message := '⏰ 7일 후입니다';
    ELSE days_message := '알림';
  END CASE;

  RETURN format('
캘린더 알림

일정: %s
날짜: %s
%s

일정이 다가오고 있습니다. 확인해주세요!
  ', p_title, formatted_date, days_message);
END;
$$;

-- pg_cron을 사용한 스케줄링 (사용 가능한 경우)
-- 참고: Supabase에서 pg_cron 확장을 활성화해야 합니다
-- SELECT cron.schedule(
--   'send-daily-notifications',
--   '0 9 * * *', -- 매일 UTC 오전 9시
--   $$SELECT process_pending_notifications();$$
-- );
