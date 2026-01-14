# 캘린더 알림 메일 설정 가이드

이 문서는 캘린더 일정에 대한 알림 메일(7일 전, 3일 전, 1일 전, 당일) 설정 방법을 설명합니다.

## 📋 사전 요구사항

1. Supabase 프로젝트 설정 완료
2. `calendar_schema.sql` 실행 완료
3. `notification_schema.sql` 실행 완료

## ⚡ 빠른 시작 (5분 안에 설정하기)

가장 빠른 방법:

1. **Database Functions 실행** (Supabase SQL Editor)
   - `frontend/supabase/migrations/20240101000000_email_notification_function.sql` 실행
   - `frontend/supabase/migrations/20240101000001_schedule_notifications.sql` 실행

2. **Edge Function 배포** (Supabase Dashboard)
   - Dashboard → Edge Functions → Create new function
   - 이름: `send-notifications`
   - `frontend/supabase/functions/send-notifications/index.ts` 내용 복사/붙여넣기
   - Deploy 클릭

3. **이메일 서비스 설정** (선택사항, 나중에 해도 됨)
   - Resend 계정 생성 및 API 키 발급
   - Edge Function Settings → Secrets에 `RESEND_API_KEY` 추가
   - `resend-version.ts` 내용으로 `index.ts` 교체

4. **스케줄러 설정** (GitHub Actions 또는 외부 Cron)
   - `.github/workflows/send-notifications.yml` 파일이 이미 생성되어 있음
   - GitHub Secrets에 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` 추가

## 🚀 상세 설정 단계

### 1. Database Functions 생성

Supabase SQL Editor에서 다음 파일들을 순서대로 실행하세요:

```sql
-- 1. Email notification function
-- frontend/supabase/migrations/20240101000000_email_notification_function.sql 실행

-- 2. Schedule notification function
-- frontend/supabase/migrations/20240101000001_schedule_notifications.sql 실행
```

### 2. Edge Function 배포

#### 방법 A: Supabase Dashboard 사용 (가장 간단, 권장) ⭐

**단계별 가이드:**

1. **Supabase Dashboard 접속**
   - https://app.supabase.com 접속
   - 프로젝트 선택

2. **Edge Functions 메뉴로 이동**
   - 좌측 사이드바에서 **Edge Functions** 클릭
   - 또는 상단 메뉴에서 찾기

3. **새 Function 생성**
   - **Create a new function** 또는 **New Function** 버튼 클릭

4. **Function 설정**
   - Function 이름: `send-notifications` 입력
   - Function 코드 영역에 아래 파일 내용 복사:
     - 파일 위치: `frontend/supabase/functions/send-notifications/index.ts`
     - 파일을 열어서 전체 내용 복사 (Ctrl+A, Ctrl+C)
     - Dashboard 코드 영역에 붙여넣기 (Ctrl+V)

5. **배포**
   - **Deploy** 또는 **Save** 버튼 클릭
   - 배포 완료까지 몇 초 대기

6. **환경 변수 설정** (Resend 사용 시)
   - Function 페이지에서 **Settings** 탭 클릭
   - **Secrets** 섹션에서 환경 변수 추가:
     - Name: `RESEND_API_KEY`
     - Value: Resend에서 발급받은 API 키
   - **Save** 클릭

**참고**: 
- Resend를 사용하려면 `resend-version.ts` 파일 내용을 사용하세요
- 파일 경로: `frontend/supabase/functions/send-notifications/resend-version.ts`

#### 방법 B: Supabase CLI 사용 ⚡

**단계별 가이드:**

1. **Supabase CLI 설치** ⚠️

⚠️ **중요**: `npm install -g supabase`는 작동하지 않습니다!

**Windows에서 설치하는 방법:**

**방법 1: Scoop 사용 (권장)**
```powershell
# PowerShell을 관리자 권한으로 실행
# 1. Scoop 설치 (아직 안 했다면)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# 2. Supabase CLI 설치
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**방법 2: Chocolatey 사용**
```powershell
# PowerShell을 관리자 권한으로 실행
# 1. Chocolatey 설치 (아직 안 했다면)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 2. Supabase CLI 설치
choco install supabase
```

**방법 3: npx 사용 (설치 없이)**
```bash
# 매번 npx를 사용 (설치 불필요)
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy send-notifications
```

**설치 확인:**
```bash
supabase --version
```

2. **프로젝트 참조 ID 확인**
   - Supabase Dashboard URL에서 확인
   - 예: `https://xxxxx.supabase.co` → `xxxxx`가 프로젝트 참조 ID
   - 또는 Dashboard → Settings → General → Reference ID

3. **frontend 디렉토리로 이동 및 배포**
```bash
# frontend 디렉토리로 이동
cd frontend

# Supabase에 로그인 (처음 한 번만)
supabase login

# 프로젝트 링크
supabase link --project-ref YOUR_PROJECT_REF
# 예: supabase link --project-ref abcdefghijklmnop

# Edge Function 배포
supabase functions deploy send-notifications
```

4. **환경 변수 설정** (Resend 사용 시)
```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key --project-ref YOUR_PROJECT_REF
```

**상세한 CLI 가이드는 `CLI_DEPLOY_GUIDE.md` 파일을 참고하세요.**

**문제 해결**:
- "No project linked" 오류 → `supabase link --project-ref YOUR_PROJECT_REF` 다시 실행
- "Function not found" 오류 → `frontend/supabase/functions/send-notifications/index.ts` 파일 확인
- "config.toml not found" 오류 → `frontend` 디렉토리에서 명령어 실행 확인
- **"failed to parse environment file: .env.local" 오류** → `.supabaseignore` 파일이 생성되어 `.env.local`을 무시하도록 설정됨. 그래도 문제가 있으면 `.env.local` 파일을 임시로 이름 변경하거나 UTF-8 (BOM 없음) 인코딩으로 저장

