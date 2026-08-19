# Penguin Port Frontend 상세 인수인계

작성일: 2026-08-08  
작성 목적: Codex 대화 컨텍스트가 거의 끝나가므로, 다음 Codex 또는 노트북 환경에서 작업을 바로 이어가기 위한 상세 인수인계 문서.

## 0. 프로젝트 위치와 레포

프론트엔드 로컬 경로:

```text
D:\Documents\PenguinPort\penguin-port-front
```

백엔드 로컬 경로:

```text
D:\Documents\PenguinPort\penguin-port-back
```

프론트 GitHub:

```text
https://github.com/Penguin-Port/penguin-port-front.git
```

백엔드 GitHub:

```text
https://github.com/Penguin-Port/penguin-port-back.git
```

사용자 GitHub 계정:

```text
yupo5710
```

파트너 GitHub 계정:

```text
anwjrdid
```

파트너 담당:

```text
관리자 Admin 페이지
```

사용자 담당:

```text
고객 Customer/User 페이지
```

## 1. 사용자 선호와 작업 방식

- 답변은 한국어.
- 친근하지만 실무적으로 명확하게.
- 사용자는 Git 흐름, 브랜치 기준, PR 대상, merge 가능 여부를 자주 확인한다.
- 사용자는 커밋/푸시를 직접 하는 것을 선호한다.
- Codex는 사용자가 명시적으로 요청하기 전에는 커밋/푸시하지 않는 편이 좋다.
- 새 브랜치는 반드시 최신 `develop` 기준인지 확인해야 한다.
- 이전 실수로 `main` 기준 브랜치가 만들어졌던 적이 있으므로, 이후 작업은 `develop` 기준을 특히 확인해야 한다.

## 2. 참고 문서

사용자가 제공한 주요 PDF:

```text
D:/Desktop/Smart_WiFi_Pass_Frontend_Spec.pdf
D:/Desktop/Smart_WiFi_Pass_Frontend_MVP_Spec.pdf
D:/Desktop/Smart_WiFi_Pass_Backend_Spec.pdf
D:/Desktop/Smart_WiFi_Pass_API_Spec_done.pdf
```

현재 우선순위는 전체 기능명세서가 아니라:

```text
Smart_WiFi_Pass_Frontend_MVP_Spec.pdf
```

MVP 고객 포털 핵심 흐름:

```text
1. QR 진입
2. orderClaim exchange
3. 매장/주문/제공시간 표시
4. OTP 발송
5. OTP 확인
6. 성공 시 Portal Session 보관
7. 이용 시작 activate
8. 이용권 홈
9. GET pass polling 또는 focus 시 재요청
10. 타이머 표시
11. 리워드 choose
12. 만료/오류/네트워크 실패 화면
13. privacy 접기 문구
```

백엔드 Public API 매핑:

```text
POST /pos/orders
POST /public/order-claims/exchange
POST /public/otp/send
POST /public/otp/confirm
POST /public/passes/{id}/activate
GET /public/passes/{id}
GET /public/upsell-hint
GET /public/rewards/grants/{grantId}/options
POST /public/rewards/grants/{grantId}/choose
```

고객 Public API 인증 헤더:

```http
X-Portal-Session: <portalSession>
```

## 3. 현재 프론트 브랜치 상태

현재 브랜치:

```bash
feature/customer-api-integration-prep
```

현재 로컬 상태를 마지막으로 확인했을 때:

```text
HEAD -> feature/customer-api-integration-prep
origin/feature/customer-api-integration-prep
```

최신 커밋:

```text
eee2e7c refactor: 고객 포털 API 연동 준비
```

최근 로그:

```text
eee2e7c (HEAD -> feature/customer-api-integration-prep, origin/feature/customer-api-integration-prep) refactor: 고객 포털 API 연동 준비
bc81119 Merge branch 'feature/customer-portal-figma-ui' into feature/customer-api-integration-prep
95b6662 (origin/develop, develop) Merge pull request #7 from Penguin-Port/feature/admin-ai-recommendations
d90c65c feat: AI 타임세일 추천 생성 및 수정 기능 구현
581280a (origin/feature/customer-portal-figma-ui, feature/customer-portal-figma-ui) feat:고객 포털 Figma UI 적용
750bbec Merge pull request #6 from Penguin-Port/feature/customer-otp-flow
2f55e8b feat: 고객 포털 이용권 타이머 상태 정리
3d62df5 refactor: 고객 포털 API mock 흐름 정렬
4ac8fe4 feat: 고객 포털 비회원 OTP 흐름 추가
605973d feat: 고객 포털 QR 진입 처리 추가
```

