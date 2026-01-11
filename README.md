# 라이프 대시보드 (Life Dashboard) 모노레포

이 프로젝트는 프론트엔드와 백엔드로 나뉘어 관리됩니다.
모든 개발 및 기여 시 아래의 **개발 규칙**을 반드시 준수해야 합니다.

## ⚠️ 개발 규칙 (Development Rules)

1. **모든 주석 및 설명은 한국어로 작성합니다.** (All comments and usage instructions must be in Korean.)
2. **새로운 기능 추가 시 `README.md`에 실행 방법을 업데이트합니다.**

## 구조

- **frontend/**: Next.js + Tailwind CSS + TypeScript 기반의 웹 대시보드 애플리케이션.
- **backend/**: 서버 및 API 코드 (예정).

## 🚀 시작하기 (Getting Started)

### 프론트엔드 (Frontend)

프론트엔드 개발 서버를 실행하려면 아래 **모든 단계**를 순서대로 수행하세요.

#### 1. 선행 작업 (Prerequisites)

이 프로젝트는 **Supabase**를 백엔드로 사용합니다. 실행 전 아래 설정이 필요합니다.

1.  **Supabase 프로젝트 생성**: [Supabase Console](https://supabase.com/dashboard/)에서 새 프로젝트를 생성합니다.
2.  **테이블 생성 (SQL)**: `SQL Editor`에서 아래 파일들의 내용을 복사하여 실행합니다.
    - `frontend-legacy/supabase_schema.sql` (기본 유저 및 Todo, Diary, Places 테이블)
    - `frontend/supabase_weather_schema.sql` (날씨 즐겨찾기 테이블)
    - `frontend/calendar_schema.sql` (캘린더 이벤트 테이블)
    - `frontend/notification_schema.sql` (알림 로그 테이블 및 뷰)
3.  **인증 설정 (Authentication)**:
    - `Authentication` > `Providers`에서 `Google` 또는 `Email` (Magic Link)을 활성화합니다.
    - Google 로그인의 경우 Google Cloud Console에서 클라이언트 ID를 생성하여 등록해야 합니다.
4.  **캘린더 알림 기능 설정 (선택사항)**:
    - 자세한 설정 방법은 `frontend/NOTIFICATION_SETUP.md` 파일을 참고하세요.
    - 이메일 알림을 받으려면 Resend 계정 생성 및 Edge Function 배포가 필요합니다.

#### 2. 환경 변수 설정

`frontend` 디렉토리에 `.env.local` 파일을 생성하고 아래 내용을 입력합니다.
`Project URL`과 `Anon key`는 Supabase 프로젝트 설정의 `API` 섹션에서 확인할 수 있습니다.

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

#### 3. 설치 및 실행

1.  **디렉토리 이동**:

    ```bash
    cd frontend
    ```

2.  **의존성 설치**:

    ```bash
    npm install
    ```

3.  **개발 서버 실행**:

    ```bash
    npm run dev
    ```

4.  **웹사이트 접속**:
    브라우저에서 `http://localhost:3000` 접속.

### 백엔드 (Backend)

_아직 구현되지 않았습니다. 추후 업데이트 예정._

## 📧 주요 기능

### 캘린더 알림 기능

캘린더 일정에 대한 자동 이메일 알림 기능이 포함되어 있습니다.

- **알림 시점**: 일정 7일 전, 3일 전, 1일 전, 당일
- **자동 발송**: GitHub Actions를 통한 매일 자동 실행
- **이메일 서비스**: Resend 사용 (무료 플랜 지원)

**설정 방법:**
1. `frontend/NOTIFICATION_SETUP.md` 파일 참고
2. Supabase Database Functions 실행
3. Edge Function 배포
4. Resend API 키 설정
5. GitHub Actions 워크플로우 설정

자세한 내용은 `frontend/NOTIFICATION_SETUP.md`를 확인하세요.
