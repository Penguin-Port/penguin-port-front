# Cloudflare Pages 분리 배포

같은 GitHub 저장소를 Cloudflare Pages 프로젝트 두 개에 연결합니다.

## 관리자 앱

- 프로젝트 이름 예시: `penguin-port-admin`
- 프로덕션 브랜치: `main`
- 빌드 명령: `npm run build:admin`
- 출력 디렉터리: `dist`
- 시작 주소: `/admin/dashboard`

환경변수:

```env
VITE_API_BASE_URL=https://<backend-domain>
VITE_ADMIN_USERNAME=<demo-admin-username>
VITE_ADMIN_PASSWORD=<demo-admin-password>
```

## 사용자 앱

- 프로젝트 이름 예시: `penguin-port-customer`
- 프로덕션 브랜치: `main`
- 빌드 명령: `npm run build:customer`
- 출력 디렉터리: `dist`
- 고객 시작 주소: `/connect?orderClaim=<token>`
- 데모 POS 주소: `/app/demo-pos`

환경변수:

```env
VITE_API_BASE_URL=https://<backend-domain>
VITE_USE_CUSTOMER_API=1
VITE_CUSTOMER_APP_URL=https://penguin-port-customer.pages.dev
VITE_DEMO_STORE_ID=<demo-store-id>
VITE_DEMO_PRODUCT_ID=<demo-product-id>
```

## 백엔드 설정

백엔드 CORS 허용 목록에 두 Pages 도메인을 모두 등록해야 합니다.

```text
https://penguin-port-admin.pages.dev
https://penguin-port-customer.pages.dev
```

`public/_redirects`는 `/connect?orderClaim=...`처럼 하위 경로로 직접 접속해도 React Router가 처리할 수 있게 합니다.

로컬의 기본 `npm run dev`는 `all` 모드라 사용자와 관리자 경로를 모두 사용할 수 있습니다.
