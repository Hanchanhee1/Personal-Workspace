# CLI로 Edge Function 배포하기

이 가이드는 Supabase CLI를 사용하여 Edge Function을 배포하는 방법을 설명합니다.

## 📋 사전 준비

1. **Supabase CLI 설치**

⚠️ **중요**: Supabase CLI는 `npm install -g`로 설치할 수 없습니다!

### Windows에서 설치하는 방법:

#### 방법 1: Scoop 사용 (권장) ⭐

```powershell
# 1. Scoop 설치 (아직 안 했다면)
# PowerShell을 관리자 권한으로 실행 후:
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# 2. Supabase CLI 설치
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

#### 방법 2: Chocolatey 사용

```powershell
# Chocolatey 설치 (아직 안 했다면)
# PowerShell을 관리자 권한으로 실행 후:
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Supabase CLI 설치
choco install supabase
```

#### 방법 3: 직접 다운로드 (수동 설치)

1. [Supabase CLI Releases](https://github.com/supabase/cli/releases)에서 최신 버전 다운로드
2. Windows용 `.exe` 파일 다운로드
3. PATH 환경 변수에 추가

#### 방법 4: npx 사용 (임시 방법)

매번 `npx`를 사용해야 하지만, 설치 없이 사용 가능:
```bash
npx supabase --version
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy send-notifications
```

2. **설치 확인**
```bash
supabase --version
```

2. **프로젝트 정보 확인**
   - Supabase Dashboard에서 프로젝트 참조 ID 확인
   - URL 예: `https://xxxxx.supabase.co` → `xxxxx`가 프로젝트 참조 ID

## 🚀 배포 단계

### 방법 1: frontend 디렉토리에서 배포 (권장)

```bash
# 1. frontend 디렉토리로 이동
cd frontend

# 2. Supabase에 로그인 (처음 한 번만)
supabase login
# 또는 npx 사용: npx supabase login

# 3. 프로젝트 링크 (프로젝트 참조 ID 사용)
supabase link --project-ref YOUR_PROJECT_REF
# 예: supabase link --project-ref abcdefghijklmnop
# 또는 npx 사용: npx supabase link --project-ref YOUR_PROJECT_REF

# 4. Edge Function 배포
supabase functions deploy send-notifications
# 또는 npx 사용: npx supabase functions deploy send-notifications
```

### 방법 2: 프로젝트 루트에서 배포

```bash
# 1. 프로젝트 루트로 이동
cd "C:\Users\CHANHEE HAN\OneDrive\바탕 화면\archive"

# 2. Supabase 초기화 (처음 한 번만, 이미 되어있으면 생략)
supabase init

# 3. Supabase에 로그인
supabase login

# 4. 프로젝트 링크
supabase link --project-ref YOUR_PROJECT_REF

# 5. Edge Function 배포 (frontend 경로 지정)
supabase functions deploy send-notifications --project-ref YOUR_PROJECT_REF
```

## 🔧 문제 해결

### 문제 1: "No project linked" 오류

**해결 방법:**
```bash
# 프로젝트 링크 확인
supabase projects list

# 프로젝트 링크
supabase link --project-ref YOUR_PROJECT_REF
```

### 문제 2: "Function not found" 오류

**해결 방법:**
- `frontend/supabase/functions/send-notifications/index.ts` 파일이 존재하는지 확인
- 올바른 디렉토리에서 명령어 실행 확인

### 문제 3: "Permission denied" 오류

**해결 방법:**
```bash
# 다시 로그인
supabase login

# 프로젝트 권한 확인
supabase projects list
```

### 문제 4: "config.toml not found" 오류

**해결 방법:**
```bash
# frontend 디렉토리에서 실행
cd frontend
supabase functions deploy send-notifications
```

또는 프로젝트 루트에서:
```bash
supabase init
```

### 문제 5: "failed to parse environment file: .env.local" 오류

**원인**: `.env.local` 파일에 인코딩 문제나 잘못된 문자가 포함되어 있을 수 있습니다.

**해결 방법:**

1. **`.supabaseignore` 파일 생성** (이미 생성됨)
   - `frontend/.supabaseignore` 파일이 `.env.local`을 무시하도록 설정되어 있습니다.

2. **임시로 파일 이름 변경**
```powershell
# .env.local 파일을 임시로 이름 변경
Rename-Item .env.local .env.local.backup
npx supabase functions deploy send-notifications
# 배포 후 다시 이름 변경
Rename-Item .env.local.backup .env.local
```

3. **.env.local 파일 수정**
   - 파일을 UTF-8 (BOM 없음) 인코딩으로 저장
   - 특수 문자나 공백이 변수 이름에 포함되지 않았는지 확인
   - 각 줄이 `KEY=VALUE` 형식인지 확인

4. **환경 변수 파일 무시하고 배포**
```bash
# --no-verify 플래그 사용 (가능한 경우)
npx supabase functions deploy send-notifications --no-verify
```

## ✅ 배포 확인

배포가 성공하면:
```
Deploying function send-notifications...
Function send-notifications deployed successfully
```

Supabase Dashboard에서 확인:
1. Dashboard → Edge Functions
2. `send-notifications` 함수가 목록에 표시되는지 확인

## 🔑 환경 변수 설정 (CLI로)

Resend API 키를 설정하려면:

```bash
# 환경 변수 설정
supabase secrets set RESEND_API_KEY=your_resend_api_key --project-ref YOUR_PROJECT_REF
```

또는 Dashboard에서:
- Edge Functions → send-notifications → Settings → Secrets

## 📝 전체 배포 스크립트 예시

### npx 사용 (설치 불필요)

```powershell
# Windows PowerShell
cd frontend
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy send-notifications
npx supabase secrets set RESEND_API_KEY=your_key --project-ref YOUR_PROJECT_REF
```

### CLI 설치 후 사용

```powershell
# Windows PowerShell
cd frontend
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy send-notifications
supabase secrets set RESEND_API_KEY=your_key --project-ref YOUR_PROJECT_REF
```

## 🧪 테스트

배포 후 테스트:

```bash
# Edge Function 호출 테스트
curl -X POST \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-notifications
```

## 💡 팁

1. **프로젝트 참조 ID 찾기:**
   - Supabase Dashboard URL에서 확인
   - 또는: `supabase projects list` 명령어로 확인

2. **Service Role Key 찾기:**
   - Dashboard → Settings → API → service_role key

3. **배포 전 확인:**
   - `frontend/supabase/functions/send-notifications/index.ts` 파일이 올바른지 확인
   - 필요한 환경 변수가 설정되었는지 확인