중요:

- `feature/customer-api-integration-prep`는 이미 push 됨.
- 사용자가 이 브랜치로 PR까지 생성했다고 말함.
- 단, `docs/codex-handoff.md`는 `eee2e7c` 커밋에 포함되지 않았고, 현재 untracked 상태로 남아 있었다.
- 이 문서를 다음 노트북에서도 보려면 별도 커밋/푸시 필요.

문서 커밋 추천:

```bash
git add docs/codex-handoff.md
git commit -m "docs: 고객 포털 작업 인수인계 추가"
git push
```

## 4. 지금까지 완료된 PR/브랜치 흐름

### 4.1 고객 포털 base UI

브랜치:

```text
feature/customer-portal-base-ui-from-develop
```

커밋:

```text
9d7497b feat: 고객 포털 진입 화면 개선
```

PR:

```text
Merge pull request #4 from Penguin-Port/feature/customer-portal-base-ui-from-develop
```

상태:

```text
develop에 merge 완료
```

주요 파일:

```text
src/App.tsx
src/api/index.ts
src/api/customer.ts
src/routes/customer/CustomerPortalPage.tsx
src/styles/customer.css
```

### 4.2 고객 포털 OTP 흐름

브랜치:

```text
feature/customer-otp-flow
```

PR:

```text
Merge pull request #6 from Penguin-Port/feature/customer-otp-flow
```

상태:

```text
develop에 merge 완료
```

주요 커밋:

```text
605973d feat: 고객 포털 QR 진입 처리 추가
4ac8fe4 feat: 고객 포털 비회원 OTP 흐름 추가
3d62df5 refactor: 고객 포털 API mock 흐름 정렬
2f55e8b feat: 고객 포털 이용권 타이머 상태 정리
```

주요 내용:

- `/connect?orderClaim=...` 읽기.
- 비회원 전화번호 입력 후 OTP 발송/확인 mock.
- 데모 OTP 코드: `123456`.
- OTP 성공 시 `portalSession` mock 저장.
- `sessionStorage` 사용.
- `portalSession` 이후 URL에서 claim 제거.
- 이용권 활성화 mock.
- 남은 시간 타이머 mock.
- F5 또는 `/connect` 재진입 시 sessionStorage 기반 active 복구.

### 4.3 고객 포털 Figma UI 적용

브랜치:

```text
feature/customer-portal-figma-ui
```

커밋:

```text
581280a feat:고객 포털 Figma UI 적용
```

상태:

- 사용자가 push 완료.
- PR 생성 완료.
- 이후 `feature/customer-api-integration-prep` 브랜치에 merge됨.

Figma 디자인 기반 화면:

```text
01 QR 진입
02 본인인증
03 이용 시작
04 이용권 홈 / 이용 중
05 리워드 선택
06 쿠폰함
07 연장 안내
08 만료
09 연결 확인 / blocked
10 오류
11 개인정보 · 보안 안내
```

주요 반영:

- 기존 고객 포털을 Figma 기준 360px 모바일 화면 구조로 재구성.
- 메인 버튼 검정 계열.
- accent `#ff385c`.
- 하단 개발용 step rail 제거.
- 화면 전환을 URL query `screen` 값과 동기화.
- 브라우저 뒤로가기 동작 복구.

테스트 URL:

```text
http://127.0.0.1:5173/connect?orderClaim=test123
```

기본 mock 흐름:

```text
이용권 받기
→ 전화번호 01011111111
→ 인증번호 받기
→ 123456 입력
→ 인증번호 확인
→ 동의 2개 체크
→ Wi-Fi 이용 시작
→ 이용 중 화면
```

브라우저 뒤로가기 확인:

```text
active → coupons → 뒤로가기 → active
active → privacy → 뒤로가기 → active
```

### 4.4 고객 포털 API 연동 준비

브랜치:

```text
feature/customer-api-integration-prep
```

커밋:

```text
eee2e7c refactor: 고객 포털 API 연동 준비
```

상태:

- push 완료.
- 사용자가 PR까지 생성했다고 말함.

주요 목적:

```text
실제 API를 바로 붙이는 것이 아니라,
화면이 mock 함수에 직접 의존하지 않도록 customer service 계층을 만드는 것.
```

변경 파일:

```text
src/api/client.ts
src/api/customer.ts
src/config/env.ts
src/routes/customer/CustomerPortalPage.tsx
src/routes/customer/customerService.ts
```

