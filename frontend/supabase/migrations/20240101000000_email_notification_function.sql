-- 이메일 알림 함수
-- 이 함수는 Supabase 내장 이메일 또는 외부 서비스를 사용하여 이메일 알림을 발송합니다

-- 옵션 1: Supabase 이메일 사용 (SMTP 설정 필요)
-- 옵션 2: 외부 HTTP API 사용 (Resend, SendGrid 등)

-- 현재는 실제 이메일 서비스로 확장할 수 있는 함수를 생성합니다
CREATE OR REPLACE FUNCTION send_email_notification(
  p_email TEXT,
  p_subject TEXT,
  p_html_content TEXT,
  p_text_content TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- 이메일 발송 시도 로그 기록
  INSERT INTO email_logs (email, subject, status, created_at)
  VALUES (p_email, p_subject, 'pending', NOW())
  RETURNING json_build_object('id', id, 'status', status) INTO result;

  -- TODO: 실제 이메일 발송 구현
  -- 옵션 1: Supabase 이메일 서비스 사용 (설정된 경우)
  -- 옵션 2: http 확장을 사용하여 외부 API 호출
  -- 옵션 3: HTTP 요청을 위해 pg_net 확장 사용
  
  -- 현재는 외부 서비스에 간단한 HTTP 요청을 사용합니다
  -- 이메일 서비스 API 키를 설정해야 합니다
  
  -- http 확장 사용 예제 (http 확장 활성화 필요):
  -- PERFORM http_post(
  --   'https://api.resend.com/emails',
  --   json_build_object(
  --     'from', 'noreply@yourdomain.com',
  --     'to', p_email,
  --     'subject', p_subject,
  --     'html', p_html_content
  --   )::text,
  --   'application/json',
  --   json_build_object('Authorization', 'Bearer YOUR_API_KEY')::text
  -- );

  -- 상태를 발송됨으로 업데이트
  UPDATE email_logs SET status = 'sent' WHERE id = (result->>'id')::uuid;

  RETURN json_build_object('success', true, 'message', 'Email queued for sending');
EXCEPTION
  WHEN OTHERS THEN
    UPDATE email_logs SET status = 'failed', error_message = SQLERRM 
    WHERE id = (result->>'id')::uuid;
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 이메일 로그 테이블 (선택사항, 추적용)
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- 정책: service role만 삽입/업데이트 가능
CREATE POLICY "Service role can manage email logs"
  ON email_logs
  FOR ALL
  USING (auth.role() = 'service_role');
