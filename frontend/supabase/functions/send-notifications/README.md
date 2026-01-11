# Send Notifications Edge Function

이 Edge Function은 캘린더 일정 알림을 발송합니다.

## 배포 방법

1. Supabase CLI 설치 (이미 설치되어 있다면 생략)
```bash
npm install -g supabase
```

2. Supabase 프로젝트에 로그인
```bash
supabase login
```

3. 프로젝트 링크
```bash
supabase link --project-ref your-project-ref
```

4. Edge Function 배포
```bash
supabase functions deploy send-notifications
```

5. 환경 변수 설정 (Supabase Dashboard에서)
- `SUPABASE_URL`: 자동 설정됨
- `SUPABASE_SERVICE_ROLE_KEY`: 자동 설정됨

## 스케줄링

이 함수를 매일 실행하려면:

1. **Supabase Dashboard에서 Cron Job 설정** (pg_cron 사용)
2. **외부 Cron 서비스 사용** (GitHub Actions, Vercel Cron 등)
3. **Supabase Database Function으로 스케줄링**

## 이메일 서비스 설정

현재 코드는 `send_email_notification` Database Function을 호출합니다.
이 함수를 생성하려면 `email_notification_function.sql` 파일을 실행하세요.

또는 Resend, SendGrid 등의 서비스를 직접 사용하도록 수정할 수 있습니다.