변경 내용:

`src/api/client.ts`

- `apiDataRequest<T>()` 추가.
- 백엔드 응답 envelope `{ data, meta }`에서 `data`만 반환.
- 기존 `apiRequest<T>()`는 admin 쪽 영향 방지를 위해 유지.

`src/api/customer.ts`

- `customerApi`가 `apiDataRequest`를 사용하도록 변경.
- Customer API 함수들이 실제 응답 데이터만 반환.
- `OtpSendResponse.demoCode`를 `string | null`로 수정.
- `UpsellHintResponse`에 `nextTierBenefitsPreview`, `suggestedItems` 선택 필드 추가.
- 리워드 선택 API 경로를 `/public/rewards/grants/{grantId}/choose`로 맞춤.

`src/config/env.ts`

- `VITE_USE_CUSTOMER_API=1` 플래그 추가.

`src/routes/customer/customerService.ts`

- 새 파일.
- `CustomerPortalService` 인터페이스 정의.
- 기본은 mock service 사용.
- `VITE_API_BASE_URL`이 있고 `VITE_USE_CUSTOMER_API=1`이면 실제 `customerApi` 사용.

`src/routes/customer/CustomerPortalPage.tsx`

- mock 함수 직접 import 제거.
- 화면은 `customerPortalService`만 호출.
- 실제 API 전환 시 화면 로직 수정 범위 축소.

검증:

```bash
npm.cmd run build
```

성공 확인됨.

## 5. 현재 작업트리 상태

마지막 확인 기준:

```text
?? docs/
```

즉 API prep 코드는 커밋/푸시됐지만, 이 인수인계 문서는 아직 Git에 포함되지 않았다.

이 문서를 살리려면 반드시:

```bash
git add docs/codex-handoff.md
git commit -m "docs: 고객 포털 작업 인수인계 추가"
git push
```

## 6. 실제 API 사용 준비

현재 고객 포털은 기본적으로 mock을 사용한다.

실제 API를 쓰려면 프론트 `.env`에 아래를 설정한다.

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_USE_CUSTOMER_API=1
```

그 다음 프론트 실행:

```bash
cd "D:\Documents\PenguinPort\penguin-port-front"
npm run dev
```

프론트 테스트 URL:

```text
http://127.0.0.1:5173/connect?orderClaim=<실제_orderClaim>
```

주의:

- `orderClaim=test123`은 mock에서만 자연스럽게 동작.
- 실제 API 모드에서는 백엔드가 알고 있는 실제 orderClaim이 필요.
- 실제 orderClaim은 `POST /pos/orders`로 주문을 생성해야 나온다.

## 7. 백엔드 실행 준비

백엔드 위치:

```text
D:\Documents\PenguinPort\penguin-port-back
```

백엔드 `.env.example`에는 로컬 SQLite 기본값이 있다.

기본 실행 흐름:

```bash
cd "D:\Documents\PenguinPort\penguin-port-back"