### 3. 이메일 서비스 설정

#### 옵션 1: Resend 사용 (권장)

1. [Resend](https://resend.com)에서 계정 생성 및 API 키 발급
2. 도메인 인증 (예: yourdomain.com)
3. Edge Function의 `resend-version.ts`를 `index.ts`로 교체
4. Supabase Dashboard → Edge Functions → send-notifications → Settings
5. 환경 변수 추가:
   - `RESEND_API_KEY`: Resend API 키

#### 옵션 2: SendGrid 사용

1. [SendGrid](https://sendgrid.com)에서 계정 생성 및 API 키 발급
2. Edge Function 수정하여 SendGrid API 사용
3. 환경 변수에 `SENDGRID_API_KEY` 추가

#### 옵션 3: Supabase SMTP 설정

1. Supabase Dashboard → Settings → Auth → SMTP Settings
2. SMTP 서버 정보 입력
3. Database Function에서 Supabase의 이메일 기능 사용

### 4. 스케줄러 설정

알림을 매일 자동으로 발송하려면 다음 중 하나를 선택하세요:

#### 방법 A: Supabase pg_cron 사용 (Pro 플랜 필요)

```sql
-- pg_cron 확장 활성화 (Supabase 지원 시)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 매일 오전 9시(UTC)에 알림 발송
SELECT cron.schedule(
  'send-daily-notifications',
  '0 9 * * *',
  $$SELECT process_pending_notifications();$$
);
```

#### 방법 B: GitHub Actions 사용 (무료)

`.github/workflows/send-notifications.yml` 파일 생성:

```yaml
name: Send Calendar Notifications

on:
  schedule:
    - cron: '0 9 * * *'  # 매일 UTC 9시 (한국시간 오후 6시)
  workflow_dispatch:  # 수동 실행 가능

jobs:
  send-notifications:
    runs-on: ubuntu-latest
    steps:
      - name: Call Supabase Edge Function
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}" \
            https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-notifications
```

GitHub Secrets에 추가:
- `SUPABASE_ANON_KEY`: Supabase Anon Key

#### 방법 C: Vercel Cron 사용

`vercel.json` 파일 생성:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-notifications",
      "schedule": "0 9 * * *"
    }
  ]
}
```

API Route 생성: `pages/api/cron/send-notifications.ts` 또는 `app/api/cron/send-notifications/route.ts`

#### 방법 D: 외부 Cron 서비스

- [Cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)

위 서비스에서 매일 Edge Function URL을 호출하도록 설정:
```
POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-notifications
Headers:
  Authorization: Bearer YOUR_SERVICE_ROLE_KEY
  apikey: YOUR_SERVICE_ROLE_KEY
```

### 5. 테스트

#### 수동 테스트

1. Supabase SQL Editor에서 테스트 일정 생성:
```sql
INSERT INTO calendar_events (user_id, title, event_date)
VALUES (
  'YOUR_USER_ID',
  '테스트 일정',
  CURRENT_TIMESTAMP + INTERVAL '7 days'
);
```

2. Edge Function 수동 호출:
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-notifications
```

3. 이메일 수신 확인

## 📧 알림 메일 내용

알림 메일은 다음 정보를 포함합니다:
- 일정 제목
- 일정 날짜 (한국어 형식)
- 알림 시점 (7일 전, 3일 전, 1일 전, 당일)
- 예쁜 HTML 형식

## 🔍 문제 해결

### Edge Function 배포가 안 되는 경우

**문제 1: CLI 명령어가 작동하지 않음**
- ✅ **해결**: Dashboard 방법(방법 A)을 사용하세요. 더 간단하고 확실합니다.

**문제 2: Dashboard에서 Function을 찾을 수 없음**
- Supabase Dashboard → 좌측 메뉴에서 **Edge Functions** 찾기
- 상단 검색창에 "edge" 또는 "function" 검색
- 프로젝트가 Edge Functions 기능을 지원하는지 확인 (대부분 지원)

**문제 3: 파일을 찾을 수 없음**
- 파일 경로: `frontend/supabase/functions/send-notifications/index.ts`
- VS Code나 텍스트 에디터로 파일 열기
- 전체 내용 선택 (Ctrl+A) 후 복사 (Ctrl+C)

### 알림이 발송되지 않는 경우

1. **`pending_notifications` 뷰 확인**:
```sql
SELECT * FROM pending_notifications;
```
   - 결과가 비어있으면 알림 대상이 없는 것입니다
   - 테스트 일정을 생성해보세요

2. **`notification_logs` 테이블 확인**:
```sql
SELECT * FROM notification_logs ORDER BY sent_at DESC LIMIT 10;
```

3. **Edge Function 로그 확인**:
   - Supabase Dashboard → Edge Functions → send-notifications → **Logs** 탭
   - 에러 메시지 확인

4. **이메일 서비스 로그 확인** (Resend/SendGrid 등)
   - 각 서비스의 Dashboard에서 발송 로그 확인

5. **환경 변수 확인**:
   - Edge Function Settings → Secrets 확인
   - `RESEND_API_KEY` 또는 `SENDGRID_API_KEY`가 올바르게 설정되었는지 확인

### 중복 알림 방지

`notification_logs` 테이블이 이미 발송된 알림을 추적하므로, 같은 알림은 한 번만 발송됩니다.

## 📝 참고사항

- 알림은 매일 한 번 실행됩니다
- 각 일정에 대해 각 시점(7일 전, 3일 전, 1일 전, 당일)마다 한 번씩만 발송됩니다
- 이미 발송된 알림은 `notification_logs`에 기록되어 중복 발송을 방지합니다
- 이메일 서비스의 일일 발송 한도를 확인하세요