copy .env.example .env
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
python -m app.seed
uvicorn app.main:app --reload --env-file .env
```

주의:

- 현재 환경에서 `python` 명령이 안 잡힌 적이 있었다.
- 만약 `python`이 안 되면 `py` 또는 Codex bundled Python 경로를 확인해야 한다.
- PowerShell `Get-Content`로 백엔드 README를 보면 한글이 깨져 보일 수 있다. 실제 파일은 UTF-8일 가능성이 크다.

백엔드 기본 `.env.example` 주요 값:

```env
DATABASE_URL=sqlite:///./smartpass.db
JWT_SECRET=change-this-to-a-long-random-secret
PHONE_LOOKUP_SECRET=change-this-phone-secret
DEMO_KEY=demo-key
DEMO_OTP_CODE=123456
NOTIFICATION_PROVIDER=DEMO
WIFI_NETWORK_PROVIDER=DEMO
TREND_PROVIDER=DEMO
USE_CELERY=0
```

## 8. 백엔드에서 확인된 Public API 사실

백엔드 최신 코드에서 확인한 내용:

`POST /public/order-claims/exchange`

응답 `data` 안에 포함:

```text
verificationTicket
requiresVerification
passId
expiresIn
storeName
orderNo
items
paidAmount
providedMinutes
```

`POST /public/otp/send`

요청:

```json
{
  "verificationTicket": "...",
  "phone": "01011111111"
}
```

응답:

```text
challengeId
expiresAt
maxAttempts
demoCode
```

`POST /public/otp/confirm`

요청:

```json
{
  "challengeId": "...",
  "code": "123456"
}
```

응답:

```text
portalSession
passId
expiresIn
```

`POST /public/passes/{passId}/activate`

헤더:

```http
X-Portal-Session: <portalSession>
```

응답:

```text
passId
status
issuedAt
activatedAt
expiresAt
remainingSeconds
version
policySnapshot
```

`GET /public/passes/{passId}`

헤더:

```http
X-Portal-Session: <portalSession>
```

응답:

```text
passId
status
issuedAt
activatedAt
expiresAt
remainingSeconds
version
policySnapshot
dailyTotal
```

`GET /public/upsell-hint`

응답:

```text
dailyTotal
nextTierAmount
remainingAmountToNextTier
nextTierBenefitsPreview
suggestedItems
```

`GET /public/rewards/grants/{grantId}/options`

응답:

```text
grantId
tierAmount
status
options[]
```

`POST /public/rewards/grants/{grantId}/choose`

요청:

```json
{
  "benefitId": "...",
  "fulfillMode": "IMMEDIATE"
}
```

또는:

```json
{
  "benefitId": "...",
  "fulfillMode": "COUPON_7D"
}
```

## 9. 다음 우선순위

### 9.1 가장 먼저 할 것

인수인계 문서 커밋:

```bash
cd "D:\Documents\PenguinPort\penguin-port-front"
git status
git add docs/codex-handoff.md
git commit -m "docs: 고객 포털 작업 인수인계 추가"
git push
```

### 9.2 API prep PR merge 확인

GitHub에서:

```text
feature/customer-api-integration-prep → develop
```

PR이 merge됐는지 확인.

merge 후 로컬:

```bash
git switch develop
git pull origin develop
```

### 9.3 다음 브랜치 추천

실제 API 테스트용 브랜치:

```bash
git switch develop
git pull origin develop
git switch -c feature/customer-real-api-smoke
```

또는 Demo POS를 먼저 만들면:

```bash
git switch -c feature/demo-pos-order-claim
```

추천은 `feature/demo-pos-order-claim`.

이유:

- 실제 고객 포털 API 테스트에는 실제 orderClaim이 필요하다.
- 실제 orderClaim은 POS 주문 생성으로 나온다.
- MVP는 `POS 주문 → QR/orderClaim → Customer Portal` 흐름이므로 Demo POS가 있어야 전체 시연이 가능하다.

## 10. 다음 개발 작업 후보

### 후보 A. Demo POS mock / 실제 orderClaim 발급 도구

목적:

```text
주문 생성 → orderClaim 획득 → /connect?orderClaim=... 이동
```

필요 API:

```text
POST /pos/orders
```

필요 화면:

```text
/app/demo-pos
```

기능:

- 매장/메뉴 mock 표시.
- 주문 생성 버튼.
- 백엔드 `POST /pos/orders` 호출.
- 응답의 orderClaim token 표시.
- QR 대신 링크 버튼으로 `/connect?orderClaim=...` 이동.

### 후보 B. 실제 Customer API smoke test

목적:

```text
VITE_USE_CUSTOMER_API=1 상태에서 고객 포털이 실제 백엔드와 통신하는지 확인
```

작업:

- `.env`에 `VITE_API_BASE_URL`, `VITE_USE_CUSTOMER_API=1` 설정.
- 백엔드 서버 실행.
- 실제 orderClaim 확보.
- `/connect?orderClaim=...` 접속.
- exchange/sendOtp/confirm/activate/getPass 확인.

### 후보 C. pass polling/focus refetch

목적:

```text
이용 중 화면에서 GET /public/passes/{passId}를 주기적으로 또는 포커스 시 재조회
```

문서 기준 중요:

- 서버 기준 `remainingSeconds`를 신뢰.
- 프론트 타이머는 표시용.
- focus 시 재요청으로 연장/만료 상태 반영.

권장 구현:

- active 화면 진입 시 `getPass`.
- `setInterval` 30초 또는 60초 polling.
- `window.focus` 이벤트로 재조회.
- 응답 `remainingSeconds`, `status`, `expiresAt`, `version` 반영.

## 11. 현재 코드 구조

고객 포털 주요 파일:

```text
src/routes/customer/CustomerPortalPage.tsx
src/routes/customer/customerMock.ts
src/routes/customer/customerMockService.ts
src/routes/customer/customerService.ts
src/routes/customer/customerTypes.ts
src/styles/customer.css
src/api/customer.ts
src/api/client.ts
src/config/env.ts
```

역할:

`CustomerPortalPage.tsx`

- 화면 상태와 고객 포털 흐름 담당.
- 화면 전환은 `screen` URL query와 동기화.
- mock/API 호출은 직접 하지 않고 `customerPortalService` 사용.

`customerService.ts`

- mock service와 실제 API service를 같은 인터페이스로 묶음.
- `env.useCustomerApi && isApiConfigured`이면 실제 API 사용.
- 아니면 mock 사용.

`customerMockService.ts`

- mock exchange/sendOtp/confirm/activate.
- 데모 OTP는 `123456`.

`customerMock.ts`

- Figma 화면용 mock 데이터.
- storeName, orderNo, 제공 시간, 추천 메뉴, reward options.

`api/customer.ts`

- 백엔드 Public API 타입과 client.
- 현재 customer API는 `data`만 반환.

`api/client.ts`

- `apiRequest<T>`: envelope 반환.
- `apiDataRequest<T>`: `data`만 반환.

## 12. 주의할 버그/이슈

### 12.1 PowerShell 한글 깨짐

PowerShell `Get-Content`로 보면 한글이 깨져 보이는 경우가 많았다.

실제 UTF-8 파일 확인은 Node로 하는 게 좋다:

```bash
node -e "const fs=require('fs'); const s=fs.readFileSync('src/routes/customer/CustomerPortalPage.tsx','utf8'); console.log(s.slice(0,1000));"
```

### 12.2 F5 후 active로 가는 현상

이전 버그:

- OTP 성공 후 화면이 `start`로 가야 하는데 다시 QR로 돌아갔다.
- 원인은 `sessionStorage` 변경 후 URL sync effect가 `screen`을 덮어쓴 것.

수정:

- URL query `screen` 기반 전환.
- `goToScreen()` helper 사용.

### 12.3 뒤로가기 안 됐던 문제

이전 문제:

- 화면 전환을 React state만으로 해서 브라우저 뒤로가기가 안 됨.

수정:

- `/connect?screen=...` 방식으로 history push.

### 12.4 실제 API 모드에서 orderClaim 필요

mock에서는 `test123`으로도 되지만 실제 백엔드에서는 유효한 orderClaim이 필요하다.

따라서 실제 API 연결 전에:

- POS 주문 생성 API 사용.
- 또는 Demo POS 화면 제작.

## 13. 노트북에서 이어서 작업하는 방법

### 13.1 처음 clone하는 경우

```bash
git clone https://github.com/Penguin-Port/penguin-port-front.git
cd penguin-port-front
git switch feature/customer-api-integration-prep
npm install
npm run dev
```

### 13.2 이미 clone한 경우

```bash
cd penguin-port-front
git fetch origin
git switch feature/customer-api-integration-prep
git pull origin feature/customer-api-integration-prep
npm install
npm run dev
```

### 13.3 백엔드도 같이 clone하는 경우

권장 폴더 구조:

```text
D:\Documents\PenguinPort
  penguin-port-front
  penguin-port-back
```

백엔드:

```bash
git clone https://github.com/Penguin-Port/penguin-port-back.git
cd penguin-port-back
```

## 14. 다음 Codex에게 바로 줄 요약

다음 Codex 첫 요청으로 쓸 수 있는 요약:

```md
Penguin Port 프론트 작업 중입니다.

프론트 위치:
D:\Documents\PenguinPort\penguin-port-front

백엔드 위치:
D:\Documents\PenguinPort\penguin-port-back

현재 고객 포털은:
- OTP flow PR merge 완료
- Figma UI PR 완료
- API integration prep 브랜치 feature/customer-api-integration-prep push 및 PR 생성 완료

현재 핵심 구조:
- CustomerPortalPage는 customerPortalService만 호출
- customerPortalService는 기본 mock 사용
- VITE_API_BASE_URL + VITE_USE_CUSTOMER_API=1이면 실제 customerApi 사용
- customerApi는 apiDataRequest로 백엔드 {data, meta} 중 data만 반환

다음 우선순위:
1. docs/codex-handoff.md가 커밋됐는지 확인
2. feature/customer-api-integration-prep PR merge 여부 확인
3. 최신 develop 기준 새 브랜치 생성
4. Demo POS/orderClaim 발급 흐름 또는 실제 API smoke test 진행

주의:
- 실제 API 모드에서는 /connect?orderClaim=test123이 아니라 백엔드가 발급한 실제 orderClaim 필요
- PowerShell에서 한글이 깨져 보여도 실제 파일은 UTF-8일 수 있음
- 사용자는 커밋/푸시를 직접 선호함
```

